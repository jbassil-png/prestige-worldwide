# Claude Context — Prestige Worldwide

> **Start every session here.** Read this file first, then `SESSION_NOTES.md` (most recent entry), then begin work.

---

## Project

Cross-border financial planning app for expats, dual citizens, and global citizens. Helps users with assets in multiple countries build a unified retirement and tax strategy.

**Live:** https://prestige-worldwide-kappa.vercel.app
**Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (auth + DB), Plaid (bank data), OpenRouter (AI), PostHog (analytics), Stripe (payments), Vercel (deploy)

---

## Current Task — START HERE

**Approaching launch. Three things to close before real users:**

### 1. Plan history UI (code task)
`/plan/history` fetches from `plan_history` table successfully but the display is a stub. Real users will click this on day one. Build a simple, clean list view — date, country pair, net worth snapshot, link to view full plan.

### 2. Sign-up redirect UX (code task)
After sign-up, the redirect is silent — no feedback, looks broken. Add a brief confirmation state or loading indicator so users know something is happening.

### 3. Stripe account setup (owner action — not a code task)
All Stripe code is built and waiting. When ready:
1. Create Stripe account at stripe.com
2. Add a subscription product + price → copy the `price_id`
3. Set env vars in Vercel: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
4. Register `/api/stripe/webhook` as a webhook endpoint in Stripe dashboard
5. Run migration `20260322b_add_stripe_customer_id.sql` in Supabase SQL editor

**After these three: ship to real users and iterate based on testing.**

---

## Route Map

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/sign-in`, `/sign-up` | Supabase Auth |
| `/onboarding` | 4-step wizard (Countries → Connect → Goals → Style) — one-time only |
| `/onboarding/preview` | Public preview — no auth, no data written |
| `/dashboard` | Main authenticated view |
| `/settings` | Unified settings page — Countries, Accounts, Goals, Style, Check-ins |
| `/accounts` | Manage Plaid-connected accounts |
| `/plan/history` | Last 10 plan generations — fetch works, display is stub |
| `/contact`, `/terms`, `/privacy` | Marketing |

---

## What's Been Built

| # | Task | Status |
|---|------|--------|
| 1 | Preview page | ✅ DONE — column view, real components, mock US+CA data |
| 2 | Bug fix — `country: a.name` | ✅ DONE — `countryCode: string` on `Account` type |
| 3 | Theme design decision | ✅ DONE — palettes + typography locked in |
| 4 | Theme token system | ✅ DONE — CSS custom properties in `globals.css`; Tailwind utilities; fonts via `next/font/google` |
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
| 16 | Stripe account setup | 🔜 OWNER ACTION — see "Current Task" above for exact steps |
| 17 | Plan history UI | 🔜 NEXT CODE TASK — stub display needs replacing |
| 18 | Sign-up redirect UX | 🔜 NEXT CODE TASK — silent redirect looks broken |

**Post-launch (driven by user testing):**
- Geographic AI advisors
- Goal-account linking + unallocated bucket accuracy
- Check-in email delivery (Vercel cron + Resend)
- Polish backlog (loading reveal, PDF export, what-if analysis)

**Known gaps still open:**
- `AllocationCharts` — empty state placeholders in place; needs validation with real multi-account data
- Plan history display — stub
- Sign-up redirect — silent, no feedback

---

## Key Decisions (Settled — Do Not Revisit)

| Topic | Decision |
|-------|----------|
| Business model | Freemium. Free tier: full app access (onboarding, plan gen, dashboard, chat, news) except Plaid bank connection. Paid tier: Plaid connection unlocked. Manual account entry is always available on free tier. |
| Paid tier tracking | `is_paid boolean` column on `user_profiles`. Set by Stripe webhook on subscription events. Checked client-side in settings page. |
| Settings UX | Single non-linear page. All sections visible and independently editable. Not a wizard replay. Visually recalls onboarding aesthetic. |
| Settings entry point | One "Settings" link on the dashboard control bar. `/setup` deleted. |
| AI models | OpenRouter for all AI calls (not direct Anthropic/Google APIs) |
| Plan generation model | `anthropic/claude-3.5-haiku` default via `OPENROUTER_PLAN_MODEL` env var |
| Chat model | `anthropic/claude-3.5-haiku` via `OPENROUTER_MODEL` env var |
| Insights model | `google/gemini-flash-1.5` (hardcoded in `/api/insight`) |
| Structured output | **JSON mode** (`response_format: { type: "json_object" }`), no retry loop. Stub plan is the fallback on API failure. |
| Theme count | 3 themes |
| Theme names | Swiss Alps Retreat ❄️, Gaudy Miami 🌴, Clooney's Positano 🇮🇹 |
| Theme step placement | Step 4 in onboarding, after Goals, before plan generation |
| Theme default | Swiss Alps Retreat ❄️ (`data-theme="swiss-alps"` on `<html>`) |
| Theme palettes | Swiss Alps: slate/ice. Gaudy Miami: pink/gold. Positano: linen/terracotta. See `docs/POLISH_BACKLOG.md` for exact values. |
| Theme typography | Swiss Alps: DM Serif Display + DM Sans. Gaudy Miami: Syne + DM Sans. Positano: Cormorant Garamond + Lato. Loaded via `next/font/google`. |
| Theme token system | CSS custom properties (`--color-bg`, `--color-primary`, etc.) + `--font-heading`/`--font-body`. Tailwind `theme-*` utilities reference them. Applied via `data-theme` on `<html>`. |
| Preview page | Column view, production-accessible, real components with mock data |
| Loading reveal | Full-screen themed transition — deferred to Polish backlog |
| Horizontal scroll | Wizard uses horizontal scroll — one step per viewport, 0.45s cubic-bezier slide transition |
| Post-launch iteration | Driven by user testing — no speculative polish before real users |

---

## Onboarding Structure

```
app/onboarding/
├── page.tsx                ← 4-step wizard orchestrator
├── preview/
│   ├── page.tsx            ← Preview shell (public, no auth)
│   └── mock.ts             ← Mock US+CA data
└── steps/
    ├── StepCountries.tsx   ← Step 1: "Where are your assets?"
    ├── StepConnect.tsx     ← Step 2: "Connect your accounts" (Plaid or manual)
    ├── StepGoals.tsx       ← Step 3: "Where are you headed?"
    └── StepStyle.tsx       ← Step 4: "Choose your style"
