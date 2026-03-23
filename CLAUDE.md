# Claude Context — Prestige Worldwide

> **Start every session here.** Read this file first, then `SESSION_NOTES.md` (most recent entry), then begin work.

---

## Project

Cross-border financial planning app for expats, dual citizens, and global citizens. Helps users with assets in multiple countries build a unified retirement and tax strategy.

**Live:** https://prestige-worldwide-kappa.vercel.app
**Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (auth + DB), Plaid (bank data), OpenRouter (AI), PostHog (analytics), Stripe (payments), Vercel (deploy)

---

## Current Task — START HERE

**Stripe setup is done. The app is ready for real users.**

### Open task list (next session — pick up here)

**Blocked on Task 26 decision (free vs paid onboarding map):**

| # | Task | Status | Effort |
|---|------|--------|--------|
| 26 | Free vs paid onboarding map | 🔴 Decision needed | ~2h |
| 21 | Plaid gating in Connect step | ⏸ Blocked on 26 | ~2h |
| 23 | Goal-account linking in onboarding | ⏸ Blocked on 26 | ~3–4h |
| 27 | Synthetic test data | ⏸ Blocked on 26 | ~2h |

**Post-launch (user testing driven):**

| # | Task | Notes |
|---|------|-------|
| 22 | Geographic AI advisors | Highest differentiation |
| 23 | Goal-account linking (if not in onboarding) | Depends on Task 26 |
| 24 | Scheduled check-in email delivery | Vercel cron + Resend |
| 25 | Testing infrastructure (Vitest) | Unit + integration tests |

**Polish backlog (deferred):** Paid user badge, full-screen loading reveal, PDF export, plan comparison, what-if analysis, transaction history, dark mode, WCAG audit, DB column cleanup, centralised Plan types, editable retirement target.

---

