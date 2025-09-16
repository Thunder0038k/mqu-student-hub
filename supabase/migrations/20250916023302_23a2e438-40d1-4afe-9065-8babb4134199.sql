-- Fix Critical Security Issues - Clean Slate Approach
-- 1. Drop ALL existing RLS policies on profiles table to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile and admins can view all" ON public.profiles;

-- 2. Create new secure RLS policies 
CREATE POLICY "secure_profiles_select" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid() OR get_current_user_admin_status());

CREATE POLICY "secure_profiles_insert" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid() AND is_admin = false);

CREATE POLICY "secure_profiles_update" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. Create trigger to prevent admin privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_admin field is being changed and user is not already an admin
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    -- Check if current user is admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Only existing admins can modify admin status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger
DROP TRIGGER IF EXISTS prevent_admin_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_escalation();

-- 4. Create audit log table for admin changes
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
CREATE POLICY "admin_audit_log_select"
ON public.admin_audit_log
FOR SELECT
USING (get_current_user_admin_status());

-- 5. Create secure function for admin role assignment with audit logging
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