# Complete Setup Guide: Market-Aware Financial Planning System

This guide walks you through setting up the complete system with:
- ✅ **Scheduled Balance Refresh** - Daily Plaid balance sync
- ✅ **Market-Aware Projections** - Real-time S&P 500, bond yields, inflation data
- ✅ **AI-Powered Plans** - Claude-generated personalized financial plans
- ✅ **Smart Chat** - Contextual chat about your plan

---

## 📋 Prerequisites Checklist

Before starting, gather these accounts/keys:

| Service | Purpose | Sign Up Link | Cost |
|---------|---------|--------------|------|
| Supabase | Database | https://supabase.com | Free tier |
| n8n | Workflow automation | https://n8n.cloud or self-host | Free tier |
| Alpha Vantage | Market data | https://www.alphavantage.co/support/#api-key | Free (25 calls/day) |
| OpenRouter | AI (Claude) | https://openrouter.ai/keys | ~$0.01/plan |
| Plaid | Bank accounts | https://dashboard.plaid.com | Sandbox free |
| PostHog | Analytics tracking | https://app.posthog.com | Free (1M events/month) |
| Resend (optional) | Email notifications | https://resend.com | Free tier |

> **Note:** See [`docs/POSTHOG_SETUP.md`](./POSTHOG_SETUP.md) for detailed PostHog setup instructions.

---

## 🚀 Step-by-Step Setup

### Step 1: Database Setup

1. **Run the Supabase migration:**

   ```bash
   # Option A: Via Supabase Dashboard (easiest)
   # 1. Go to your Supabase project → SQL Editor
   # 2. Copy contents of: supabase/migrations/20260225_add_market_data_and_balance_history.sql
   # 3. Paste and click "Run"

   # Option B: Via Supabase CLI
   supabase db push
   ```

2. **Verify tables were created:**

   ```sql
   -- Run this in SQL Editor to confirm
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN (
     'market_data',
     'user_balance_history',
     'plan_history',
     'plaid_items',
     'user_accounts'
   );
   ```

   You should see all 5 tables listed.

3. **Get your Supabase credentials:**
   - Go to: Project Settings → API
   - Copy:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (for n8n)

---

### Step 2: Get API Keys

#### Alpha Vantage (Market Data)

1. Go to: https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Copy your API key → `ALPHA_VANTAGE_API_KEY`
4. Test it:

   ```bash
   curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=YOUR_KEY"
   ```

#### OpenRouter (AI)

1. Go to: https://openrouter.ai/keys
2. Sign in with Google/GitHub
3. Create new API key
4. Add $5-10 credits (plans cost ~$0.01 each)
5. Copy key → `OPENROUTER_API_KEY`

#### Plaid (Banking)

1. Go to: https://dashboard.plaid.com
2. Sign up for developer account
3. Get credentials:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET` (sandbox)
4. Set `PLAID_ENV=sandbox`

---

### Step 3: Configure n8n

#### Option A: n8n Cloud (Recommended)

1. Sign up at https://n8n.cloud
2. Create a new workflow
3. Your webhook URLs will be:
   ```
   https://your-instance.app.n8n.cloud/webhook/plan/generate
   https://your-instance.app.n8n.cloud/webhook/plan/chat
   ```

#### Option B: Self-Hosted Docker

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at: http://localhost:5678
```

#### Set Environment Variables in n8n

Go to: Settings → Environments → Add variables:

```bash
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
OPENROUTER_API_KEY=your_openrouter_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your Next.js app URL
```

---

### Step 4: Build n8n Workflows

Follow the detailed instructions in [`docs/n8n-setup.md`](./n8n-setup.md) to build all 3 workflows:

1. **Plan Generation Workflow** (`/webhook/plan/generate`)
   - 10 nodes
   - ~15 minutes to build
   - Fetches market data + generates AI plan

2. **Chat Workflow** (`/webhook/plan/chat`)
   - 4 nodes
   - ~5 minutes to build
   - Streams AI chat responses

3. **Scheduled Balance Refresh** (Cron: daily at 2am)
   - 11 nodes
   - ~20 minutes to build
   - Syncs Plaid balances, triggers regeneration

**Quick Start Templates** (coming soon):
- We'll provide n8n JSON exports you can import directly

---

### Step 5: Configure Next.js App

