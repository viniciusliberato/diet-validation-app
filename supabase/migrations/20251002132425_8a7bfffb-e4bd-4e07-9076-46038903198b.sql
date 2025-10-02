-- Ensure unique invitation codes and auto-generation + username normalization/validation
BEGIN;

-- 1) Unique constraint on invitation_code for quick lookup and integrity
CREATE UNIQUE INDEX IF NOT EXISTS ux_patient_invitations_invitation_code
  ON public.patient_invitations (invitation_code);

-- 2) Auto-generate invitation_code on INSERT using existing function
DROP TRIGGER IF EXISTS trg_set_invitation_code ON public.patient_invitations;
CREATE TRIGGER trg_set_invitation_code
BEFORE INSERT ON public.patient_invitations
FOR EACH ROW
EXECUTE FUNCTION public.set_invitation_code();

-- 3) Normalize and validate patient_username (lowercase + allowed chars and length)
CREATE OR REPLACE FUNCTION public.normalize_validate_patient_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_username IS NULL OR length(trim(NEW.patient_username)) = 0 THEN
    RAISE EXCEPTION 'patient_username cannot be empty';
  END IF;

  -- Force lowercase
  NEW.patient_username = lower(NEW.patient_username);

  -- Enforce allowed characters and length (3-30)
  IF NEW.patient_username !~ '^[a-z0-9._]{3,30}$' THEN
    RAISE EXCEPTION 'patient_username must be 3-30 chars, lowercase letters, numbers, dot, underscore';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_patient_username_ins ON public.patient_invitations;
CREATE TRIGGER trg_validate_patient_username_ins
BEFORE INSERT ON public.patient_invitations
FOR EACH ROW EXECUTE FUNCTION public.normalize_validate_patient_username();

DROP TRIGGER IF EXISTS trg_validate_patient_username_upd ON public.patient_invitations;
CREATE TRIGGER trg_validate_patient_username_upd
BEFORE UPDATE ON public.patient_invitations
FOR EACH ROW EXECUTE FUNCTION public.normalize_validate_patient_username();

COMMIT;