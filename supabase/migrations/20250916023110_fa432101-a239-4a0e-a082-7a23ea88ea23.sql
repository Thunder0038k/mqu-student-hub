-- Fix Critical Security Issues
-- 1. Drop duplicate RLS policies on profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Create secure admin management function
CREATE OR REPLACE FUNCTION public.can_modify_admin_status()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins can modify admin status
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- 3. Create new secure RLS policies with column-level protection
CREATE POLICY "Users can view their own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR get_current_user_admin_status());

CREATE POLICY "Users can insert their own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid() AND is_admin = false);

-- 4. Create separate policies for regular updates vs admin updates
CREATE POLICY "Users can update own profile excluding admin field" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND (
    -- If is_admin is being modified, user must be an existing admin
    (OLD.is_admin = NEW.is_admin) OR can_modify_admin_status()
  )
);

-- 5. Create audit log table for admin changes
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (get_current_user_admin_status());

-- 6. Create secure function for admin role assignment
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid, make_admin boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_admin_status boolean;
  operation_success boolean := false;
BEGIN
  -- Check if current user is admin
  IF NOT get_current_user_admin_status() THEN
    RAISE EXCEPTION 'Only admins can modify admin status';
  END IF;
  
  -- Get current admin status
  SELECT is_admin INTO current_admin_status 
  FROM public.profiles 
  WHERE id = target_user_id;
  
  -- Only proceed if status is actually changing
  IF current_admin_status IS DISTINCT FROM make_admin THEN
    -- Update the admin status
    UPDATE public.profiles 
    SET is_admin = make_admin, updated_at = now()
    WHERE id = target_user_id;
    
    -- Log the change
    INSERT INTO public.admin_audit_log (
      admin_user_id, 
      target_user_id, 
      action,
      old_value,
      new_value
    ) VALUES (
      auth.uid(),
      target_user_id,
      'admin_status_change',
      jsonb_build_object('is_admin', current_admin_status),
      jsonb_build_object('is_admin', make_admin)
    );
    
    operation_success := true;
  END IF;
  
  RETURN operation_success;
END;
$$;

-- 7. Create trigger to prevent direct admin field updates
CREATE OR REPLACE FUNCTION public.validate_admin_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_admin field is being changed
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    -- Check if current user is admin
    IF NOT get_current_user_admin_status() THEN
      RAISE EXCEPTION 'Admin status can only be modified by existing admins';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger
DROP TRIGGER IF EXISTS validate_admin_update_trigger ON public.profiles;
CREATE TRIGGER validate_admin_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_update();