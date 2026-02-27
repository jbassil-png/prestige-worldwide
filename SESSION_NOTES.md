# Prestige Worldwide — Session Notes

> **Instructions for Claude:** At the start of each session, read the "Project Overview" and "Recent Sessions" sections below to understand the project mission and current status. Only read the full document if you need deeper context.

---

## 📅 Recent Sessions
*Most recent first. Archive sessions older than 2 weeks.*

### Session: Feb 27, 2026 — Manual Testing & Bug Documentation

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ Created `docs/MANUAL_TEST_CHECKLIST.md` - comprehensive testing checklist
2. ✅ Performed manual testing of production app on Vercel:
   - Sign-in process: Working ✅
   - Middleware protection: Working ✅
   - Chat panel: Working ✅ (SSE streaming confirmed)
   - News panel: Bug found ⚠️
3. ✅ Created `docs/BACKLOG.md` for tracking non-critical issues
4. ✅ Documented bugs found during testing:
   - **Bug #1:** Sign-up redirect provides no user feedback (Low priority)
   - **Bug #2:** News API returns empty array instead of stub news when `OPENROUTER_API_KEY` not configured (Medium priority)

**Testing Status:**
- Sign-up flow: Skipped (requires deleting user in Supabase, too cumbersome)
- Sign-in: ✅ Tested, working
- Middleware: ✅ Tested, working
- Dashboard features: ✅ Partially tested
- Chat: ✅ Tested, SSE streaming confirmed
- News: ⚠️ Bug found and documented

**Current State:**
- Next.js update manual testing considered complete
- Bugs documented in BACKLOG.md for later fixes
- All changes committed and pushed to `claude/start-planning-gWIXp`

**Next Steps:**
- [ ] Set up Vitest/Jest testing infrastructure
- [ ] Create unit tests for AlphaVantage integration
- [ ] Create API route integration tests
- [ ] Add test scripts to package.json

---

### Session: Feb 20-25, 2026 — AlphaVantage Market Data Integration

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ Set up **AlphaVantage API** integration for real-time market data
2. ✅ Created Supabase `market_data` table with schema:
   - S&P 500 (SPY ETF) close price & YTD return
   - 10-Year Treasury yield
   - MSCI World (VT ETF) close price & YTD return
   - Inflation rate
   - Daily snapshots with date-based uniqueness
3. ✅ Created `scripts/fetch-market-data.ts` - fetches live data from Alpha Vantage
4. ✅ Created `scripts/seed-market-data.ts` - seeds 30 days of sample data for development
5. ✅ Added NPM scripts:
   - `npm run fetch-market-data` - fetch live data (respects API rate limits)
   - `npm run seed-market-data` - generate sample data
6. ✅ Configured `ALPHA_VANTAGE_API_KEY` in `.env.local`
7. ✅ Created comprehensive documentation: `docs/MARKET_DATA_SETUP.md`

**Technical Details:**
- API: Alpha Vantage (Free tier: 25 calls/day, 5 calls/minute)
- Script handles rate limiting with 12-second delays
- Graceful fallbacks for API failures
- Upsert logic prevents duplicate entries

**Files Created:**
- `scripts/fetch-market-data.ts`
- `scripts/seed-market-data.ts`
- `docs/MARKET_DATA_SETUP.md`

**Database:**
- Table: `market_data`
- RLS: Enabled (read-only for authenticated users)

**Next Steps:**
- [ ] Write unit tests for market data fetcher functions
- [ ] Set up automated daily fetching (GitHub Actions or cron)
- [ ] Integrate market data into AI financial planning prompts

---

## 📋 Archive: Older Sessions
*Sessions from before Feb 20, 2026*

---

## Project Overview

### 🎯 Core Mission

**Democratizing sophisticated wealth management through AI-powered investment advisory**

Making institutional-grade investment strategies accessible to everyday investors through:
- Personalized multi-asset portfolio recommendations
- Real-time market data integration
- AI-powered risk assessment and rebalancing
- Educational approach to financial literacy

**Target Users:** People with cross-border financial lives — expats, dual citizens, cross-border workers, international retirees.

**Key Features:** Connect bank accounts across multiple countries, receive a personalised AI financial plan, and get daily AI-powered insights and news.

**Repo:** `jbassil-png/prestige-worldwide`
**Primary dev branch:** `claude/start-planning-gWIXp`
**Production branch:** `main`
**Deployment:** Vercel (auto-deploys on push to `main`)

### 🎓 Learning-First Development Approach

**This project emphasizes learning by doing with hands-on guidance.** The development process is designed to build sustainable knowledge, not just working code.

**Primary Learning Objectives:**

