-- Migration: Add user_plans table
-- Created: 2026-03-23
-- Stores generated financial plans. One row per generation.
-- The app writes here on onboarding completion, plan refresh, and profile update.

CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient user + date lookups
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_created_at ON user_plans(created_at DESC);

-- Row Level Security
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS (used by profile update route)
CREATE POLICY "Service role can manage plans"
  ON user_plans FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Permissions
GRANT SELECT, INSERT ON user_plans TO authenticated;
GRANT ALL ON user_plans TO service_role;

COMMENT ON TABLE user_plans IS 'Generated financial plans. One row per generation. plan column contains full plan JSON + meta object.';
COMMENT ON COLUMN user_plans.plan IS 'Full plan JSON including summary, metrics, recommendations, and meta object with payload used to generate it.';
