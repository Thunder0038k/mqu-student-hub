-- Fix RLS policies to prevent infinite recursion
-- First drop the problematic admin policy
DROP POLICY IF EXISTS "admins_and_owners_can_view" ON public.profiles;

-- Create a security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user exists in profiles and is admin
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create a new safe admin policy
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  (id = auth.uid()) OR public.get_current_user_admin_status()
);