1. **Update `.env.local`:**

   ```bash
   cp .env.example .env.local
   ```

   Then fill in:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key

   # Plaid
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox

   # n8n Webhooks
   N8N_WEBHOOK_URL=https://your.n8n.cloud/webhook/plan/generate
   N8N_CHAT_WEBHOOK_URL=https://your.n8n.cloud/webhook/plan/chat
   N8N_API_TOKEN=random_secure_token_here  # Generate with: openssl rand -hex 32

   # Alpha Vantage (for n8n, but can be used in Next.js too)
   ALPHA_VANTAGE_API_KEY=your_key

   # OpenRouter
   OPENROUTER_API_KEY=your_key
   OPENROUTER_MODEL=anthropic/claude-sonnet-4-5

   # Resend (optional)
   RESEND_API_KEY=your_key

   # FX API (optional)
   FX_API_KEY=your_key
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the dev server:**

   ```bash
   npm run dev
   ```

   App should be running at: http://localhost:3000

---

### Step 6: Test the System

#### Test 1: Plan Generation

```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "countries": ["US"],
    "accounts": [
      {"type": "retirement", "country": "US", "balanceUsd": 150000}
    ],
    "goals": ["retire-early"],
    "retirementAge": 55,
    "currentAge": 35
  }'
```

**Expected Response:**
```json
{
  "summary": "Based on current market conditions (S&P 500: $XXX, 10Y yield: X.X%)...",
  "asset_allocation": {"stocks": 70, "bonds": 25, "cash": 5},
  "projections": {
    "retirement_age": 55,
    "projected_balance": 1200000,
    "probability_of_success": 85
  },
  "recommendations": [...]
}
```

#### Test 2: Chat

```bash
curl -X POST http://localhost:3000/api/plan/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What if I retire at 60 instead?"}
    ],
    "planContext": {
      "projections": {"retirement_age": 55, "projected_balance": 1200000}
    }
  }'
```

#### Test 3: Balance Refresh (Manual Trigger)

1. In n8n, open "Scheduled Balance Refresh" workflow
2. Click "Execute Workflow" button
3. Check Supabase:

   ```sql
   SELECT * FROM user_balance_history ORDER BY recorded_at DESC LIMIT 10;
   ```

---

### Step 7: Activate Scheduled Workflow

1. In n8n, open "Scheduled Balance Refresh" workflow
2. Toggle "Active" switch to ON
3. Verify next run time shows in workflow header
4. (Optional) Change schedule from daily to weekly:
   - Click Schedule Trigger node
   - Change cron from `0 2 * * *` to `0 2 * * 1` (Monday 2am)

---

## 🎯 Usage Flow

### For End Users:

1. **Onboarding:**
   - User connects bank accounts via Plaid
   - Fills out profile (age, goals, risk tolerance)
   - Clicks "Generate Plan" → calls `/api/plan`
   - n8n fetches real-time market data
   - Claude generates personalized plan with realistic projections

2. **Daily Updates:**
   - n8n runs balance refresh at 2am
   - If balance changed >10%, automatically regenerates plan
   - User gets notification (optional)

3. **Chat Interaction:**
   - User asks: "What if I retire 5 years later?"
   - Calls `/api/plan/chat` with full plan context
   - Claude streams conversational response with recalculations

### For Developers:

- All workflows are visible in n8n (transparent automation)
- Plan history stored in `plan_history` table (audit trail)
- Market data cached in `market_data` table (reduces API calls)
- Easy to add new triggers (e.g., monthly market updates)

---

## 🔧 Troubleshooting

### API Rate Limits

**Problem:** Alpha Vantage limit exceeded (25/day)

**Solution:**
- Cache market data in `market_data` table
- Only fetch once per day (already implemented)
- Or upgrade to premium ($50/month = 500 calls/min)

### n8n Timeout

**Problem:** Workflow times out after 5 minutes

**Solution:**
- Settings → Executions → Timeout → Increase to 10 minutes
- Or optimize: split into smaller workflows

### Plaid Sandbox Accounts

**Problem:** Getting fake data in sandbox mode

**Solution:**
- Use test credentials: `user_good` / `pass_good`
- Or upgrade to Development environment for real data
- Sandbox is free forever, Development costs per API call

### RLS Errors in Supabase

**Problem:** `new row violates row-level security policy`

**Solution:**
- Make sure n8n uses `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Verify policies with:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'user_accounts';
  ```