1. **Supabase (Backend-as-a-Service)**
   - PostgreSQL database design and schema modeling
   - Row Level Security (RLS) policies for multi-tenant data
   - Authentication flows and session management
   - Real-time subscriptions and presence features
   - Edge Functions for serverless backend logic

2. **N8N (Workflow Automation)**
   - How to design workflows visually (nodes, connections, data flow)
   - How to handle webhooks (receiving data from Next.js)
   - How to make HTTP requests (calling external APIs)
   - How to transform data between steps (functions, expressions)
   - How to handle errors and retries
   - How to test and debug workflows

3. **OpenRouter (Model Marketplace)**
   - How different models compare (speed, cost, capabilities)
   - How to choose the right model for each use case
   - How to structure prompts for different models
   - How to handle streaming vs. non-streaming responses
   - How to track costs and usage
   - How to fallback between models

**Teaching Methodology:**
- **Explain the concept** (what and why)
- **Show an example** (how it works)
- **User does it** (hands-on practice)
- **Review together** (understanding check)

**Why This Matters:**
- Owner wants sustainable knowledge, not just working code
- Learning these tools enables independent feature development
- Understanding architecture enables better decision-making
- Hands-on experience builds confidence and ownership

⚠️ **For future sessions:** Always check if user wants to learn something hands-on vs. having it built for them. Default to teaching mode when introducing new tools/concepts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom `brand` colour scale) |
| Auth & Database | Supabase |
| Bank Connectivity | Plaid |
| AI Orchestration | n8n webhooks (optional — OpenRouter is the fallback) |
| LLM Provider | OpenRouter (Claude, Gemini Flash, Perplexity Sonar Pro) |
| Email | Resend |
| FX Rates | exchangerate-api.com |

---

## App Structure

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
    ├── plan/                    # Generate financial plan (n8n → OpenRouter → stub)
    ├── chat/                    # Streaming AI chat (n8n → OpenRouter → stub)
    ├── insight/                 # Daily spotlight insight (OpenRouter)
    ├── news/                    # Personalised news feed (OpenRouter/Perplexity)
    ├── fx/                      # Live exchange rates (exchangerate-api.com)
    └── plaid/                   # Plaid Link token + token exchange
