# Prestige Worldwide — Session Notes

> **Instructions for Claude:** At the start of each session, read this file in full before doing anything else. It is the authoritative record of what has been built, what decisions were made, and what to do next.

---

## Project Overview

**Prestige Worldwide** is an AI-powered personal finance web app for people with cross-border financial lives — expats, dual citizens, cross-border workers, international retirees. It allows users to connect bank accounts across multiple countries, receive a personalised AI financial plan, and get daily AI-powered insights and news.

**Repo:** `jbassil-png/prestige-worldwide`
**Primary dev branch:** `claude/start-planning-gWIXp`
**Production branch:** `main`
**Deployment:** Vercel (auto-deploys on push to `main`)

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

Three tables must exist in the Supabase project:

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

## Current Status

- **App is live on Vercel** — Production deployment from `main` (`1715ad8`) is Ready.
- All environment variables are configured.
- The app has never been end-to-end tested in production. Testing is the next task.

---

## Next Session: Testing Checklist

Work through the following flows on the live Vercel URL:

### 1. Authentication
- [ ] Sign up with a new email address
- [ ] Confirm email (check Resend is delivering confirmation emails)
- [ ] Sign in with confirmed account
- [ ] Sign out and sign back in
- [ ] Test middleware redirect — unauthenticated access to `/dashboard` should redirect to sign-in

### 2. Onboarding
- [ ] Step 1 (Countries): Select 2+ countries and account types, proceed
- [ ] Step 2 (Connect): Test Plaid sandbox link (use Plaid sandbox credentials: username `user_good`, password `pass_good`)
- [ ] Step 2 (Connect): Test manual balance entry as fallback
- [ ] Step 3 (Goals): Enter age, goals, notes, submit

### 3. Dashboard
- [ ] AI financial plan generates (or stub appears if OpenRouter is slow/unavailable)
- [ ] Daily insight loads
- [ ] News feed loads
- [ ] AI chat responds
- [ ] Currency toggle works (USD / native currencies)
- [ ] FX rates are live (not hardcoded approximations)

### 4. Edge Cases
- [ ] What happens if a user skips Plaid and uses manual balances only?
- [ ] What does the plan look like with a single country vs. multiple?

---

## Known Issues / Things to Watch

- **Plaid is sandbox only** — real bank connections require switching to `development` or `production` and applying for Plaid production access.
- **N8N not configured** — plan generation and chat use OpenRouter fallback. If more sophisticated AI orchestration is needed later, n8n can be added.
- **No RLS (Row Level Security)** on Supabase tables — this should be addressed before any real user data is stored.
- **OpenRouter model for plan/chat** — currently defaults to `claude-3.5-haiku`. Can be changed via `OPENROUTER_MODEL` env var.