```

### WizardData shape
```ts
type WizardData = {
  selections: CountrySelection[];
  accounts: Account[];
  goals: GoalsData;
  // theme is passed directly from StepStyle, not stored in WizardData
};
```

All step components accept `initialValues` props.

---

## Settings Structure

```
app/settings/
└── page.tsx    ← Unified settings page (client component)

app/api/
├── accounts/
│   ├── route.ts       ← GET (list) + POST (manual create) for user_accounts
│   └── [id]/route.ts  ← DELETE
├── stripe/
│   ├── checkout/route.ts  ← POST — creates Stripe Checkout session
│   └── webhook/route.ts   ← POST — handles subscription events, flips is_paid
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
| Auth | Supabase Auth (sign-in/sign-up, middleware guards `/dashboard` and `/onboarding`) |
| Database | Supabase (Postgres). Tables: `user_plans`, `user_preferences`, `user_profiles`, `user_holdings`, `user_portfolio_news`, `plaid_items`, `user_accounts`, `user_checkin_schedule` |
| AI | OpenRouter via `/api/plan` (Haiku, JSON mode), `/api/chat` (Haiku, streaming), `/api/insight` (Gemini Flash) — all have stub fallbacks |
| Bank data | Plaid (sandbox); mock accounts returned when credentials not configured |
| Payments | Stripe — checkout + webhook built; gracefully stubs when `STRIPE_SECRET_KEY` not set |
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

---

## Full Context Documents

- `docs/IMPLEMENTATION_ROADMAP.md` — Complete phase/task breakdown with sub-tasks
- `SESSION_NOTES.md` — Session-by-session history (most recent first)
- `docs/PRODUCT_PRINCIPLES.md` — UX philosophy, onboarding consistency rules
- `docs/FEATURE_AI_PLAN_GENERATION.md` — AI plan gen spec
