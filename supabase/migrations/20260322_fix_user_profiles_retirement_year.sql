-- Migration: Fix user_profiles schema — switch from age-based to year-based retirement
-- Created: 2026-03-22
--
-- The original migration used current_age + retirement_age (both NOT NULL).
-- Task 3 switched to retirement_year. This migration is idempotent — safe to run
-- whether the table exists with the old schema, the new schema, or not at all.

-- 1. Add retirement_year if it doesn't exist yet
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS retirement_year integer;

-- 2. Drop NOT NULL from legacy age columns (they may not exist — exceptions are swallowed)
DO $$ BEGIN
  ALTER TABLE user_profiles ALTER COLUMN current_age DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE user_profiles ALTER COLUMN retirement_age DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;
