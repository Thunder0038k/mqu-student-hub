-- Update units table to separate unit prefix and number
ALTER TABLE public.units 
ADD COLUMN unit_prefix TEXT,
ADD COLUMN unit_number TEXT;

-- Update existing data to split unit_code
UPDATE public.units 
SET 
  unit_prefix = REGEXP_REPLACE(unit_code, '[0-9]+$', ''),
  unit_number = REGEXP_REPLACE(unit_code, '^[A-Za-z]+', '')
WHERE unit_code IS NOT NULL;

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'submitted', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assignments
CREATE POLICY "Users can view their own assignments" 
ON public.assignments 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assignments" 
ON public.assignments 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assignments" 
ON public.assignments 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own assignments" 
ON public.assignments 
FOR DELETE 
USING (user_id = auth.uid());

-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('lecture', 'tutorial', 'exam', 'assignment', 'general')),
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- Store JSON for recurrence rules
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for calendar events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar events
CREATE POLICY "Users can view their own calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (user_id = auth.uid());

-- Create triggers for updated_at columns
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_units_user_id ON public.units(user_id);