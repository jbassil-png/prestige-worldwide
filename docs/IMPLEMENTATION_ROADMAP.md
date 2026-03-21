# Implementation Roadmap

**Status:** Active
**Last Updated:** 2026-03-21
**Current Phase:** Phase 2 - Differentiation & Quality

---

## Overview

This roadmap outlines the prioritized implementation order for Prestige Worldwide features, balancing user impact, technical dependencies, and learning objectives.

**Guiding Principles:**
- ✅ Quick wins first (build momentum)
- ✅ Foundation before advanced features
- ✅ Learning opportunities balanced with user value
- ✅ Test as we grow
- ✅ Progressive disclosure — surface power features without burdening simple users

See `docs/PRODUCT_PRINCIPLES.md` for the full product philosophy guiding UX decisions.

---

## Phase 1: Foundation & Quick Wins
**Timeline:** Week 1
**Goal:** Fix critical bugs and enable core user control

### ✅ Task 1: Fix Bug #2 - News API Empty Array
**Status:** ✅ COMPLETE

### ✅ Task 2: Account Management & Detail Views
**Status:** ✅ COMPLETE (2026-03-20)

Full spec: `docs/FEATURE_ACCOUNT_MANAGEMENT.md`

---

## Phase 2: Differentiation & Quality
**Timeline:** Week 2-3
**Goal:** Make product stand out and ensure code quality

### ✅ Task 3: Goals, Check-ins & Progressive Onboarding
**Status:** ✅ COMPLETE (2026-03-21)
**Priority:** High (core product UX)

**Overview:**
Redesign the goals layer so the tool works for both simple account-trackers and goal-oriented planners, without making either feel like a second-class experience.

**Changes delivered:**
- **Retirement year (not age):** Onboarding and settings now ask for a target retirement year (e.g. 2055) instead of current age + retirement age. Simpler, more intuitive, forward-looking.
- **Default retirement goal card:** Step 3 of onboarding shows a pre-populated retirement goal ($2M / target year) that users can edit inline. Removes blank-slate anxiety. Users who don't want it can remove it or skip entirely.
- **Skip path:** "Skip for now — I just want to track my accounts" option in Step 3. No guilt messaging. Users land on a fully functional dashboard with an "Unlock more" nudge.
- **On-track status:** Dashboard shows a retirement goal progress bar with on-track badge (On track / Review needed / Off track) based on 7% CAGR projection vs. goal target.
- **Unallocated bucket:** Funds not tied to any goal are shown in a distinct "Unallocated" bucket — a first-class concept, not a gap to fill.
- **Check-in schedule:** Twice-per-year default, configurable in Settings (Monthly / Quarterly / Twice a year / Annually). Not part of onboarding.
- **"Unlock more" nudge:** Shown on dashboard for users without a retirement goal — warm, non-judgmental CTA to add one.
- **Consistent post-onboarding UI:** Settings page uses the same country selectors, retirement year field, and check-in controls that mirror the onboarding experience. See `docs/PRODUCT_PRINCIPLES.md#onboarding-consistency`.

**Files changed:**
- `app/onboarding/steps/StepGoals.tsx` — redesigned
- `app/onboarding/page.tsx` — updated payload
- `app/api/plan/route.ts` — retirementYear, on-track calc, optional goals
- `app/api/profile/route.ts` — retirement_year support
- `app/api/checkin-schedule/route.ts` — new endpoint
- `app/settings/page.tsx` — retirement year + check-in frequency
- `components/PlanView.tsx` — goal progress, unallocated bucket, nudge
- `app/plan/PlanDetailClient.tsx` — null-safe metrics
- `supabase/migrations/20260321_add_goals_and_checkins.sql` — new tables

---

### Task 4: AI Plan Generation
**Status:** 📐 Spec complete — ready to implement
**Priority:** High — biggest functional gap, unblocks chat agent and advisors
**Effort:** ~4-6 hours

**Overview:**
Replace the hardcoded stub recommendations in `/api/plan` with a real AI call. The deterministic math layer (net worth, projections, on-track) stays as code. The AI generates the narrative summary and structured recommendations, with full awareness of the user's specific country combination, account types, and cross-border situation.

Full spec: `docs/FEATURE_AI_PLAN_GENERATION.md`

**Key design decisions (agreed):**
- Two-layer architecture: code calculates metrics, AI generates narrative + recommendations
- OpenRouter with JSON mode for structured output; stub fallback on failure
- Model: `OPENROUTER_PLAN_MODEL` env var, defaults to Haiku; upgrade to Sonnet if quality is thin
- No account names or institution names sent to AI (privacy)
- Plan regenerates on: onboarding, user request, profile change, >10% balance change, scheduled check-in

