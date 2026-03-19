# Prestige Worldwide

**Financial planning without borders.**

Prestige Worldwide is an AI-powered personal finance tool for people with assets, retirement accounts, or tax obligations spanning multiple countries — expats, dual citizens, cross-border workers, and international retirees.

---

## Features

- **Multi-country onboarding** — select countries and account types (401k, RRSP, TFSA, ISA, SIPP, CPF, Superannuation, and more)
- **Bank account connectivity** — link real accounts via Plaid (US, CA, GB) or enter balances manually
- **AI financial plan** — personalised recommendations across retirement, tax, currency, and estate planning
- **Daily AI spotlight** — a fresh insight each day based on your specific plan
- **Personalised news feed** — AI-curated financial news relevant to your countries and account types _(planned: portfolio-specific news for stocks you own)_
- **Streaming AI chat** — ask questions about your plan in context
- **Currency toggle** — view all balances in residence currency, retirement currency, or native currencies with helpful tooltips
- **Account management** — clear visibility of connected accounts with prominent management controls
- **Demo mode** — showcase all features with sample data for presentations and demonstrations
- **Analytics tracking** — PostHog integration for key user actions (sign-ups, bank connections, chat interactions)
- **Works without credentials** — every external service has a stub/mock fallback for local development

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom `brand` colour scale) |
| Auth & Database | Supabase |
| Bank Connectivity | Plaid |
| AI Orchestration | n8n (webhooks) |
| LLM Provider | OpenRouter (Claude, Gemini Flash, Perplexity Sonar Pro) |
| Analytics | PostHog |
| FX Rates | exchangerate-api.com |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values you need.

```bash
cp .env.example .env.local
```

```env
# Supabase — required for auth and data persistence
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Plaid — optional, falls back to mock accounts
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox   # sandbox | development | production

# n8n — optional, used for plan generation and chat
N8N_WEBHOOK_URL=
N8N_CHAT_WEBHOOK_URL=
N8N_AI_PROXY_WEBHOOK_URL=

# OpenRouter — optional, used for insight, news, and chat fallback
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-haiku

# PostHog — optional, used for analytics tracking
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# FX rates — optional, falls back to hardcoded approximate rates
FX_API_KEY=
```

> **Note:** The app runs fully in stub/mock mode with no credentials configured. Mock accounts, a stub plan, placeholder insights, and sample news items are all provided as fallbacks.

### 3. Set up Supabase tables

Create the following tables in your Supabase project:

**`user_plans`**
```sql
create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan jsonb not null,
  created_at timestamptz default now()
);
```

**`user_news`**
```sql
create table user_news (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  items jsonb not null,
  fetched_at timestamptz default now()
);
```

**`plaid_items`**
```sql
create table plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  access_token text not null,
  institution text
);
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── page.tsx                     # Public marketing landing page
├── (auth)/                      # Sign-in and sign-up pages
├── onboarding/                  # 3-step onboarding wizard
│   └── steps/
│       ├── StepCountries.tsx    # Country + account type selection
│       ├── StepConnect.tsx      # Plaid link or manual balance entry
│       └── StepGoals.tsx        # Age, goals, and notes
├── dashboard/                   # Authenticated dashboard (plan, chat, news)
└── api/
    ├── plan/                    # Generate financial plan
    ├── chat/                    # Streaming AI chat
    ├── ai-proxy/                # Generic AI proxy (N8N → OpenRouter)
    ├── insight/                 # Daily spotlight insight
    ├── news/                    # Personalised news feed
    ├── fx/                      # Live exchange rates
    └── plaid/                   # Plaid Link token + token exchange
components/                      # Shared UI components
lib/supabase/                    # Supabase client helpers (browser + server)
middleware.ts                    # Auth guard for /dashboard and /onboarding
```

---

## Plaid Integration

The Plaid integration is fully implemented. To enable real bank account connectivity:

