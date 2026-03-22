-- Migration: Add user profiles table for managing user settings
-- Created: 2026-03-20

-- Table: user_profiles
-- Stores user profile information separate from plan metadata
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  residence_country text NOT NULL,
  retirement_country text NOT NULL,
  retirement_year integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all profiles
CREATE POLICY "Service role can manage profiles"
  ON user_profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_updated_at();

-- Comments
COMMENT ON TABLE user_profiles IS 'User profile settings including countries and age preferences';
COMMENT ON COLUMN user_profiles.residence_country IS 'Current country of residence (full name, e.g., "United States")';
COMMENT ON COLUMN user_profiles.retirement_country IS 'Intended retirement country (full name)';
