-- Migration: Goals, check-in schedule, and user_profiles schema update
-- Created: 2026-03-21

-- ─── 1. Update user_profiles ──────────────────────────────────────────────────
-- Replace age-based fields with retirement_year (actual calendar year)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS retirement_year integer;

-- Make age columns nullable if they exist (legacy schema — not present in fresh installs)
DO $$ BEGIN
  ALTER TABLE user_profiles ALTER COLUMN current_age DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE user_profiles ALTER COLUMN retirement_age DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

COMMENT ON COLUMN user_profiles.retirement_year IS 'Target retirement calendar year (e.g. 2055). Replaces current_age / retirement_age.';

-- ─── 2. user_goals ────────────────────────────────────────────────────────────
-- Discrete financial goals (retirement, education, home purchase, etc.)
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL DEFAULT 'retirement',
  -- 'retirement' | 'education' | 'purchase' | 'emergency' | 'other'
  label text NOT NULL,
  target_amount_usd numeric(15, 2),
  target_year integer,
  linked_account_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON user_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_goals TO authenticated;
GRANT ALL ON user_goals TO service_role;

CREATE OR REPLACE FUNCTION update_user_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_goals_updated_at();

COMMENT ON TABLE user_goals IS 'Discrete financial goals linked to user accounts';
COMMENT ON COLUMN user_goals.goal_type IS 'One of: retirement, education, purchase, emergency, other';
COMMENT ON COLUMN user_goals.linked_account_ids IS 'Array of user_accounts.id values allocated to this goal';

-- ─── 3. user_checkin_schedule ─────────────────────────────────────────────────
-- Controls how often users are prompted to review their portfolio
CREATE TABLE IF NOT EXISTS user_checkin_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  frequency_days integer NOT NULL DEFAULT 182,  -- ~twice a year
  last_checkin_at timestamptz,
  next_checkin_at timestamptz DEFAULT (now() + INTERVAL '182 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_checkin_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkin schedule"
  ON user_checkin_schedule FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON user_checkin_schedule TO authenticated;
GRANT ALL ON user_checkin_schedule TO service_role;

CREATE OR REPLACE FUNCTION update_checkin_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_checkin_schedule_updated_at
  BEFORE UPDATE ON user_checkin_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_checkin_schedule_updated_at();

COMMENT ON TABLE user_checkin_schedule IS 'Per-user schedule for portfolio review check-in prompts';
COMMENT ON COLUMN user_checkin_schedule.frequency_days IS 'Days between check-in prompts. Default 182 (~twice/year).';
COMMENT ON COLUMN user_checkin_schedule.next_checkin_at IS 'Next scheduled check-in prompt date';