**Open questions before implementation:**
- Haiku vs. Sonnet — evaluate with a test US+CA prompt
- JSON mode vs. prompt-only + validation/retry
- Whether to inject market_data (treasury yields, equity returns) for more timely recs
- Minimum recommendations per category

**Sub-tasks:**
- [ ] Resolve open questions above
- [ ] Add `generateAIPlan()` to `/api/plan/route.ts`
- [ ] Add Zod validation of AI response schema
- [ ] Preserve `buildStubPlan()` as fallback
- [ ] Add `OPENROUTER_PLAN_MODEL` to `.env.example`
- [ ] Unit tests for `calculateMetrics()`
- [ ] Integration test for AI path + stub fallback path

---

### Task 5: Re-entry Flows & Unified Account/Goal Editing
**Status:** 📋 Planned
**Priority:** High — needed before real users; also required for dev iteration
**Effort:** ~4-6 hours

**Overview:**
When returning users want to add accounts, add countries, or edit goals, the experience should feel like a natural continuation of onboarding — not a separate admin panel. Critically, adding accounts and editing goals are part of the **same flow**, not separate pages.

The unified "edit my setup" flow:
1. Which countries do you have assets in? (reuses `StepCountries`)
2. Connect or update accounts (reuses `StepConnect`)
3. Update goals and retirement year (reuses `StepGoals`)

This mirrors onboarding exactly. It can be triggered from the dashboard ("Update my setup") and from Settings.

Also includes the dev utility: a "Reset onboarding" button in Settings (`NODE_ENV === 'development'` only) so we can iterate on the onboarding flow without touching Supabase.

See: `docs/PRODUCT_PRINCIPLES.md#onboarding-consistency`

**Sub-tasks:**
- [ ] Make `StepCountries`, `StepConnect`, `StepGoals` accept an `initialValues` prop (pre-populate from existing data)
- [ ] Create `/setup` route that runs the 3-step wizard in edit mode
- [ ] Add "Update my setup" entry point on the dashboard
- [ ] Add dev-only "Reset onboarding" button in `/settings`
- [ ] Plan auto-regenerates on save (same as profile update today)

---

### Task 6: Testing Infrastructure
**Status:** 📋 Planned
**Priority:** Medium
**Effort:** ~6-8 hours

**Sub-tasks:**
- [ ] Install and configure Vitest
- [ ] Unit tests: `calculateMetrics()`, on-track logic, CAGR projections
- [ ] Integration tests: `/api/plan` (AI path + stub fallback), `/api/checkin-schedule`, `/api/profile`
- [ ] Add test scripts to `package.json`
- [ ] Document testing setup in README

---

## Phase 3: Product Depth
**Timeline:** Week 4+

### ✅ Task 7: Portfolio-Aware News Feed
**Status:** ✅ COMPLETE (2026-03-20)

Full spec: `docs/FEATURE_PORTFOLIO_NEWS.md`

---

### Task 8: Visual Theming
**Status:** 📐 Design in progress — integrate into onboarding
**Priority:** High (differentiating surface feature; blocks advisor personas)
**Effort:** ~8-12 hours

**Overview:**
Three aspirational lifestyle themes transform the app's entire visual presentation. Theme selection happens during onboarding (new Step 4, after goals) so the experience is personalised from first use. The chosen theme persists and can be changed in settings.

**Themes:**
1. **Swiss Alps Retreat** ❄️ — Minimalist luxury, serene, clean
2. **Gaudy Miami** 🌴 — Bold, energetic, Art Deco glamour
3. **Clooney's Positano** 🇮🇹 — Effortless elegance, Mediterranean warmth

**Onboarding integration:**
- New Step 4 in the onboarding wizard: "Choose your style"
- Visual cards showing a preview of each theme
- Selection is optional (defaults to Swiss Alps or a neutral default)
- This step should feel like a personalisation moment, not a configuration screen

**Sub-tasks:**
- [ ] Design theme colour palettes and typography specs
- [ ] Create Tailwind theme extension / CSS variable approach
- [ ] Build theme selector component (for onboarding Step 4 and Settings)
- [ ] Implement React Context for theme state
- [ ] Add `user_preferences` table to Supabase
- [ ] Apply theme to all components
- [ ] Add theme selector to Settings
- [ ] Test theme switching across all pages

**Note:** Theme personas feed into Geographic AI Advisors — advisors adapt their visual identity to the chosen theme. That's why theming comes before advisors.

---

### Task 9: Goal-Account Linking
**Status:** 📋 Planned
**Priority:** Medium
**Effort:** ~3-4 hours

**Overview:**
Let users assign accounts to goals so the unallocated bucket reflects real allocation, not an approximation.

