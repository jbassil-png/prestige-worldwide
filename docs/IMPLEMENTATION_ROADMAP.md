# Implementation Roadmap

**Status:** Active
**Last Updated:** 2026-03-25 (presentation polished, landing page refreshed, dashboard identity added)

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
- New sequence: **Goals (req) → Assets (req) → Style (opt) → Connect (opt, paid)** *(subsequently refactored in Task 28 to Goals → Assets → Connect → Personalise)*
- Loading state moved from inline button → full-screen overlay with spinner
- `StepCountries` gained `onBack?` prop
- Button labels updated to reflect new step order

---

## 🔜 Phase 3 — Launch Prep (In Progress)

### Task 29: Class Presentation ✅
Standalone HTML deck (`public/presentation/index.html`). 10-slide VC-pitch format. Keyboard-navigable (arrow keys + click). Slide 10 restructured as 3 sequential numbered steps: (1) reset via `/dev/reset`, (2) free account login, (3) paid account login. `ALLOW_DEV_RESET=true` confirmed in Vercel production.
Live at: https://prestige-worldwide-kappa.vercel.app/presentation/index.html

### Dashboard User Identity ✅
Dashboard header now shows the logged-in email address (hidden on mobile) and a contextual tier badge next to Sign Out: "Free demo" (gray) for `demo@prestigeworldwide.com`, "Paid demo" (brand) for `paid@prestigeworldwide.com`, "Pro" (brand) for real paid subscribers. Implemented by passing `userEmail` + `isPaid` as props from the server page.

### Landing Page Refresh ✅
- `Features` component: updated from aspirational to accurate — AI plan generation, unified accounts, plan history + check-ins
- `HowItWorks` component: step 1 → "Tell us your situation" (accurate for free/manual flow); step 3 → mentions chat + scheduled check-ins
- `CTASection` component: single CTA button replaced with Free vs Pro two-column pricing table listing actual per-tier features

### Auth-Aware Navbar ✅
New `NavbarAuthButtons` client component checks Supabase session state. Logged-out users see "Sign in" + "Sign up". Logged-in users see "Dashboard →". Landing page is now safely viewable in any tab regardless of auth state — no bounce to `/dashboard`.

---

### Task 16: Stripe Account Setup 🔜 OWNER ACTION
Steps documented in `CLAUDE.md` → "Current Task". Requires:
1. Stripe account + product + price
2. Vercel env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
3. Also set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (needed for webhook RLS bypass)
4. Register webhook endpoint in Stripe dashboard
5. Run `supabase/migrations/20260322b_add_stripe_customer_id.sql`

### NEXT_PUBLIC_APP_URL in Vercel 🔜 OWNER ACTION
Required for server-side plan regeneration in production. Without it, `PUT /api/profile` falls back to `localhost:3000` and plan re-gen silently fails when a user updates their countries. Set to `https://prestige-worldwide-kappa.vercel.app` (or custom domain). ~2 minutes.

### Missing `user_plans` Migration 📋
The app writes plans to `user_plans` but there is no migration file for this table in `supabase/migrations/`. Fresh database installs will fail silently. Write a migration that matches the table structure the app already uses.
**Effort:** ~30 min. **Depends on:** Nothing — can be done any time.

### Manual Accounts Not Persisted from Onboarding 📋
Accounts entered manually in the Connect step (Step 4) are passed directly to `handleFinish()` for plan generation but are never written to `user_accounts`. After onboarding, the accounts panel in Settings shows empty. Fix: save accounts to `user_accounts` at the end of the wizard before generating the plan.
**Effort:** ~1h. **Depends on:** Nothing — can be done any time.

