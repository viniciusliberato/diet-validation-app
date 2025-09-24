-- Create table for nutritionist meal plans with goals and timeline
CREATE TABLE public.nutrition_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id uuid NOT NULL REFERENCES profiles(user_id),
  patient_id uuid NOT NULL REFERENCES profiles(user_id),
  plan_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  target_compliance_percentage integer NOT NULL DEFAULT 80 CHECK (target_compliance_percentage > 0 AND target_compliance_percentage <= 100),
  target_days_to_complete integer GENERATED ALWAYS AS (CEIL((end_date - start_date + 1) * target_compliance_percentage / 100.0)) STORED,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for daily meal schedules
CREATE TABLE public.daily_meal_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutrition_plan_id uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  scheduled_time time NOT NULL,
  expected_foods text[] NOT NULL DEFAULT '{}',
  portion_notes text,
  calories_target integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(nutrition_plan_id, day_of_week, meal_type)
);

-- Create table for daily meal validations (replaces the current meals table functionality)
CREATE TABLE public.meal_validations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutrition_plan_id uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  daily_schedule_id uuid NOT NULL REFERENCES daily_meal_schedules(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(user_id),
  validation_date date NOT NULL,
  image_url text,
  image_description text,
  validation_status text DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_feedback text,
  detected_foods text[] DEFAULT '{}',
  missing_foods text[] DEFAULT '{}',
  nutritional_match numeric CHECK (nutritional_match >= 0 AND nutritional_match <= 1),
  calories_estimated integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(daily_schedule_id, validation_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition_plans
CREATE POLICY "Nutritionists can manage their nutrition plans"
ON public.nutrition_plans
FOR ALL
USING (nutritionist_id = auth.uid());

CREATE POLICY "Patients can view their assigned nutrition plans"
ON public.nutrition_plans
FOR SELECT
USING (patient_id = auth.uid());

-- RLS Policies for daily_meal_schedules
CREATE POLICY "Nutritionists can manage meal schedules for their plans"
ON public.daily_meal_schedules
FOR ALL
USING (
  nutrition_plan_id IN (
    SELECT id FROM nutrition_plans WHERE nutritionist_id = auth.uid()
  )
);

CREATE POLICY "Patients can view their meal schedules"
ON public.daily_meal_schedules
FOR SELECT
USING (
  nutrition_plan_id IN (
    SELECT id FROM nutrition_plans WHERE patient_id = auth.uid()
  )
);

-- RLS Policies for meal_validations
CREATE POLICY "Patients can manage their own meal validations"
ON public.meal_validations
FOR ALL
USING (patient_id = auth.uid());

CREATE POLICY "Nutritionists can view validations for their patients"
ON public.meal_validations
FOR SELECT
USING (
  nutrition_plan_id IN (
    SELECT id FROM nutrition_plans WHERE nutritionist_id = auth.uid()
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_nutrition_plans_updated_at
  BEFORE UPDATE ON public.nutrition_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_meal_schedules_updated_at
  BEFORE UPDATE ON public.daily_meal_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_validations_updated_at
  BEFORE UPDATE ON public.meal_validations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();