1. Create a free account at [dashboard.plaid.com](https://dashboard.plaid.com)
2. Copy your **Client ID** and **Sandbox Secret**
3. Add them to `.env.local`:
   ```env
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_sandbox_secret
   PLAID_ENV=sandbox
   ```

Without these keys, the onboarding step falls back to two hardcoded demo accounts (Chase 401k and TD RRSP) with a visible warning banner.

---

## AI Services

| Feature | Service | Model | Status |
|---|---|---|---|
| **Financial plan** | **n8n → Supabase (market data) → OpenRouter** | **`claude-3.5-sonnet`** | **✅ Production** |
| Chat | n8n → OpenRouter → stub | `claude-3.5-haiku` | ⚠️ Stub |
| AI Proxy (generic) | n8n → OpenRouter | configurable (default: `claude-3.5-haiku`) | ✅ Production |
| Daily insight | OpenRouter | `gemini-flash-1.5` | ⚠️ Stub |
| News feed | OpenRouter | `perplexity/sonar-pro` | ⚠️ Stub |

All AI endpoints degrade gracefully if API keys are missing.

### Financial Plan Generation (Production Ready!)

The plan generation workflow is fully operational and includes:
- ✅ Real-time market data integration (S&P 500, Treasury yields, inflation, MSCI World)
- ✅ Cross-border financial analysis for multiple countries
- ✅ Personalized recommendations across Tax, Retirement, Currency, and Estate planning
- ✅ 7% growth projections and 4% withdrawal estimates
- ✅ Comprehensive AI prompt with user context and market conditions

**Test the live endpoint:**
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/plan-generation \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["US", "CA"],
    "residenceCountry": "US",
    "retirementCountry": "CA",
    "currentAge": 35,
    "retirementAge": 55,
    "accounts": [{"type": "401k", "country": "US", "balanceUsd": 50000, "currency": "USD"}],
    "goals": ["tax", "retirement"],
    "notes": "Planning to move"
  }'
```

### API Endpoints

**`/api/ai-proxy`** - Generic AI proxy endpoint (NEW!)
- Proxies requests to N8N workflow → OpenRouter
- Accepts any model, messages, and parameters
- Returns OpenRouter chat completion response
- Example usage:
  ```bash
  curl -X POST https://your-app.vercel.app/api/ai-proxy \
    -H "Content-Type: application/json" \
    -d '{
      "messages": [{"role": "user", "content": "Hello!"}],
      "model": "anthropic/claude-3.5-haiku",
      "max_tokens": 150
    }'
  ```

---

## Recent Improvements

### Dashboard UX Enhancements (March 2026)

**Account Management Visibility**
- Added prominent "Your Financial Snapshot" header above metrics
- Display connected account count with green checkmark badge
- "Manage accounts" button with settings icon for easy access
- Clear data source attribution showing Plaid sync status
- Account management controls visible for all users with connected accounts

**Currency Toggle Improvements**
- Custom CSS tooltips with dark background and high contrast
- Smooth fade-in animations for better visibility
- Tooltips positioned below buttons to avoid browser frame conflicts
- Clear explanations of what each currency mode displays

**Demo Mode for Presentations**
- Introduction banner explaining Prestige Worldwide's value proposition
- Feature overview panel highlighting key capabilities
- Demo news items showcasing news feed functionality
- Helpful guidance for chat interactions
- Self-explanatory UI for first-time visitors

**Plaid Integration Fixes**
- Fixed z-index conflicts preventing Plaid popup visibility
- Plaid modal now renders at z-index 99999, above all other content
- Smooth connection experience without UI obstruction

**Analytics Integration**
- PostHog tracking for key user actions
- Events tracked: sign-ups, bank connections, chat interactions
- Foundation for data-driven product improvements

---

## Production Status

**Current Version:** Live on Vercel
**Last Updated:** March 2026
**Status:** MVP Ready 🚀

**What's Working:**
- ✅ Complete authentication flow (sign-up, sign-in, password reset)
- ✅ 3-step onboarding wizard with Plaid integration
- ✅ AI-powered financial plan generation with market data
- ✅ Real-time streaming chat with Claude
- ✅ Personalized news feed
- ✅ Multi-currency support with live FX rates
- ✅ Demo mode for presentations
- ✅ Analytics tracking with PostHog
- ✅ Mobile-responsive design
- ✅ Comprehensive error handling

**Known Limitations:**
- Plaid in sandbox mode (demo accounts only)
- N8N integration optional (falls back to OpenRouter)
- No Row Level Security on Supabase tables (planned for production)
- Manual market data fetching (automation planned)

**Next Steps:**
- Visual theming system ("Dream Lifestyle Modes")
- Geographic AI advisors (country-specific expertise)
- Automated testing infrastructure
- Production Plaid deployment
- Real-time balance refresh