**Sub-tasks:**
- [ ] Goal card UI with "Add accounts" action
- [ ] Multi-select from connected accounts
- [ ] Update `user_goals.linked_account_ids`
- [ ] Recalculate unallocated: net worth minus sum of linked account balances

---

### Task 10: Scheduled Check-in Email Delivery
**Status:** 📋 Planned
**Priority:** Medium
**Effort:** ~3-4 hours

**Sub-tasks:**
- [ ] Vercel cron job (daily) querying `user_checkin_schedule` for due users
- [ ] Resend email: portfolio snapshot + link to dashboard
- [ ] Update `last_checkin_at` / `next_checkin_at` after send

---

## Phase 4: Advanced AI
**Timeline:** After theming is complete

### Task 11: Geographic AI Advisors
**Status:** 📋 Planned — depends on AI plan generation (Task 4) and theming (Task 8)
**Priority:** High (most differentiating feature)
**Effort:** ~24-32 hours

**Overview:**
Country-specific AI advisor personas (e.g. Gordon for Canada, Brad for US) with localised financial expertise, their own chat interfaces, and visual identities that adapt to the user's chosen theme.

Advisors are specialised **chat agents**, not separate plan generators. They read from the same plan document that the main chat agent reads, with country-specific system prompts and personas layered on top.

**Dependencies:**
- Task 4 (AI plan gen) — advisors need a real plan to reference
- Task 8 (theming) — advisor visual identity adapts to theme

**Sub-tasks:**
- [ ] Design advisor persona schema (country, name, expertise, personality, visual)
- [ ] Create per-country system prompts
- [ ] Build advisor detection logic (which advisors are relevant to user's countries)
- [ ] Advisor selector UI
- [ ] Multi-advisor group chat (N8N multi-agent workflow)
- [ ] Theme-aware visual identity per advisor

---

## Phase 5: Polish
**Timeline:** Ongoing

### Task 12: Minor fixes and enhancements
- Sign-up redirect UX (silent redirect with no feedback)
- Transaction history (Plaid Transactions API)
- PDF export for plans
- Plan comparison tool
- What-if analysis
- Drop legacy `current_age`/`retirement_age` columns from DB
- Centralise `Plan`/`Metrics` types into `types/plan.ts`

---

## Current Status Summary

| Phase | Status | Tasks |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | Tasks 1-2 done |
| **Phase 2** | 🎯 Active | Task 3 ✅; Tasks 4-6 next |
| Phase 3 | 📋 Planned | Task 7 ✅ (news); Tasks 8-10 pending |
| Phase 4 | 📋 Planned | Task 11 (advisors) — after theming |
| Phase 5 | 📋 Planned | Polish |

**Agreed sequence:**
1. **Task 4** — AI Plan Generation (spec agreed, implement next)
2. **Task 5** — Re-entry Flows & Unified Goal/Account Editing
3. **Task 6** — Testing Infrastructure
4. **Task 8** — Visual Theming *(start designing now as part of onboarding planning; build here)*
5. **Task 9/10** — Goal-Account Linking + Check-in Emails
6. **Task 11** — Geographic AI Advisors (last)

---

## Dev Utilities

### Relaunching the Onboarding Flow

During development, you may need to re-run onboarding to test changes:

**Option A — Reset via Supabase:**
Delete the user's row from `user_plans` in the Supabase dashboard, then navigate to `/onboarding`.

**Option B — URL shortcut (dev only):**
Navigate directly to `/onboarding`. Middleware only redirects to `/onboarding` when there is no plan; if you manually visit it, it will load.

**Option C — Add a reset button (recommended for active iteration):**
In `app/settings/page.tsx`, add a dev-mode "Reset onboarding" button that clears `user_plans` and redirects to `/onboarding`. This is tracked as Task 9.

---

## Session Workflow

**At the start of each session:**
1. Read this roadmap to understand current task
2. Review relevant feature spec (linked in task description)
3. Read `SESSION_NOTES.md` for recent context
4. Begin implementation

**At the end of each session:**
1. Update task status in this roadmap (checkboxes)
2. Document progress in `SESSION_NOTES.md`
3. Commit and push changes
4. Update "Last Updated" date at top of this file

---

## Related Documents

- [Product Principles](./PRODUCT_PRINCIPLES.md) - UX philosophy and design decisions
- [Backlog](./BACKLOG.md) - All feature requests and bugs
- [Session Notes](../SESSION_NOTES.md) - Development history
- [Feature: Account Management](./FEATURE_ACCOUNT_MANAGEMENT.md)
- [Feature: Portfolio News](./FEATURE_PORTFOLIO_NEWS.md)
- [Manual Test Checklist](./MANUAL_TEST_CHECKLIST.md)
