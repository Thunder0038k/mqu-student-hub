-- Fix the security warning by setting explicit search_path for the function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;