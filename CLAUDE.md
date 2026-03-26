# Claude Context — Prestige Worldwide

> **Start every session here.** Read this file first, then `SESSION_NOTES.md` (most recent entry), then begin work.

---

## Project

Cross-border financial planning app for expats, dual citizens, and global citizens. Helps users with assets in multiple countries build a unified retirement and tax strategy.

**Live:** https://prestige-worldwide-kappa.vercel.app
**Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (auth + DB), Plaid (bank data), OpenRouter (AI), PostHog (analytics), Stripe (payments), Vercel (deploy)

---

## Current Task — START HERE

**Stripe setup is done. The app is ready for real users. Class presentation live.**

### Open task list (next session — pick up here)

**Immediate:**

| # | Task | Notes |
|---|------|-------|
| — | Test run: paid demo flow | Walk full paid onboarding from /try; verify dashboard with paid features |
| 30 | Apply paid theming end-to-end | Ensure theme tokens (Swiss Alps / Gaudy Miami / Positano) drive visual changes beyond just CSS variable definitions — cards, headers, buttons, backgrounds should reflect the selected theme; confirm theme persists correctly through onboarding → dashboard |

**Pre-launch (build before first real users):**

| # | Task | Notes |
|---|------|-------|
| 22 | Geographic AI advisors | Task 28 scaffold done — now unblocked |
| 24 | Portfolio audit + check-in email delivery | Vercel cron + Resend; two-tier (free/paid) |
| 25 | Testing infrastructure (Vitest) | Unit + integration tests |

**Polish backlog (deferred):** Full-screen loading reveal, PDF export, plan comparison, what-if analysis, transaction history, dark mode, WCAG audit, DB column cleanup, centralised Plan types, editable retirement target.

---

