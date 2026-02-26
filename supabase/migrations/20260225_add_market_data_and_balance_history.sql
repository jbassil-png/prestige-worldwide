-- Migration: Add market data, balance history, and plan history tables
-- Created: 2026-02-25

-- Table: market_data
-- Stores daily market snapshots for realistic projections
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  sp500_close decimal(12, 2),
  sp500_ytd_return decimal(5, 2), -- e.g., 8.45 for 8.45%
  bond_yield_10y decimal(5, 2), -- e.g., 4.25 for 4.25%
  inflation_rate decimal(5, 2), -- e.g., 3.10 for 3.10%
  msci_world_close decimal(12, 2),
  msci_world_ytd_return decimal(5, 2),
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date DESC);

-- Table: user_balance_history
-- Tracks balance changes over time from Plaid
CREATE TABLE IF NOT EXISTS user_balance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id text NOT NULL, -- Plaid account ID
  account_name text,
  balance_usd decimal(12, 2) NOT NULL,
  currency text DEFAULT 'USD',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_balance_history_user_id ON user_balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balance_history_account_id ON user_balance_history(account_id);
CREATE INDEX IF NOT EXISTS idx_user_balance_history_recorded_at ON user_balance_history(recorded_at DESC);

-- Table: plan_history
-- Stores all generated plans for a user over time
CREATE TABLE IF NOT EXISTS plan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan jsonb NOT NULL,
  trigger_reason text NOT NULL, -- 'onboarding', 'balance_change', 'market_change', 'scheduled', 'user_request'
  balance_snapshot jsonb, -- Snapshot of balances at plan generation
  market_snapshot jsonb, -- Snapshot of market data at plan generation
  created_at timestamptz DEFAULT now()
);

-- Indexes for plan history
CREATE INDEX IF NOT EXISTS idx_plan_history_user_id ON plan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_history_created_at ON plan_history(created_at DESC);

-- Table: plaid_items
-- Stores Plaid connection metadata (if not already exists)
CREATE TABLE IF NOT EXISTS plaid_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL UNIQUE, -- Plaid item ID
  access_token text NOT NULL, -- Encrypted in production!
  institution_name text,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);

-- Table: user_accounts
-- Stores individual accounts from Plaid (if not already exists)
CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plaid_item_id uuid REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id text NOT NULL UNIQUE, -- Plaid account ID
  account_name text,
  account_type text, -- 'depository', 'investment', etc.
  account_subtype text, -- 'checking', 'savings', '401k', etc.
  current_balance decimal(12, 2),
  available_balance decimal(12, 2),
  currency text DEFAULT 'USD',
  last_updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for user accounts
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_plaid_item_id ON user_accounts(plaid_item_id);

-- Function: Get latest market data
CREATE OR REPLACE FUNCTION get_latest_market_data()
RETURNS TABLE (
  date date,
  sp500_close decimal,
  sp500_ytd_return decimal,
  bond_yield_10y decimal,
  inflation_rate decimal,
  msci_world_close decimal,
  msci_world_ytd_return decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    md.date,
    md.sp500_close,
    md.sp500_ytd_return,
    md.bond_yield_10y,
    md.inflation_rate,
    md.msci_world_close,
    md.msci_world_ytd_return
  FROM market_data md
  ORDER BY md.date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's total balance across all accounts
CREATE OR REPLACE FUNCTION get_user_total_balance(p_user_id uuid)
RETURNS decimal AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(current_balance)
     FROM user_accounts
     WHERE user_id = p_user_id),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Check if balance changed significantly
CREATE OR REPLACE FUNCTION has_significant_balance_change(
  p_user_id uuid,
  p_threshold_percent decimal DEFAULT 10.0
)
RETURNS boolean AS $$
DECLARE
  v_current_total decimal;
  v_last_total decimal;
  v_change_percent decimal;
BEGIN
  -- Get current total balance
  v_current_total := get_user_total_balance(p_user_id);

  -- Get last recorded total balance
  SELECT SUM(balance_usd) INTO v_last_total
  FROM (
    SELECT DISTINCT ON (account_id) balance_usd
    FROM user_balance_history
    WHERE user_id = p_user_id
    ORDER BY account_id, recorded_at DESC
  ) AS latest_balances;

  -- If no history, return true to trigger initial plan
  IF v_last_total IS NULL THEN
    RETURN true;
  END IF;

  -- Calculate percentage change
  v_change_percent := ABS((v_current_total - v_last_total) / NULLIF(v_last_total, 0)) * 100;

  RETURN v_change_percent >= p_threshold_percent;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE user_balance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own balance history"
  ON user_balance_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plan history"
  ON plan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plaid items"
  ON plaid_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own accounts"
  ON user_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all data (for n8n workflows)
CREATE POLICY "Service role can manage balance history"
  ON user_balance_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage plan history"
  ON plan_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage plaid items"
  ON plaid_items FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage accounts"
  ON user_accounts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Market data is publicly readable
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market data is publicly readable"
  ON market_data FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage market data"
  ON market_data FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON market_data TO anon, authenticated;
GRANT SELECT ON user_balance_history TO authenticated;
GRANT SELECT ON plan_history TO authenticated;
GRANT SELECT ON plaid_items TO authenticated;
GRANT SELECT ON user_accounts TO authenticated;

-- Comments for documentation
COMMENT ON TABLE market_data IS 'Daily market data snapshots for realistic financial projections';
COMMENT ON TABLE user_balance_history IS 'Historical balance tracking from Plaid for detecting significant changes';
COMMENT ON TABLE plan_history IS 'All generated financial plans for audit trail and comparison';
COMMENT ON TABLE plaid_items IS 'Plaid connection metadata for each user';
COMMENT ON TABLE user_accounts IS 'Individual bank/investment accounts linked via Plaid';
COMMENT ON FUNCTION get_latest_market_data IS 'Returns the most recent market data snapshot';
COMMENT ON FUNCTION get_user_total_balance IS 'Calculates total balance across all user accounts';
COMMENT ON FUNCTION has_significant_balance_change IS 'Checks if user balance changed more than threshold percent';