components/                      # Shared UI components
lib/supabase/                    # Supabase client helpers (browser + server)
middleware.ts                    # Auth guard for /dashboard and /onboarding
```

---

## Supabase Tables Required

Four tables must exist in the Supabase project:

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

**`market_data`** *(Added Feb 2026)*
```sql
create table market_data (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  sp500_close decimal(10,2),
  sp500_ytd_return decimal(5,2),
  bond_yield_10y decimal(4,2),
  inflation_rate decimal(4,2),
  msci_world_close decimal(10,2),
  msci_world_ytd_return decimal(5,2),
  fetched_at timestamptz default now()
);
```

---

## AI Services

| Feature | Service | Model |
|---|---|---|
| Financial plan | n8n → OpenRouter → stub | configurable |
| Chat | n8n → OpenRouter → stub | `anthropic/claude-3.5-haiku` |
| Daily insight | OpenRouter | `gemini-flash-1.5` |
| News feed | OpenRouter | `perplexity/sonar-pro` |

All AI endpoints degrade gracefully if API keys are missing — stub/mock responses are returned.

---

## Environment Variables

All of the following have been configured in **Vercel** (Production environment):

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API | Secret |
| `RESEND_API_KEY` | resend.com → API Keys | Also configured in Supabase SMTP settings |
| `PLAID_CLIENT_ID` | dashboard.plaid.com → Team Settings → Keys | |
| `PLAID_SECRET` | dashboard.plaid.com → Team Settings → Keys | Sandbox secret |
| `PLAID_ENV` | — | Set to `sandbox` |
| `OPENROUTER_API_KEY` | openrouter.ai → Keys | Key named "prestige-worldwide" |
| `OPENROUTER_MODEL` | — | Defaults to `anthropic/claude-3.5-haiku` (not explicitly set) |
| `FX_API_KEY` | exchangerate-api.com | Free tier, 1,500 req/month |
| `ALPHA_VANTAGE_API_KEY` | alphavantage.co | Key: `SW2REBLWPLDHLVN5` (Free tier: 25 calls/day) |

**N8N:** Deliberately skipped. `N8N_WEBHOOK_URL` and `N8N_CHAT_WEBHOOK_URL` are not set. Both `/api/plan` and `/api/chat` fall back to OpenRouter automatically when these are absent.

**Plaid tier:** Hobbyist (free). Using `sandbox` mode — no real bank connections yet. Can be upgraded to `development` (100 real connections free) or `production` when ready.

---

## Git & Deployment History

Work has been done across multiple PRs, all merged from `claude/start-planning-gWIXp` into `main`:

| PR | Key Changes |
|---|---|
| #2 | GitHub Pages deployment via Actions |
| #3 | Fix asset paths for GitHub Pages subdirectory |
| #4 | Add auth, onboarding wizard, dashboard, AI chat; Supabase/Plaid deps |
| #5 | Comprehensive README |
| #6 | Fix auth flow (callback route, middleware cookies, sign-up confirmation, OTP redirects) |
| #7 | Fix build errors (plan non-null assertion, Suspense boundary) |
| #8 | Replace GitHub Pages deploy with CI build check; fix CI env vars |
| #9 | Add Resend email integration; fix Vercel deployment (upgrade Next.js, defer Supabase client init) |

**Latest commit on `main`:** `1715ad8` — Merge pull request #9

---

## Development Workflow

### **Branch Strategy:**
- Main development happens on `claude/start-planning-*` branches
- Commit frequently with descriptive messages
- Push when work is complete or at logical checkpoints

### **Pull Request Workflow:**
**⚠️ ALWAYS create a PR with title and description when ready to push**

When work is complete and pushed:
1. **Review commits** included in the PR (`git log origin/main..HEAD`)
2. **Generate PR title** - Clear, concise summary (< 70 characters)
3. **Write PR description** with:
   - Summary (bullet points of key changes)
   - Detailed sections (Security, Documentation, Features, etc.)
   - Learning objectives if applicable
   - Next steps
   - Test plan checklist
   - Session link
4. **Create the PR** using `gh pr create` with formatted title and body

This ensures every PR has proper documentation and context.

---

## Current Status (Updated: Feb 27, 2026)

- **App is live on Vercel** — Production deployment working
- **Manual testing completed** — Core flows verified (sign-in, middleware, chat, dashboard)
- **AlphaVantage integration complete** — Market data fetcher scripts ready
- **Bugs documented** — 2 non-critical issues tracked in `docs/BACKLOG.md`
- **Testing infrastructure** — Vitest/Jest setup pending (next priority)

### What Works ✅
- Authentication (sign-in)
- Middleware protection (auth redirects)
- Chat panel (SSE streaming)
- Dashboard rendering
- Market data scripts (fetch & seed)

### Known Issues ⚠️
- News API returns empty array (should show stub news)
- Sign-up redirect has no user feedback
- See `docs/BACKLOG.md` for details

---

## Next Session: Testing Infrastructure

**Priority:** Set up automated testing with Vitest/Jest

### Tasks:
1. [ ] Install and configure Vitest
2. [ ] Create test structure (`__tests__` or `.test.ts` files)
3. [ ] Write unit tests for AlphaVantage fetcher:
   - `fetchQuote()` function
   - `fetchTreasuryYield()` function
   - Error handling and rate limit logic
4. [ ] Write integration tests for API routes
5. [ ] Add test scripts to `package.json`:
   - `npm test` — run all tests
   - `npm run test:watch` — watch mode
   - `npm run test:coverage` — coverage report
6. [ ] Document test setup in README or docs

### Reference:
- Market data scripts: `scripts/fetch-market-data.ts`, `scripts/seed-market-data.ts`
- API routes to test: `/api/plan`, `/api/chat`, `/api/news`, `/api/fx`

---

## Known Issues / Things to Watch

- **Plaid is sandbox only** — real bank connections require switching to `development` or `production` and applying for Plaid production access.
- **N8N not configured** — plan generation and chat use OpenRouter fallback. If more sophisticated AI orchestration is needed later, n8n can be added.
- **No RLS (Row Level Security)** on Supabase tables — this should be addressed before any real user data is stored.
- **OpenRouter model for plan/chat** — currently defaults to `claude-3.5-haiku`. Can be changed via `OPENROUTER_MODEL` env var.

---

## 🎓 Learning Resources

### **Supabase:**
- Official docs: https://supabase.com/docs
- Key concepts: PostgreSQL, Row Level Security (RLS), Auth, Realtime, Edge Functions
- Will learn: Database design, security policies, authentication flows, real-time subscriptions

### **N8N:**
- Official docs: https://docs.n8n.io/
- Key concepts: Nodes, connections, expressions, webhooks
- Will learn: Visual workflow building, API orchestration, data transformation

### **OpenRouter:**
- Official docs: https://openrouter.ai/docs
- Key concepts: Model selection, pricing, streaming, fallbacks
- Will learn: Choosing models per use case, cost optimization, prompt engineering

### **Testing (Future):**
- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