## Route Map

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/sign-in`, `/sign-up` | Supabase Auth |
| `/try` | Public demo page — pick free or paid account; auto-signs in and redirects to `/dev/reset` → fresh onboarding |
| `/onboarding` | Wizard — Free: 3 steps (Goals → Assets → Connect). Paid: 4 steps (+ Personalise). One-time only. |
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
| 21 | Explicit free-tier messaging in Connect step | ✅ DONE — amber banner replaces silently-disabled Plaid tab; inline upgrade CTA; free users go straight to manual entry |
| 23 | Goal-account linking in Assets step | ✅ DONE — `GoalLink` type + per-account dropdown in `StepCountries`; unallocated bucket; wired into `WizardData` |
| 28 | Paid "Personalise" step | ✅ DONE — `StepPersonalise.tsx`; three panels: theme picker, advisor cards (coming-soon overlays), audit frequency selector; saves theme to `user_preferences` + frequency to `user_checkin_schedule` at plan gen |
| — | Bug fix — `user_profiles` not written on onboarding | ✅ DONE — `handleFinish()` now upserts `residence_country`, `retirement_country`, `retirement_year` to `user_profiles` |
| — | Bug fix — `user_accounts` RLS blocked inserts | ✅ DONE — migration `20260324_fix_user_accounts_rls.sql` adds INSERT/UPDATE/DELETE policies + grants for authenticated users |
| 27 | Demo accounts | ✅ DONE — free + paid both seeded. See demo accounts section below. |
| 29 | Class presentation | ✅ DONE — live at `/presentation/index.html`; 10-slide VC-pitch deck; keyboard-navigable. Slide 10 restructured as 3 sequential steps (reset → free login → paid login). |
| — | Dashboard user identity | ✅ DONE — header shows email + "Free demo" / "Paid demo" / "Pro" badge near Sign Out |
| — | Landing page refresh | ✅ DONE — Features + HowItWorks updated to reflect what's built; CTASection now Free vs Pro pricing table |
| — | Auth-aware Navbar | ✅ DONE — `NavbarAuthButtons` shows "Dashboard →" when logged in; landing page viewable while authenticated |
| — | `/try` demo page | ✅ DONE — replaces `/onboarding/preview`; auto-signs in as free or paid demo account → `/dev/reset` → onboarding |
| — | Hero CTAs | ✅ DONE — three paths: Try demo → `/try`, Sign up free → `/sign-up`, Sign in → `/sign-in` |
| — | Dashboard layout refactor | ✅ DONE — CurrencyToggle inside PlanView below "Your Financial Snapshot"; AllocationCharts inside PlanView below metric cards; "Goals" section header; Recommendations removed |
| — | Dashboard: unallocated bucket + goal cards | ✅ DONE — unallocated hides when all accounts linked to goals; non-retirement goals shown as individual cards; PlanView fetches `user_goals` |
| — | Onboarding: retirement target currency | ✅ DONE — target amount shows retirement country currency (symbol + code); `COUNTRY_CURRENCY` map added to `StepGoals` |
| — | Onboarding: remove planning assistant refs | ✅ DONE — "Ask our planning assistant" button + helper text removed from `StepGoals`; assistant accessible from dashboard post-onboarding |

---

## Key Decisions (Settled — Do Not Revisit)

| Topic | Decision |
|-------|----------|
| Business model | Freemium. Free: plan gen, dashboard, chat, news, manual accounts, goal-account linking. Paid: Plaid, non-default themes, country-specific advisors, thorough portfolio audit scheduling. |
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
| Theme step placement | Paid onboarding only — panel 1 of Personalise step (step 4). Not in free onboarding. `StepStyle` retained for Settings re-use. |
| Theme gating | Free users locked to Swiss Alps (default). Paid users can select any of the three themes during onboarding or in Settings. |
| Theme default | Swiss Alps Retreat ❄️ (`data-theme="swiss-alps"` on `<html>`) |
| Theme palettes | Swiss Alps: slate/ice. Gaudy Miami: pink/gold. Positano: linen/terracotta. See `docs/POLISH_BACKLOG.md` for exact values. |
| Theme typography | Swiss Alps: DM Serif Display + DM Sans. Gaudy Miami: Syne + DM Sans. Positano: Cormorant Garamond + Lato. Loaded via `@fontsource` (self-hosted, no build-time network fetch). |
| Theme token system | CSS custom properties (`--color-bg`, `--color-primary`, etc.) + `--font-heading`/`--font-body`. Tailwind `theme-*` utilities reference them. Applied via `data-theme` on `<html>`. |
| Onboarding sequence — free | Goals (req) → Assets + Goal Linking (req) → Connect (manual-only, skippable) → plan generates. 3 steps. |
| Onboarding sequence — paid | Goals (req) → Assets + Goal Linking (req) → Connect (Plaid+manual, skippable) → Personalise (opt) → plan generates. 4 steps. |
| Plan generation timing | Deferred to end of full wizard. Free: generates after step 3. Paid: generates after step 4. Personalise step data (theme, advisors, frequency) included in plan payload for paid users. |
| Connect step gating | Free users see explicit messaging ("you're on the free plan — manual entry only") with an upgrade CTA. Not a silently-disabled tab. |
| Goal-account linking | In the Assets step for all users (free + paid). Each account linked to a goal or explicitly left in "unallocated" bucket. |
| Geographic advisors | Free: single generalist advisor (current chat assistant). Paid: country-specific advisors auto-assigned from selected countries. |
| Portfolio audit | Paid-only. Thorough AI-generated report (goals progress, allocation drift, per-country notes, recommendations). Expansion of check-in concept. Frequency set in Personalise step and Settings. |
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
├── page.tsx                ← Wizard orchestrator (free: 3 steps, paid: 4 steps)
├── preview/
│   ├── page.tsx            ← Preview shell (public, no auth)
│   └── mock.ts             ← Mock US+CA data
└── steps/
    ├── StepGoals.tsx       ← Step 1 (required, all): "Let's get to know your situation"
    ├── StepCountries.tsx   ← Step 2 (required, all): "Where are your assets?" + goal-account linking
    ├── StepConnect.tsx     ← Step 3 (optional, all): "Connect your accounts" — free shows explicit gate + upgrade CTA; paid shows Plaid+manual
    ├── StepPersonalise.tsx ← Step 4 (optional, PAID ONLY): themes + advisor selection + audit frequency
    └── StepStyle.tsx       ← Retained for Settings re-use; not rendered in onboarding wizard
```