### Chat Not Streaming

**Problem:** Chat returns all at once instead of streaming

**Solution:**
- In n8n HTTP Request node, set:
  - Response Format: Stream
  - Enable "Send Binary Data"
- In OpenRouter request body, set:
  - `"stream": true`

---

## 📊 Monitoring & Observability

### n8n Execution History

- View all workflow runs: n8n → Executions
- Filter by: Success, Error, Workflow
- Useful for debugging failed balance refreshes

### Supabase Logs

```sql
-- Check recent plan generations
SELECT created_at, trigger_reason, user_id
FROM plan_history
ORDER BY created_at DESC
LIMIT 10;

-- Check balance changes
SELECT
  user_id,
  account_name,
  balance_usd,
  recorded_at
FROM user_balance_history
WHERE user_id = 'your-user-id'
ORDER BY recorded_at DESC;

-- Check market data freshness
SELECT * FROM market_data ORDER BY date DESC LIMIT 1;
```

### Cost Tracking

- **Alpha Vantage:** Free (25/day)
- **OpenRouter:** $0.006/plan (Claude Sonnet 4.5)
- **Supabase:** Free (<500MB DB, <2GB bandwidth)
- **n8n Cloud:** $20/month (or free self-hosted)

**Monthly cost for 100 users:**
- 100 plan generations: $0.60
- 1000 chat messages: $2.00
- **Total: ~$3/month** (excluding n8n Cloud)

---

## 🚢 Production Deployment

### Security Checklist

- [ ] Encrypt Plaid access tokens in DB
- [ ] Set up Supabase RLS policies (already done)
- [ ] Use `N8N_API_TOKEN` for webhook authentication
- [ ] Enable HTTPS for all endpoints
- [ ] Rotate API keys quarterly
- [ ] Set up Supabase backup policy

### n8n Production

- [ ] Migrate from n8n Cloud free tier to paid (if needed)
- [ ] Or self-host on AWS/Railway/Render
- [ ] Set up error notifications (email/Slack)
- [ ] Enable workflow versioning

### Next.js Production

```bash
# Build optimized production bundle
npm run build

# Deploy to Vercel (recommended)
vercel deploy --prod

# Or deploy to your preferred platform
```

### Environment Variables

Make sure all env vars are set in production:
- Vercel: Project Settings → Environment Variables
- Railway: Variables tab
- Docker: Pass via `-e` flags or `.env` file

---

## 🎉 What's Next?

Once your system is running:

1. **Add User Profile Storage:**
   - Create `user_profiles` table
   - Store age, goals, risk tolerance
   - Update `/api/plan/regenerate` to use real data

2. **Email Notifications:**
   - Send email when plan regenerates
   - Weekly balance summary
   - Market milestone alerts

3. **Advanced Features:**
   - Multi-currency support (use FX API)
   - Tax treaty optimization
   - Monte Carlo simulations
   - Historical plan comparison

4. **Frontend Enhancements:**
   - Interactive charts (Recharts/Chart.js)
   - Plan diff viewer (old vs new)
   - Chat history persistence
   - Mobile app (React Native)

---

## 📚 Additional Resources

- [n8n Workflow Setup Guide](./n8n-setup.md) - Detailed node configurations
- [Supabase Migration README](../supabase/README.md) - Database schema docs
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/) - Market data endpoints
- [OpenRouter Models](https://openrouter.ai/docs) - Available AI models
- [Plaid API Reference](https://plaid.com/docs/api/) - Banking integration

---

## 🆘 Need Help?

- **n8n Community:** https://community.n8n.io
- **Supabase Discord:** https://discord.supabase.com
- **GitHub Issues:** [Create an issue](https://github.com/your-repo/issues)

---

**Built with:**
- Next.js 15 + React 19
- Supabase (PostgreSQL)
- n8n (Workflow Automation)
- Claude (Anthropic AI)
- Alpha Vantage (Market Data)
- Plaid (Banking)

---

## 🔧 Open Items / In Progress

### Plaid Integration (WIP)
Still sorting through the Plaid integration. Key decisions pending:
- Confirm which Plaid products to request during app registration (currently using `transactions` in link token creation, but only balance data is actually fetched — need to reconcile)
- Complete Plaid developer application (use case: personal finance app, retrieving account balances to generate personalized financial plans)
- Verify sandbox → production promotion steps once integration is finalized
