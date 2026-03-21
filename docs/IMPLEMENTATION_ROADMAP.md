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

### Task 4: Visual Theming System
**Status:** 📋 Planned
**Priority:** High (differentiating feature)
**Effort:** ~8-12 hours

**Overview:**
Three aspirational lifestyle themes that transform the entire app's visual presentation.

**Themes:**
1. **Swiss Alps Retreat** ❄️ - Minimalist luxury, serene, clean
2. **Gaudy Miami** 🌴 - Bold, energetic, Art Deco glamour
3. **Clooney's Positano** 🇮🇹 - Effortless elegance, Mediterranean warmth

**Sub-tasks:**
- [ ] Design theme configurations (color palettes, typography)
- [ ] Create Tailwind theme extension
- [ ] Build theme selector UI component
- [ ] Implement React Context for theme state
- [ ] Add `user_preferences` table to Supabase
- [ ] Apply theme to all components
- [ ] Test theme switching across all pages

---

### Task 5: Testing Infrastructure
**Status:** 📋 Planned
**Priority:** Medium (technical foundation)
**Effort:** ~6-8 hours

**Sub-tasks:**
- [ ] Install and configure Vitest
- [ ] Write unit tests for plan calculations (on-track logic, CAGR projections)
- [ ] Write integration tests for API routes
  - `/api/plan` (with and without retirement goal)
  - `/api/checkin-schedule`
  - `/api/profile`
  - `/api/accounts/[id]`
- [ ] Add test scripts to `package.json`
- [ ] Document testing setup in README

---

## Phase 3: Advanced Features
**Timeline:** Week 4+
**Goal:** Build differentiating AI-powered features

### ✅ Task 6: Portfolio-Aware News Feed
**Status:** ✅ COMPLETE (Phases 1–3, 2026-03-20)

Full spec: `docs/FEATURE_PORTFOLIO_NEWS.md`

---

### Task 7: Geographic AI Advisors
**Status:** 📋 Planned
**Priority:** High (differentiating feature)
**Effort:** ~24-32 hours

**Overview:**
Country-specific AI advisors (Gordon for Canada, Brad for USA, etc.) that provide localized financial expertise.

**Sub-tasks:**
- [ ] Design advisor database schema
- [ ] Create advisor system prompts (personality, expertise)
- [ ] Build advisor detection logic (from Plaid accounts)
- [ ] Implement N8N multi-agent workflow
- [ ] Build advisor selector UI
- [ ] Create advisor introduction flow
- [ ] Integrate with visual theming system

---

### Task 8: Goal Account Linking
**Status:** 📋 Planned
**Priority:** Medium
**Effort:** ~4-6 hours

**Overview:**
Allow users to link specific accounts to specific goals so the unallocated bucket shrinks over time.

**Sub-tasks:**
- [ ] UI to assign accounts to goals (drag or select)
- [ ] Update `user_goals.linked_account_ids` array
- [ ] Update PlanView unallocated bucket calculation to use real links
- [ ] Show per-goal allocation on plan detail page

---

### Task 9: Post-Onboarding Re-entry Flows
**Status:** 📋 Planned
**Priority:** Medium
**Effort:** ~4-6 hours

**Overview:**
When returning users want to add accounts, change countries, or add goals, the UI should feel
continuous with what they saw in onboarding. See `docs/PRODUCT_PRINCIPLES.md#onboarding-consistency`.

**Sub-tasks:**
- [ ] "Add countries" flow that reuses `StepCountries` component
- [ ] "Add accounts" flow that reuses `StepConnect` component
- [ ] "Edit goals" modal/page that reuses `StepGoals` layout
- [ ] Add these as quick-action entry points from the dashboard
- [ ] Dev utility: "Reset onboarding" button in settings (dev/staging only)

---

## Phase 4: Polish
**Timeline:** Ongoing

### Task 10: Fix Bug #1 - Sign-up Redirect
**Status:** 📋 Planned
**Priority:** Low

### Task 11: Additional Enhancements
**Status:** 📋 Planned

- Transaction history (from Plaid Transactions API)
- Plan comparison tool (side-by-side)
- PDF export for plans
- Email notifications for check-in reminders
- Account nicknames (user-defined labels)
- What-if analysis (simulate changes before applying)
- Scheduled check-in email delivery (via Resend + cron)

---

## Current Status Summary

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1** | ✅ **Complete** | 100% |
| **Phase 2** | 🎯 **Active** | Task 3 ✅ done; Task 4/5 next |
| Phase 3 | 🔀 **Partial** | Task 6 ✅ done; Tasks 7-9 pending |
| Phase 4 | 📋 Planned | 0% |

**Next Session: Phase 2 — Task 4 (Visual Theming) or Task 5 (Testing Infrastructure)** 🚀

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
