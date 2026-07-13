-- Migration: Add subscriptions & plan support for monetization

-- 1. Subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro');

-- 2. Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Default subscription trigger (fotografer baru dpt free plan)
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_subscription();

-- 5. Plan limits view
CREATE VIEW public.plan_limits AS
SELECT
  plan,
  CASE plan
    WHEN 'free' THEN 3
    WHEN 'basic' THEN 20
    WHEN 'pro' THEN 999999
  END AS max_projects,
  CASE plan
    WHEN 'free' THEN 100
    WHEN 'basic' THEN 500
    WHEN 'pro' THEN 999999
  END AS max_photos_per_project
FROM (VALUES ('free'::subscription_plan), ('basic'::subscription_plan), ('pro'::subscription_plan)) AS plans(plan);

-- 6. Helper function: check if user can create project
CREATE OR REPLACE FUNCTION public.check_project_limit(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_plan subscription_plan;
  max_projects INT;
  project_count INT;
BEGIN
  SELECT plan INTO current_plan FROM public.subscriptions WHERE subscriptions.user_id = check_project_limit.user_id;
  IF current_plan IS NULL THEN
    current_plan := 'free';
  END IF;

  SELECT pl.max_projects INTO max_projects FROM public.plan_limits pl WHERE pl.plan = current_plan;

  SELECT COUNT(*) INTO project_count FROM public.projects WHERE user_id = check_project_limit.user_id;

  RETURN project_count < max_projects;
END;
$$;
