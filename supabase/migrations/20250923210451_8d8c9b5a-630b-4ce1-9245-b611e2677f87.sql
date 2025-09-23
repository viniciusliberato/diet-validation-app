-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$;

CREATE OR REPLACE FUNCTION public.set_invitation_code()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
    NEW.invitation_code = public.generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$;