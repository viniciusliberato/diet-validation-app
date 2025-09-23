-- Add username and user_type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN user_type TEXT DEFAULT 'patient' CHECK (user_type IN ('patient', 'nutritionist'));

-- Update existing profiles to have patient type
UPDATE public.profiles SET user_type = 'patient' WHERE user_type IS NULL;

-- Make user_type NOT NULL after setting defaults
ALTER TABLE public.profiles ALTER COLUMN user_type SET NOT NULL;

-- Create nutritionist_patients table to map relationships
CREATE TABLE public.nutritionist_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nutritionist_id, patient_id)
);

-- Create patient_invitations table for pending invites
CREATE TABLE public.patient_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  patient_username TEXT NOT NULL,
  invitation_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS on new tables
ALTER TABLE public.nutritionist_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for nutritionist_patients
CREATE POLICY "Nutritionists can view their patients" 
ON public.nutritionist_patients 
FOR SELECT 
USING (auth.uid() = nutritionist_id);

CREATE POLICY "Patients can view their nutritionist relationship" 
ON public.nutritionist_patients 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Nutritionists can create patient relationships" 
ON public.nutritionist_patients 
FOR INSERT 
WITH CHECK (auth.uid() = nutritionist_id);

-- RLS policies for patient_invitations
CREATE POLICY "Nutritionists can manage their invitations" 
ON public.patient_invitations 
FOR ALL 
USING (auth.uid() = nutritionist_id);

CREATE POLICY "Users can view invitations sent to them" 
ON public.patient_invitations 
FOR SELECT 
USING (
  patient_username = (
    SELECT username FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update invitations sent to them" 
ON public.patient_invitations 
FOR UPDATE 
USING (
  patient_username = (
    SELECT username FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Function to generate random invitation codes
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invitation codes
CREATE OR REPLACE FUNCTION public.set_invitation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
    NEW.invitation_code = public.generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invitation_code_trigger
  BEFORE INSERT ON public.patient_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invitation_code();