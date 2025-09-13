-- Create a table for email signups
CREATE TABLE public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'unknown', -- track which form (hero, email-capture)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public signup)
CREATE POLICY "Anyone can sign up for emails" 
ON public.email_signups 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading for admin purposes (you can modify this later)
CREATE POLICY "Admins can view signups" 
ON public.email_signups 
FOR SELECT 
USING (true);