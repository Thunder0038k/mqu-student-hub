-- CRITICAL SECURITY FIX: Remove the vulnerable RLS policy that exposes all email data
DROP POLICY IF EXISTS "Admins can view signups" ON public.email_signups;

-- Create a secure policy that blocks all SELECT access until proper admin authentication is implemented
-- This temporarily disables viewing signup data to prevent the security vulnerability
CREATE POLICY "Block all signup data access" 
ON public.email_signups 
FOR SELECT 
USING (false);

-- Add unique constraint to prevent duplicate emails
ALTER TABLE public.email_signups 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Add index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON public.email_signups(email);
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON public.email_signups(created_at);

-- Add a function to check for rate limiting (basic protection)
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit(user_email text)
RETURNS boolean AS $$
DECLARE
  recent_signups integer;
BEGIN
  -- Check if this email has signed up in the last hour
  SELECT COUNT(*) INTO recent_signups
  FROM public.email_signups
  WHERE email = user_email 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow if no recent signups
  RETURN recent_signups = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;