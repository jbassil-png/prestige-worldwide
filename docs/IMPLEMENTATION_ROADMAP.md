# Implementation Roadmap

**Status:** Active
**Last Updated:** 2026-03-22

---

## Overview

This roadmap tracks what has been built, what's in progress, and what comes next. For the full UX philosophy driving decisions, see `docs/PRODUCT_PRINCIPLES.md`.

---

## ✅ Phase 1 — Foundation (Complete)

### Task 1: Fix Bug — News API Empty Array ✅
Fixed news API returning empty array when Alpha Vantage key not set. Stub fallback added.

### Task 2: Account Management & Detail Views ✅
Full account CRUD. Plaid integration (sandbox). Manual account entry. Account detail pages.
Spec: `docs/FEATURE_ACCOUNT_MANAGEMENT.md`

---

## ✅ Phase 2 — Core Product (Complete)

### Task 3: Goals, Check-ins & Progressive Onboarding ✅
- Retirement year (not age) across onboarding + settings
- Default retirement goal card in onboarding
- Skip path ("I just want to track my accounts")
- On-track status with 7% CAGR projection
- Unallocated bucket concept
- Check-in schedule (twice yearly default, configurable)
- Consistent post-onboarding settings UX

### Task 3.5: Onboarding Construction ✅
- Preview page (`/onboarding/preview`) — column view, all steps, mock US+CA data, no API calls
- Theme design: Swiss Alps Retreat ❄️ / Gaudy Miami 🌴 / Clooney's Positano 🇮🇹
- Theme token system — CSS custom properties in `globals.css`; `data-theme` on `<html>`
- `StepStyle` component — three visual preview cards
- 4-step horizontal scroll wizard — one step per viewport, 0.45s cubic-bezier transition
- Theme persisted to `user_preferences` + `sessionStorage.pw_theme`

### Task 4: AI Plan Generation ✅
- OpenRouter integration via `/api/plan` — JSON mode, model via `OPENROUTER_PLAN_MODEL` env var
- Two-layer: code calculates metrics (net worth, CAGR, on-track), AI generates narrative + recommendations
- `buildStubPlan()` fallback when API key not set or call fails
- Privacy: no account names sent to AI, only types + balances

### Task 5: Re-entry Flows & Unified Settings ✅
- `initialValues` props on all four step components
- `/setup` deleted; replaced by unified `/settings` page
- Dashboard entry point: one "Settings" link

### Task 7: Portfolio-Aware News Feed ✅
- Alpha Vantage integration — fetches news for user's country pair
- 30-minute server-side cache
- Fallback to demo news when key not set
Spec: `docs/FEATURE_PORTFOLIO_NEWS.md`

### Task 8: Visual Theming ✅
- 3 themes with CSS custom properties + font loading via `next/font/google`
- Applied via `data-theme` on `<html>`; persisted to `user_preferences` table
- Theme selector in onboarding (step 3) and settings

### Task 12: Dashboard UX Pass ✅
- Control bar (country pair, plan date, currency toggle, refresh, Settings link)
- Portfolio news promoted above plan
- Plan header personalised to user's country pair
- Projection chart (Recharts area chart)
- Allocation charts (geo breakdown + account type — CSS bars)

### Task 14: Unified Settings Page ✅
- Single non-linear page; 5 independently-saveable sections
- Countries, Accounts, Goals, Style, Check-ins
- Manual account entry always available; Plaid gated by `is_paid`
- `/setup` deleted; dashboard reduced to one "Settings" link

### Task 15: Freemium Model ✅
- `is_paid boolean DEFAULT false` on `user_profiles`
- `stripe_customer_id text` on `user_profiles` (partial unique index)
- `POST /api/stripe/checkout` — creates Checkout session, re-uses Stripe customer
- `POST /api/stripe/webhook` — uses service-role client; handles 4 subscription events; flips `is_paid`
- Settings upgrade button wired to checkout; `?upgraded=true` success banner on return
- All Stripe code stubs gracefully when keys not set

### Task 17: Plan History UI ✅
- `/plan/history` — server component fetches last 10 rows from `plan_history` table
- `PlanHistoryClient` — accordion card list; date, country pair, trigger badge, 4 metrics
- Expandable: full summary, account balance snapshot, colour-coded recommendations
- Empty state + dashboard link

