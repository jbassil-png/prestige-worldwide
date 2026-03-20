-- Migration: Portfolio-aware news feed
-- Created: 2026-03-20

-- ── user_holdings ──────────────────────────────────────────────────────────────
-- Stores the tickers a user wants to track (stocks, ETFs, crypto)

CREATE TABLE IF NOT EXISTS user_holdings (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker     text    NOT NULL,
  asset_type text    NOT NULL DEFAULT 'stock', -- 'stock' | 'etf' | 'crypto'
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, ticker)
);

ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own holdings"
  ON user_holdings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON user_holdings TO authenticated;

-- ── user_portfolio_news ────────────────────────────────────────────────────────
-- Caches the most recent portfolio news fetch per user (30-minute TTL)

CREATE TABLE IF NOT EXISTS user_portfolio_news (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items      jsonb NOT NULL DEFAULT '[]',
  fetched_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_news_user
  ON user_portfolio_news (user_id, fetched_at DESC);

ALTER TABLE user_portfolio_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolio news"
  ON user_portfolio_news FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON user_portfolio_news TO authenticated;