## Route Map

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/sign-in`, `/sign-up` | Supabase Auth |
| `/onboarding` | 4-step wizard (Goals → Assets → Style → Connect) — one-time only |
| `/onboarding/preview` | Public preview — no auth, no data written |
| `/dashboard` | Main authenticated view |
| `/settings` | Unified settings page — Countries, Accounts, Goals, Style, Check-ins |
| `/accounts` | Manage Plaid-connected accounts |
| `/accounts/[id]` | Account detail page |
| `/plan` | Latest plan detail view |
| `/plan/history` | Last 10 plan generations — accordion list with full metrics + recommendations |
| `/contact`, `/terms`, `/privacy` | Marketing |
| `/auth/callback` | Supabase auth callback (magic link redirect) |
| `/dev/reset` | Dev utility — wipe user data and restart onboarding (requires `ALLOW_DEV_RESET=true`) |

---

## What's Been Built

| # | Task | Status |
|---|------|--------|
| 1 | Preview page | ✅ DONE — column view, real components, mock US+CA data |
| 2 | Bug fix — `country: a.name` | ✅ DONE — `countryCode: string` on `Account` type |
| 3 | Theme design decision | ✅ DONE — palettes + typography locked in |
| 4 | Theme token system | ✅ DONE — CSS custom properties in `globals.css`; Tailwind utilities; fonts via `@fontsource` (self-hosted) |
| 5 | `StepStyle` component | ✅ DONE — three cards with colour bar, swatches, tagline, mood, font name |
| 6 | Wire Step 4 into wizard + horizontal scroll | ✅ DONE — 4-step wizard; horizontal slide track (0.45s cubic-bezier) |
| 7 | Full-screen loading reveal | ↳ moved to `docs/POLISH_BACKLOG.md` |
| 8 | Persist theme | ✅ DONE — `user_preferences` table + RLS; upserted on plan gen; applied via `data-theme` on dashboard load |
| 9 | OpenRouter model wiring | ✅ DONE — all three routes wired; `OPENROUTER_API_KEY` + `OPENROUTER_PLAN_MODEL` in Vercel |
| 10 | `initialValues` props on step components | ✅ DONE — all four steps accept `initialValues` |
| 11 | Re-entry flow | ✅ DONE — was `/setup`; deleted in Task 14 |
| 12 | Dashboard UX pass | ✅ DONE — control bar, news promoted, top bar stripped, plan header personalised |
| 13 | Charts | ✅ DONE — `ProjectionChart` (Recharts area chart) in PlanView; `AllocationCharts` (geo + account type) in DashboardClient |
| 14 | New unified settings page | ✅ DONE — single-page non-linear; Countries, Accounts, Goals, Style, Check-ins; each saves independently; `/setup` deleted; dashboard reduced to one "Settings" link |
| 15 | Freemium model | ✅ DONE — `is_paid boolean default false` on `user_profiles`; Stripe infrastructure code-complete; upgrade button wired; keys deferred until Task 16 |
| 16 | Stripe account setup | ✅ DONE — Stripe account created, env vars set in Vercel, webhook registered, migration run |
| 17 | Plan history UI | ✅ DONE — full accordion list: date, country pair, trigger badge, 4 metrics, expandable summary + recommendations |
| 18 | Sign-up redirect UX | ✅ DONE — spinner + "Account created!" state shown during 1s redirect delay |
| 19 | Auth cleanup | ✅ DONE — removed signInWithPassword fallback; Stripe webhook now uses service-role client |
| 20 | Onboarding reorder | ✅ DONE — new sequence: Goals → Assets → Style (opt) → Connect (opt, paid); plan generates at end |

**Post-launch (driven by user testing):**
- Geographic AI advisors
- Goal-account linking + unallocated bucket accuracy
- Check-in email delivery (Vercel cron + Resend)
- Polish backlog (loading reveal, PDF export, what-if analysis)

**Known gaps still open:**
- `AllocationCharts` — empty state placeholders in place; needs validation with real multi-account data
- Plaid Connect in onboarding still shows both tabs (Plaid + manual) for free users — should show upgrade prompt for Plaid tab and encourage manual entry

---

## Key Decisions (Settled — Do Not Revisit)

| Topic | Decision |
|-------|----------|
| Business model | Freemium. Free tier: full app access (onboarding, plan gen, dashboard, chat, news) except Plaid bank connection. Paid tier: Plaid connection unlocked. Manual account entry is always available on free tier. |
| Paid tier tracking | `is_paid boolean` column on `user_profiles`. Set by Stripe webhook (service-role client, bypasses RLS) on subscription events. Checked client-side in settings page. |
| Settings UX | Single non-linear page. All sections visible and independently editable. Not a wizard replay. Visually recalls onboarding aesthetic. |
| Settings entry point | One "Settings" link on the dashboard control bar. `/setup` deleted. |
| AI models | OpenRouter for all AI calls (not direct Anthropic/Google APIs) |
| Plan generation model | `anthropic/claude-3.5-haiku` default via `OPENROUTER_PLAN_MODEL` env var |
| Chat model | `anthropic/claude-3.5-haiku` via `OPENROUTER_MODEL` env var |
| Insights model | `google/gemini-flash-1.5` (hardcoded in `/api/insight`) |
| Structured output | **JSON mode** (`response_format: { type: "json_object" }`), no retry loop. Stub plan is the fallback on API failure. |
| Theme count | 3 themes |
| Theme names | Swiss Alps Retreat ❄️, Gaudy Miami 🌴, Clooney's Positano 🇮🇹 |
| Theme step placement | Step 3 (optional) in onboarding, after Assets, before Connect |
| Theme default | Swiss Alps Retreat ❄️ (`data-theme="swiss-alps"` on `<html>`) |
| Theme palettes | Swiss Alps: slate/ice. Gaudy Miami: pink/gold. Positano: linen/terracotta. See `docs/POLISH_BACKLOG.md` for exact values. |
| Theme typography | Swiss Alps: DM Serif Display + DM Sans. Gaudy Miami: Syne + DM Sans. Positano: Cormorant Garamond + Lato. Loaded via `@fontsource` (self-hosted, no build-time network fetch). |
| Theme token system | CSS custom properties (`--color-bg`, `--color-primary`, etc.) + `--font-heading`/`--font-body`. Tailwind `theme-*` utilities reference them. Applied via `data-theme` on `<html>`. |
| Onboarding sequence | Goals (req) → Assets (req) → Style (opt) → Connect (opt, paid). Plan generates at end of wizard (after Connect or skip). |
| Connect step gating | Plaid connection is paid-tier only. Free users can use manual entry in Connect step or skip entirely. |
| Preview page | Column view, production-accessible, real components with mock data |
| Loading reveal | Full-screen themed transition — deferred to Polish backlog |
| Horizontal scroll | Wizard uses horizontal scroll — one step per viewport, 0.45s cubic-bezier slide transition |
| Post-launch iteration | Driven by user testing — no speculative polish before real users |
| Supabase clients | Anon SSR client for user-facing routes; `createAdminClient()` (service role) for server-only trusted contexts (Stripe webhook, future cron jobs) |
| Email confirmation | Disabled in Supabase. `signUp()` returns session immediately. No fallback sign-in attempt. |

---

## Onboarding Structure

```
app/onboarding/
├── page.tsx                ← 4-step wizard orchestrator
├── preview/
│   ├── page.tsx            ← Preview shell (public, no auth)
│   └── mock.ts             ← Mock US+CA data
└── steps/
    ├── StepGoals.tsx       ← Step 1 (required): "Let's get to know your situation"
    ├── StepCountries.tsx   ← Step 2 (required): "Where are your assets?"
    ├── StepStyle.tsx       ← Step 3 (optional): "Choose your style"
    └── StepConnect.tsx     ← Step 4 (optional, paid): "Connect your accounts"