### Task 18: Sign-up Redirect UX ✅
- `redirecting` state shows spinner + "Account created! Taking you to setup…"
- 1s delay then `router.push("/onboarding")`

### Task 19: Auth Cleanup ✅
- Removed `signInWithPassword` fallback from sign-up (email confirmation is disabled; direct session always returned)
- Created `lib/supabase/admin.ts` — service-role client for trusted server contexts
- Stripe webhook now uses `createAdminClient()` — fixes silent RLS failure on `is_paid` updates
- Fixed `20260321_add_goals_and_checkins.sql` — wrapped `ALTER COLUMN` statements in idempotent DO blocks

### Task 20: Onboarding Reorder ✅
- New sequence: **Goals (req) → Assets (req) → Style (opt) → Connect (opt, paid)**
- Matches `/onboarding/preview` sequence exactly
- Loading state moved from inline button → full-screen overlay with spinner
- `StepCountries` gained `onBack?` prop
- Button labels updated to reflect new step order

---

## 🔜 Phase 3 — Launch Prep (In Progress)

### Task 16: Stripe Account Setup 🔜 OWNER ACTION
Steps documented in `CLAUDE.md` → "Current Task". Requires:
1. Stripe account + product + price
2. Vercel env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
3. Also set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (needed for webhook RLS bypass)
4. Register webhook endpoint in Stripe dashboard
5. Run `supabase/migrations/20260322b_add_stripe_customer_id.sql`

### Task 21: Plaid Gating in Connect Step 📋
Currently the Connect step shows both Plaid and manual tabs for all users. Free users should see an upgrade prompt on the Plaid tab (same pattern as the Settings accounts section). Manual entry remains available.

**Sub-tasks:**
- [ ] Check `is_paid` in StepConnect (fetch from `/api/profile` or pass as prop from wizard)
- [ ] Show upgrade CTA on Plaid tab for free users; keep manual tab accessible
- [ ] Wire "Upgrade" to Stripe checkout flow

**Open question:** Should this gate be in the onboarding wizard (Option A), or should onboarding remain frictionless and gating happen post-onboarding (Option B)? Documented in `SESSION_NOTES.md`.

### Task 26: Free vs Paid Onboarding Map 📋 DECISION PENDING
Define and document the exact user experience for free vs paid onboarding paths. Currently the code gates Plaid in Connect step, but the full UX flow hasn't been formally mapped.

**Sub-tasks:**
- [ ] Define what "free onboarding" looks like end-to-end (entry → step sequence → dashboard)
- [ ] Define what "paid onboarding" adds or changes
- [ ] Decide whether Connect step is skippable for free users or shows an upgrade prompt
- [ ] Document in this roadmap once decided
- [ ] Test both paths manually before launch

**Dependency:** Resolves the Option A/B/C question for Task 21.

### Task 27: Synthetic Test Data for Free + Paid Flows 📋
Enable rapid testing of both onboarding paths without manual data entry each time.

**Current state:** `/dev/reset` (at `ALLOW_DEV_RESET=true`) clears all user data and redirects to `/onboarding`. This covers the reset part. What's missing is a fixed set of test accounts that can be quickly loaded.

**Sub-tasks:**
- [ ] Define canonical free-user test scenario (e.g. 2 manual accounts, no Plaid, US+CA)
- [ ] Define canonical paid-user test scenario (e.g. Plaid sandbox accounts, US+CA)
- [ ] Decide on seeding format: seed button in `/dev/reset`, fixture file, or Supabase seed script
- [ ] Implement chosen format
- [ ] Document in `IMPLEMENTATION_ROADMAP.md#dev-utilities`

---

## 📋 Phase 4 — Post-Launch (User Testing Driven)

### Task 22: Geographic AI Advisors
Country-specific advisor personas (e.g. Gordon for Canada, Brad for US). Specialised chat agents reading from the same plan. Depends on theming being complete (it is).