**Free flow:** Steps 1 → 2 → 3 → **plan generates** (after Connect complete or skip)
**Paid flow:** Steps 1 → 2 → 3 → 4 → **plan generates** (after Personalise complete or skip)

### WizardData shape
```ts
type WizardData = {
  goals: GoalsData;               // captured in Step 1
  selections: CountrySelection[]; // captured in Step 2
  goalLinks: GoalAccountLink[];   // captured in Step 2 (goal-account linking)
  // accounts passed directly to handleFinish()
  // theme + auditFrequency passed via PersonaliseData to handleFinish() (paid users only)
};
```

Plan generates at the end of onboarding — after step 3 (Connect) for free users, after step 4 (Personalise) for paid users. This ensures the plan has full context: theme, advisors, and audit frequency are part of the payload for paid users. Payload: goals + selections + accounts + (paid) theme + advisor IDs + audit frequency. Accounts is empty array if Connect skipped.

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

**Layout:** 2-column on desktop (plan/news left; sticky chat right), single column on mobile.

**Left column (top to bottom):**
1. Demo banner (unauthenticated only) — marketing copy + CTA
2. Personalised control bar (authenticated) — country pair, plan date, refresh plan, Settings link
3. News panel — portfolio news (Alpha Vantage, 30-min cache) or demo news
4. Plan view (single card) — in order:
   - Plan summary text
   - "Your Financial Snapshot" header + CurrencyToggle + metric cards
   - Portfolio breakdown (AllocationCharts — by geography + account type)
   - Goals section — retirement projection chart, non-retirement goal cards, unallocated bucket if applicable
   - Plan disclaimer

**Right column (sticky, desktop only):**
5. Chat panel — streaming chat with plan context

**Notes:**
- CurrencyToggle lives inside PlanView (not the control bar); all monetary values update on toggle
- Recommendations section has been removed from PlanView
- AllocationCharts shows percentages only (not monetary values); currency toggle does not affect it

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
- **Email confirmation:** Disabled in Supabase. `signUp()` returns a session immediately. Demo accounts use fake emails — no real inbox required.

---

## Demo Accounts

Two dedicated accounts for testing and sharing. Both use fake email addresses — no real inboxes, email confirmation is disabled.

| Account | Email | Password | `is_paid` | Status |
|---------|-------|----------|-----------|--------|
| Free demo | `demo@prestigeworldwide.com` | `demo123456` | `false` | ✅ Seeded |
| Paid demo | `paid@prestigeworldwide.com` | `demo123456` | `true` | ✅ Seeded |

**Free demo canonical scenario:**
- Residence: US, Retirement: Canada, Year: 2050
- Accounts: 401(k) $85,000 USD + RRSP $62,000 CAD (both linked to retirement goal)
- Theme: Swiss Alps (default)

**Paid demo canonical scenario:**
- Residence: US, Retirement: UK, Year: 2045
- Accounts: US 401(k) $90,000 USD + UK ISA £55,000 GBP (manual, both linked to retirement goal)
- Theme: Gaudy Miami or Positano
- Audit frequency: Quarterly

**To reset either account:** Sign in as that account → navigate to `/dev/reset`.

---

## Full Context Documents

- `docs/IMPLEMENTATION_ROADMAP.md` — Complete phase/task breakdown with sub-tasks
- `SESSION_NOTES.md` — Session-by-session history (most recent first)
- `docs/PRODUCT_PRINCIPLES.md` — UX philosophy, onboarding consistency rules
- `docs/FEATURE_AI_PLAN_GENERATION.md` — AI plan gen spec
