-- Migration: Add Stripe customer ID to user_profiles
-- Created: 2026-03-22
-- Used by the Stripe webhook handler to link Stripe subscription events back
-- to the correct Supabase user row and flip is_paid accordingly.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_stripe_customer_id_idx
  ON user_profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID (cus_xxx). Set on first checkout session creation. Used by webhook handler to resolve user on subscription events.';