```

### WizardData shape
```ts
type WizardData = {
  goals: GoalsData;       // captured in Step 1
  selections: CountrySelection[]; // captured in Step 2
  // theme tracked separately (setTheme state)
  // accounts passed directly to handleFinish()
};
```

Plan generates at the end of step 4 (Connect complete or skip). Payload: goals + selections + accounts (empty array if Connect skipped). Theme saved to `user_preferences` and `sessionStorage.pw_theme`.

All step components accept `initialValues` props.

---

## Settings Structure

```
app/settings/
├── page.tsx           ← Server wrapper; exports `dynamic = "force-dynamic"` to prevent prerender failure
└── SettingsClient.tsx ← Unified settings page (client component)

app/api/
├── accounts/
│   ├── route.ts       ← GET (list) + POST (manual create) for user_accounts
│   └── [id]/route.ts  ← DELETE
├── stripe/
│   ├── checkout/route.ts  ← POST — creates Stripe Checkout session
│   └── webhook/route.ts   ← POST — uses admin client; handles subscription events, flips is_paid
```

**Settings sections (all independently saveable):**
1. Countries — residence + retirement → `PUT /api/profile`
2. Accounts — list/delete existing; manual add → `POST /api/accounts`; Plaid gated by `is_paid`
3. Goals — retirement year → `PUT /api/profile`
4. Style — theme picker → upsert `user_preferences` via Supabase client; applies instantly
5. Check-ins — frequency → `PUT /api/checkin-schedule`

---

## Dashboard Structure

**Layout:** 2-column on desktop (plan/news/allocations left; sticky chat right), single column on mobile.

**Left column (top to bottom):**
1. Demo banner (unauthenticated only) — marketing copy + CTA
2. Personalised control bar (authenticated) — country pair, plan date, currency toggle, refresh plan, Settings link
3. News panel — portfolio news (Alpha Vantage, 30-min cache) or demo news
4. Plan view — summary, metrics, projection chart, recommendations
5. Allocation charts — geo breakdown + account type breakdown

**Right column (sticky, desktop only):**
6. Chat panel — streaming chat with plan context

---

## Key Architecture

| Concern | Implementation |
|---------|----------------|
| Auth | Supabase Auth (sign-in/sign-up, middleware guards `/dashboard` and `/onboarding`). Email confirmation disabled. |
| Database | Supabase (Postgres). Tables: `user_plans`, `user_preferences`, `user_profiles`, `user_holdings`, `user_portfolio_news`, `plaid_items`, `user_accounts`, `user_checkin_schedule`, `user_goals`, `plan_history`, `user_balance_history`, `market_data` |
| Supabase clients | `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (SSR, cookie-based), `lib/supabase/admin.ts` (service role, no RLS — webhooks only) |
| AI | OpenRouter via `/api/plan` (Haiku, JSON mode), `/api/chat` (Haiku, streaming), `/api/insight` (Gemini Flash) — all have stub fallbacks |
| Bank data | Plaid (sandbox); mock accounts returned when credentials not configured |
| Payments | Stripe — checkout + webhook built; webhook uses service-role client to bypass RLS; gracefully stubs when `STRIPE_SECRET_KEY` not set |
| Analytics | PostHog — `onboarding_started`, `plan_generated`, `onboarding_completed`, `plan_refreshed`, `chat_message_sent` |
| Theme system | CSS custom properties in `globals.css`; applied via `data-theme` on `<html>`; persisted to `user_preferences` table |
| Charts | Recharts (`ProjectionChart`); CSS bar charts (`AllocationCharts`) |

---

## Dev Workflow Notes

- **Branch:** Check `SESSION_NOTES.md` for the current working branch
- **Mock data path:** If no Supabase session, plan is stored in `sessionStorage` as `pw_plan` and read by `DashboardClient` on load
- **Plaid mock:** If `PLAID_CLIENT_ID` not set, `/api/plaid/link-token` returns `{ mock: true }` and onboarding shows demo accounts
- **Stripe mock:** If `STRIPE_SECRET_KEY` not set, `/api/stripe/checkout` returns `{ mock: true }` and settings shows "coming soon" alert
- **Preview page:** Navigate to `/onboarding/preview` — no auth required, no data written
- **OpenRouter:** `OPENROUTER_API_KEY` and `OPENROUTER_PLAN_MODEL` set in Vercel for all environments
- **Admin client:** `createAdminClient()` in `lib/supabase/admin.ts` — uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS. Only use server-side in trusted contexts.
- **Dev reset:** Navigate to `/dev/reset` to wipe all user data for the current account and restart onboarding. Requires `ALLOW_DEV_RESET=true` env var — works in any environment when explicitly set. Not linked from the UI; visit directly.

---

## Full Context Documents

- `docs/IMPLEMENTATION_ROADMAP.md` — Complete phase/task breakdown with sub-tasks
- `SESSION_NOTES.md` — Session-by-session history (most recent first)
- `docs/PRODUCT_PRINCIPLES.md` — UX philosophy, onboarding consistency rules
- `docs/FEATURE_AI_PLAN_GENERATION.md` — AI plan gen spec
