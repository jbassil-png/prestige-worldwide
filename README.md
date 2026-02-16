# Prestige Worldwide

**Financial planning without borders.**

Prestige Worldwide is an AI-powered personal finance tool for people with assets, retirement accounts, or tax obligations spanning multiple countries — expats, dual citizens, cross-border workers, and international retirees.

---

## Features

- **Multi-country onboarding** — select countries and account types (401k, RRSP, TFSA, ISA, SIPP, CPF, Superannuation, and more)
- **Bank account connectivity** — link real accounts via Plaid (US, CA, GB) or enter balances manually
- **AI financial plan** — personalised recommendations across retirement, tax, currency, and estate planning
- **Daily AI spotlight** — a fresh insight each day based on your specific plan
- **Personalised news feed** — AI-curated financial news relevant to your countries and account types
- **Streaming AI chat** — ask questions about your plan in context
- **Currency toggle** — view all balances in residence currency, retirement currency, or native currencies
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

# OpenRouter — optional, used for insight, news, and chat fallback
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-haiku

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

| Feature | Service | Model |
|---|---|---|
| Financial plan | n8n → OpenRouter → stub | configurable |
| Chat | n8n → OpenRouter → stub | `claude-3.5-haiku` |
| Daily insight | OpenRouter | `gemini-flash-1.5` |
| News feed | OpenRouter | `perplexity/sonar-pro` |

All AI endpoints degrade gracefully if API keys are missing.
