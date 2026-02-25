# Supabase Database Setup

This directory contains database migrations for the Prestige Worldwide Financial Planning app.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `migrations/20260225_add_market_data_and_balance_history.sql`
5. Click **Run** to execute the migration

### Option 2: Supabase CLI (For local development)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Initialize Supabase (if not done already)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## Database Schema Overview

### Core Tables

#### `market_data`
Stores daily market snapshots (S&P 500, bonds, inflation) for realistic projections.
- Updated daily via n8n workflow
- Used by Plan Generation workflow to calculate real returns

#### `user_balance_history`
Tracks balance changes from Plaid over time.
- Updated by Scheduled Balance Refresh workflow
- Triggers plan regeneration on significant changes (>10%)

#### `plan_history`
Audit trail of all generated financial plans.
- Stores full plan JSON + context (balances, market data)
- Allows tracking plan evolution over time

#### `plaid_items`
Plaid connection metadata for each user.
- Stores item_id and access_token for API calls
- **Note:** Encrypt access_tokens in production!

#### `user_accounts`
Individual bank/investment accounts from Plaid.
- Links to plaid_items
- Stores current balances and account types

### Utility Functions

#### `get_latest_market_data()`
Returns the most recent market data snapshot.

```sql
SELECT * FROM get_latest_market_data();
```

#### `get_user_total_balance(user_id)`
Calculates total balance across all user accounts.

```sql
SELECT get_user_total_balance('user-uuid-here');
```

#### `has_significant_balance_change(user_id, threshold_percent)`
Checks if balance changed more than threshold (default 10%).

```sql
SELECT has_significant_balance_change('user-uuid-here', 10.0);
```

## Security

- **Row Level Security (RLS)** enabled on all user tables
- Users can only access their own data
- Service role (n8n) has full access for automation
- Market data is publicly readable

## Next Steps

1. ✅ Run the migration in Supabase
2. 🔑 Get API keys:
   - Alpha Vantage (for market data)
   - OpenRouter (for AI)
3. 🔧 Set up n8n workflows (see `/docs/n8n-setup.md`)