**Sub-tasks:**
- [ ] Design advisor persona schema (country, name, expertise, personality, visual)
- [ ] Per-country system prompts
- [ ] Advisor detection logic (which advisors are relevant to user's countries)
- [ ] Advisor selector UI
- [ ] Theme-aware visual identity per advisor

### Task 23: Goal-Account Linking
Let users assign accounts to goals so the unallocated bucket is accurate.

**Sub-tasks:**
- [ ] Decide placement: during onboarding (inline after Goals step), post-onboarding nudge, or settings-only
- [ ] Goal card UI with "Add accounts" action
- [ ] Multi-select from connected accounts
- [ ] Update `user_goals.linked_account_ids`
- [ ] Recalculate unallocated: net worth minus linked account balances

**Open question:** Whether to surface goal-account linking during onboarding is deferred until Task 26 (Free vs Paid Onboarding Map) is decided. Documented in `SESSION_NOTES.md`.

### Task 24: Scheduled Check-in Email Delivery
**Sub-tasks:**
- [ ] Vercel cron job (daily) querying `user_checkin_schedule` for due users
- [ ] Resend email: portfolio snapshot + dashboard link
- [ ] Update `last_checkin_at` / `next_checkin_at` after send

### Task 25: Testing Infrastructure
- [ ] Install and configure Vitest
- [ ] Unit tests: `calculateMetrics()`, on-track logic, CAGR projections
- [ ] Integration tests: `/api/plan` (AI path + stub fallback), `/api/stripe/webhook`
- [ ] Add test scripts to `package.json`

---

## 📋 Phase 5 — Polish Backlog

See `docs/POLISH_BACKLOG.md` for details. Intentionally deferred until post-launch user data.

- Full-screen loading reveal (themed 3-beat animation on plan gen)
- PDF export for plans
- Plan comparison tool
- What-if analysis
- Transaction history (Plaid Transactions API)
- Dark mode variants
- WCAG AA accessibility audit
- Drop legacy `current_age`/`retirement_age` columns from DB schema
- Centralise `Plan`/`Metrics` types into `types/plan.ts`
- Retirement target amount editable post-onboarding (currently year-only in settings)

---

## Database Schema (Current)

| Table | Purpose |
|-------|---------|
| `user_plans` | Plan JSON + meta; one row per generation |
| `user_preferences` | Theme selection per user |
| `user_profiles` | residence/retirement countries, retirement year, `is_paid`, `stripe_customer_id` |
| `user_accounts` | Manual + Plaid-synced accounts |
| `user_goals` | Discrete financial goals with linked account IDs |
| `user_checkin_schedule` | Check-in frequency + next/last timestamps |
| `user_holdings` | Portfolio holdings for news personalisation |
| `user_portfolio_news` | Cached portfolio news (30-min TTL) |
| `plaid_items` | Encrypted Plaid access tokens |

**Pending migration (owner action):** `20260322b_add_stripe_customer_id.sql`

---

## Supabase Client Pattern

| Client | File | When to use |
|--------|------|-------------|
| Browser client | `lib/supabase/client.ts` | Client components, browser-side API calls |
| SSR client | `lib/supabase/server.ts` | Server components, user-facing API routes |
| Admin client | `lib/supabase/admin.ts` | Webhooks, cron jobs — bypasses RLS, uses service role key |

---

## Dev Utilities

**Relaunching onboarding during development:**
Navigate to `/dev/reset` — wipes all user data for the current account and shows a "Start onboarding →" button.
Requires `ALLOW_DEV_RESET=true` env var. Works in any environment when explicitly enabled.
Tables cleared: `user_plans`, `user_accounts`, `user_profiles`, `user_preferences`, `user_holdings`, `user_balance_history`, `user_portfolio_news`, `plaid_items`, `user_checkin_schedule`, `plan_history`.
Not linked from the app UI — navigate directly. API route: `POST /api/dev/reset`.

**Testing the Stripe webhook locally:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Related Documents

- [Product Principles](./PRODUCT_PRINCIPLES.md)
- [Polish Backlog](./POLISH_BACKLOG.md)
- [Session Notes](../SESSION_NOTES.md)
- [Feature: Account Management](./FEATURE_ACCOUNT_MANAGEMENT.md)
- [Feature: Portfolio News](./FEATURE_PORTFOLIO_NEWS.md)
- [Feature: AI Plan Generation](./FEATURE_AI_PLAN_GENERATION.md)