### Magic Link Sign-up Analytics 📋
When a user signs up via magic link, the `user_signed_up` PostHog event is never fired (it's only captured in the email/password sign-up path). Fix: fire the event in the auth callback handler.
**Effort:** ~20 min. **Depends on:** Nothing — can be done any time.

### Task 21: Plaid Gating + Free-Tier Messaging in Connect Step ✅
Free users no longer see a tab switcher. An amber banner at the top of the Connect step clearly states "You're on the free plan — manual entry only" with an inline "Upgrade →" link wired to Stripe checkout. Free users land directly in the manual balance form. Paid users keep the Plaid/manual tab switcher, now without the dead "paid feature" panel.

### Task 26: Free vs Paid Onboarding Map ✅ RESOLVED
Decided in session Mar 23, 2026. See session notes above for full decision record.

**Free (3 steps):** Goals → Assets + Goal Linking → Connect (manual-only, explicit gate, skippable)
**Paid (4 steps):** Goals → Assets + Goal Linking → Connect (Plaid+manual, skippable) → Personalise (opt)

**Remaining:** Test both paths manually before launch (covered by Task 27 demo accounts).

---

**Session notes (2026-03-23, decision session):**

Full onboarding restructure decided. All open questions from previous session now resolved.

**Final feature-tier mapping:**

| Feature | Free | Paid |
|---------|------|------|
| Plan generation (AI) | ✅ | ✅ |
| Dashboard, chat, news | ✅ | ✅ |
| Manual account entry | ✅ | ✅ |
| Goal-account linking (Assets step) | ✅ | ✅ |
| Connect step — manual only | ✅ | ✅ |
| Plaid bank connection | ❌ | ✅ |
| Theme selection (non-default) | ❌ | ✅ |
| Geographic AI advisors (country-specific) | ❌ (generalist) | ✅ |
| Portfolio audit scheduling (onboarding) | ❌ | ✅ |

**Final onboarding flows:**

Free (3 steps):
```
Goals (req) → Assets + Goal Linking (req) → Connect (manual-only, explicit gating, skippable)
```

Paid (4 steps):
```
Goals (req) → Assets + Goal Linking (req) → Connect (Plaid+manual, skippable) → Personalise (opt)
```

The Personalise step (paid step 4) bundles:
1. Theme selection — alternate to Swiss Alps default
2. Geographic advisor selection — paid users get auto-assigned advisors for each selected country
3. Portfolio audit frequency — expanded check-in scheduling (thorough AI-generated report, not just snapshot email)

**Key decisions settled:**
- Goal-account linking is for ALL users, in the Assets step inline. Not deferred, not settings-only.
- Free users see an explicit explanation in the Connect step ("you're on the free plan — manual entry only"), not a silently-disabled tab.
- Swiss Alps is the locked default for free users. No theme step in free onboarding.
- Free users get the current single generalist chat advisor. Paid users get country-specific advisors auto-assigned from their selected countries.
- Portfolio audit is an expansion of the check-in concept (Task 24) — more thorough AI-generated report, surfaced during paid onboarding in the Personalise step.
- StepStyle is removed from the free onboarding flow entirely and folded into the paid Personalise step.
- **Plan generation deferred to end of full wizard.** Free: generates after step 3 (Connect). Paid: generates after step 4 (Personalise). Ensures plan has complete context before first generation.

**Demo accounts decision:**
- Two dedicated test accounts: one configured as free tier, one as paid tier.
- Each independently resettable via `/dev/reset` (visit with the relevant account session active).
- Avoids manual data entry on every test run. Enables side-by-side flow comparison.

### Task 27: Demo Accounts for Free + Paid Flow Testing 📋
Two dedicated test accounts — one free, one paid — each independently resettable. Enables side-by-side flow comparison without manual data entry.

**Approach:** Two real Supabase accounts (separate email addresses). `is_paid` set manually or via Stripe test mode on the paid account. Each can be reset independently by visiting `/dev/reset` while logged in as that account.

**Sub-tasks:**
- [ ] Create two accounts: `demo-free@prestige-worldwide.dev` and `demo-paid@prestige-worldwide.dev` (or similar)
- [ ] Flip `is_paid = true` on the paid demo account (direct Supabase update or Stripe test webhook)
- [ ] Define canonical free scenario: 2 manual accounts, US+CA, no Plaid, no goals linked
- [ ] Define canonical paid scenario: Plaid sandbox accounts, US+CA, goals linked, theme + advisors selected
- [ ] Seed both accounts with their canonical data (seed button in `/dev/reset` or Supabase seed script)
- [ ] Document account credentials in `.env.local` (never commit) or a local secure note
- [ ] Verify `/dev/reset` fully clears + resets each account independently

### Task 28: Paid "Personalise" Step (Onboarding Step 4) ✅
New final step in paid onboarding. Bundles three customisation capabilities into a single optional step. Only shown to paid users; free users end at Connect (step 3).

**Implementation:**
- `StepPersonalise.tsx` — single scrollable step with three clearly labelled sections
- Panel 1: Theme picker — reuses exported `THEMES` from `StepStyle.tsx`; swiss-alps pre-selected
- Panel 2: Advisor cards — auto-assigned from user's country selections via `ADVISORS_BY_CODE` map (US/CA/GB/SG/AU/DE/FR); "Coming soon" overlays until Task 22 ships
- Panel 3: Audit frequency — 2×2 grid (Monthly / Quarterly / Twice yearly ✓ / Annually); defaults to 182 days
- Skip button — "I'll set this up later in Settings" — generates plan with swiss-alps + 182-day defaults
- `handleFinish(accounts, personalise?)` receives `PersonaliseData { theme, auditFrequency }` — saves theme to `user_preferences` and frequency to `user_checkin_schedule` in same `Promise.all` batch
- Wizard refactored from 5-step to 4-step paid flow; `THEMES` exported from `StepStyle`; `StepAdvisors` removed from wizard import

---

## 📋 Phase 4 — Post-Launch (User Testing Driven)

### Task 22: Geographic AI Advisors 📋
Country-specific advisor personas for paid users. Free users get a single generalist advisor (the current chat assistant, repurposed). Paid users get advisors auto-assigned based on their selected countries — one per country.

**Free tier:** Single generalist chat persona. No country specialisation. Current `/api/chat` behaviour unchanged.

**Paid tier:** Country-specific advisor personas (e.g. Gordon for Canada, Brad for US). Auto-assigned from user's `user_profiles.countries`. User can view/select active advisor in the Personalise step and in Settings.

**Sub-tasks:**
- [ ] Design advisor persona schema: country code, name, expertise focus, personality description, visual avatar
- [ ] Per-country system prompts — localised financial/tax context injected into chat
- [ ] Auto-assignment logic: derive active advisors from user's selected countries at session load
- [ ] Advisor selector UI in Personalise step (paid onboarding step 4) and Settings
- [ ] Extend `/api/chat` to accept an `advisorId` param and switch system prompt accordingly
- [ ] Theme-aware visual identity per advisor (optional polish)

### Task 23: Goal-Account Linking in Assets Step ✅
Inline in `StepCountries`. After specifying country/account types, users see a per-account goal dropdown before proceeding. Anything unlinked lands in an explicit "Unallocated" bucket. `GoalLink[]` is captured in `WizardData` and passed through `handleFinish()`. Available for all users (free and paid).

### Task 24: Portfolio Audit + Check-in Email Delivery 📋
Expansion of the original check-in concept. Two tiers of scheduled outreach:

**Free:** Basic check-in email — portfolio snapshot + dashboard link (original plan).

**Paid:** Thorough portfolio audit — a deeper AI-generated report covering performance vs. goals, allocation drift, tax considerations by country, and recommended next actions. Richer than a plan refresh; more like an advisor summary letter. Frequency set during onboarding (Personalise step, step 4) or in Settings.

**Sub-tasks:**
- [ ] Vercel cron job (daily) querying `user_checkin_schedule` for due users
- [ ] Free path: Resend email with portfolio snapshot + dashboard link
- [ ] Paid path: trigger a deeper AI analysis pass (separate prompt/model call), format as structured report, deliver via Resend
- [ ] Design audit report prompt — include goals progress, allocation vs. targets, per-country notes, recommended actions
- [ ] Frequency picker surfaced in paid Personalise step (step 4) and in Settings → Check-ins for all users
- [ ] Update `last_checkin_at` / `next_checkin_at` after send

### Task 25: Testing Infrastructure
- [ ] Install and configure Vitest
- [ ] Unit tests: `calculateMetrics()`, on-track logic, CAGR projections
- [ ] Integration tests: `/api/plan` (AI path + stub fallback), `/api/stripe/webhook`
- [ ] Add test scripts to `package.json`

---

## 📋 Phase 5 — Polish Backlog

### Paid User Badge
Show a visual indicator (badge, tag, or icon) somewhere in the UI when a paid user is logged in — confirming their subscription is active and differentiating their experience. Exact placement TBD (dashboard header, settings page, or both).



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
