-- Migration: Add is_paid flag to user_profiles for freemium gating
-- Created: 2026-03-22
-- NOTE: This is a stub for Task 15. The column is set to false by default.
-- In Task 15, a Stripe webhook handler will flip this to true on subscription creation
-- and back to false on subscription cancellation.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN user_profiles.is_paid IS 'Paid tier flag. Set by Stripe webhook on subscription events. False = free tier (manual accounts only). True = paid tier (Plaid connection unlocked).';
