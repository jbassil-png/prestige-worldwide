# Implementation Roadmap

**Status:** Active
**Last Updated:** 2026-03-20
**Current Phase:** Phase 1 - Foundation & Quick Wins

---

## Overview

This roadmap outlines the prioritized implementation order for Prestige Worldwide features, balancing user impact, technical dependencies, and learning objectives.

**Guiding Principles:**
- ✅ Quick wins first (build momentum)
- ✅ Foundation before advanced features
- ✅ Learning opportunities balanced with user value
- ✅ Test as we grow

---

## Phase 1: Foundation & Quick Wins
**Timeline:** Week 1
**Goal:** Fix critical bugs and enable core user control

### ✅ Task 1: Fix Bug #2 - News API Empty Array
**Status:** 🎯 NEXT UP (Start here!)
**Priority:** Medium
**Effort:** 30 minutes
**Owner:** TBD

**Problem:**
- `/api/news` returns empty array when `OPENROUTER_API_KEY` is not configured
- Should return stub news data instead
- Fallback logic (lines 46-47) not triggering correctly

**Solution:**
- Debug why `STUB_NEWS` fallback isn't working
- Likely issue: condition check needs adjustment
- File: `app/api/news/route.ts`

**Acceptance Criteria:**
- [ ] When `OPENROUTER_API_KEY` is missing, API returns stub news
- [ ] Demo mode shows populated news panel
- [ ] No console errors

**Files to Modify:**
- `app/api/news/route.ts`

**Reference:**
- Bug documented in `docs/BACKLOG.md` (Bug Fixes → #1)

---

### Task 2: Account Management & Detail Views
**Status:** ⏳ Pending (after Task 1)
**Priority:** High
**Effort:** ~16 hours (4 sessions)
**Owner:** TBD

**Overview:**
Enable users to manage accounts, update profile, and explore financial data in depth.

**Sub-tasks:**

#### Session 1: Settings Page & Profile API (4 hours)
**Goal:** Users can update countries and ages

- [ ] Build `/settings` page (frontend)
  - Country selectors (residence, retirement)
  - Age inputs (current, retirement)
  - Save/Cancel buttons
  - Success/error states
- [ ] Test `GET /api/profile` endpoint (already implemented)
- [ ] Test `PUT /api/profile` endpoint (already implemented)
- [ ] Verify plan auto-regenerates on country change
- [ ] Add "Settings" link to dashboard header

**Files to Create:**
- `app/settings/page.tsx`

**Files to Modify:**
- `app/dashboard/DashboardClient.tsx` (add settings link)

---

#### Session 2: Account Removal & Detail Page (4 hours)
**Goal:** Users can remove accounts and view individual account details

- [ ] Update `AccountsClient.tsx` to add remove button
  - Confirmation modal before deletion
  - Call `DELETE /api/accounts/[id]`
  - Update local state after successful deletion
  - Show "Regenerate plan" suggestion
- [ ] Create `/accounts/[id]` detail page
  - Account overview (institution, type, balance)
  - Balance history chart (query `user_balance_history`)
  - Account-specific recommendations
  - Quick actions: remove account, back button

**Files to Create:**
- `app/accounts/[id]/page.tsx`

**Files to Modify:**
- `app/accounts/AccountsClient.tsx`

---

#### Session 3: Plan Detail & History Pages (4 hours)
**Goal:** Users can explore plan details and view historical plans

- [ ] Create `/plan` page (current plan detail view)
  - Expanded metrics with larger cards
  - Interactive charts for projections (optional)
  - Full recommendation list with filters (category/priority)
  - Account breakdown table
- [ ] Create `/plan/history` page
  - Query `plan_history` (limit 10, DESC)
  - Display: date, trigger reason, key metrics
  - Expandable detail view for each plan
- [ ] Update `PlanView.tsx` to make metrics clickable
  - Wrap metric cards in `<Link>` to `/plan`
  - Add hover state and "View details" icon

**Files to Create:**
- `app/plan/page.tsx`
- `app/plan/history/page.tsx`

**Files to Modify:**
- `components/PlanView.tsx`

---

#### Session 4: Testing & Polish (4 hours)
**Goal:** Ensure all features work end-to-end

- [ ] Manual testing checklist (from FEATURE_ACCOUNT_MANAGEMENT.md)
  - Remove account flow
  - Update profile flow
  - View account details
  - Navigate to plan detail
  - View plan history
- [ ] Fix any bugs found
- [ ] Polish UI/UX (loading states, error messages, transitions)
- [ ] Update documentation
- [ ] Create PR with comprehensive description

**Deliverables:**
- All acceptance criteria met (see FEATURE_ACCOUNT_MANAGEMENT.md)
- Pull request created and ready for review

---

**Reference:**
- Full specification: `docs/FEATURE_ACCOUNT_MANAGEMENT.md`
- Backlog entry: `docs/BACKLOG.md` (Feature Request #1)
- Database schema: `supabase/migrations/20260320_add_user_profiles.sql`
- API endpoints: `app/api/accounts/[id]/route.ts`, `app/api/profile/route.ts`

---

## Phase 2: Differentiation & Quality
**Timeline:** Week 2-3
**Goal:** Make product stand out and ensure code quality

### Task 3: Visual Theming System
**Status:** 📋 Planned
**Priority:** High (differentiating feature)
**Effort:** ~8-12 hours
**Owner:** TBD

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

**Reference:**
- Full specification: `SESSION_NOTES.md` → Planned Feature: Visual Theming System
- Design resources: Awwwards, Behance, Dribbble, luxury hotel sites

---

### Task 4: Testing Infrastructure
**Status:** 📋 Planned
**Priority:** Medium (technical foundation)
**Effort:** ~6-8 hours
**Owner:** TBD

**Overview:**
Set up automated testing to ensure code quality as project grows.

**Sub-tasks:**
- [ ] Install and configure Vitest
- [ ] Create test structure (`__tests__` or `.test.ts` files)
- [ ] Write unit tests for market data fetchers
  - `fetchQuote()` function
  - `fetchTreasuryYield()` function
  - Error handling and rate limiting
- [ ] Write integration tests for API routes
  - `/api/plan`
  - `/api/chat`
  - `/api/news`
  - `/api/accounts/[id]`
  - `/api/profile`
- [ ] Add test scripts to `package.json`
  - `npm test` - run all tests
  - `npm run test:watch` - watch mode
  - `npm run test:coverage` - coverage report
- [ ] Document testing setup in README

**Reference:**
- Pending session notes (Feb 27, 2026)
- Manual test checklist: `docs/MANUAL_TEST_CHECKLIST.md`

---

## Phase 3: Advanced Features
**Timeline:** Week 4+
**Goal:** Build differentiating AI-powered features

### Task 5: Portfolio-Aware News Feed
**Status:** 📋 Planned
**Priority:** High (major enhancement)
**Effort:** ~20-24 hours
**Owner:** TBD

**Overview:**
Replace generic country/account news with ticker-specific news for stocks/assets the user actually owns.

**Key Changes:**
- Users add stocks/ETFs they own (AAPL, TSLA, VGRO.TO, etc.)
- Fetch real financial news from Finnhub or Alpha Vantage
- Show news about companies/assets in user's portfolio
- Auto-detect from Plaid holdings data

**Sub-tasks:**
- [ ] Design portfolio tracking schema (tickers, holdings)
- [ ] Integrate Finnhub or Alpha Vantage News API
- [ ] Build N8N workflow for news aggregation
- [ ] Create portfolio management UI
- [ ] Update news panel to show ticker-specific news
- [ ] Add news filtering and categorization

**Reference:**
- Full specification: `docs/FEATURE_PORTFOLIO_NEWS.md`
- Backlog entry: `docs/BACKLOG.md` (Feature Request #2)

---

### Task 6: Geographic AI Advisors
**Status:** 📋 Planned
**Priority:** High (differentiating feature)
**Effort:** ~24-32 hours
**Owner:** TBD

**Overview:**
Country-specific AI advisors (Gordon for Canada, Brad for USA, etc.) that provide localized financial expertise.

**Key Features:**
- Auto-detect advisors from user's connected accounts
- One-on-one chat with individual advisors
- Group chat with all advisors (multi-agent)
- Advisors adapt visual identity to user's chosen theme

**Sub-tasks:**
- [ ] Design advisor database schema
- [ ] Create advisor system prompts (personality, expertise)
- [ ] Build advisor detection logic (from Plaid accounts)
- [ ] Implement N8N multi-agent workflow
  - Parallel OpenRouter calls
  - Response merging
  - Context management
- [ ] Build advisor selector UI
- [ ] Create advisor introduction flow
- [ ] Integrate with visual theming system

**Reference:**
- Full specification: `SESSION_NOTES.md` → Planned Feature: Geographic AI Advisors
- Multi-agent AI learning objectives

---

## Phase 4: Polish
**Timeline:** Ongoing
**Goal:** Address remaining bugs and enhancements

### Task 7: Fix Bug #1 - Sign-up Redirect
**Status:** 📋 Planned
**Priority:** Low
**Effort:** 1 hour
**Owner:** TBD

**Problem:**
- When authenticated user navigates to `/sign-up`, they're silently redirected to `/dashboard`
- No explanation or user feedback

**Solution:**
- Add query parameter when redirecting (`?already_signed_in=true`)
- Display friendly message or toast notification

**Reference:**
- `docs/BACKLOG.md` (UX Improvements → #1)

---

### Task 8: Additional Enhancements
**Status:** 📋 Planned
**Priority:** Various
**Effort:** TBD

**Future enhancements from feature specs:**
- Transaction history (from Plaid Transactions API)
- Plan comparison tool (side-by-side)
- PDF export for plans
- Email notifications (plan regeneration alerts)
- Account nicknames (user-defined labels)
- Account goals (savings targets per account)
- What-if analysis (simulate changes before applying)
- Multi-currency dashboard view

**Reference:**
- See "Future Enhancements" sections in feature specs

---

## Alternative Path: N8N-First Approach

If primary goal is to **advance N8N and AI skills**, consider this order instead:

1. ✅ Fix News Bug (30 min)
2. Build N8N Workflow #2: Plan Generation
3. Geographic AI Advisors (multi-agent N8N)
4. Account Management & Detail Views
5. Visual Theming
6. Portfolio-Aware News Feed

**Trade-off:** Learn advanced AI faster but defer core UX improvements.

---

## Success Metrics

Track these metrics as features are rolled out:

**Adoption:**
- % of users who visit `/settings` within first week
- % of users who remove at least one account
- % of users who click into account details
- % of users who change visual theme

**Engagement:**
- Average time spent on account detail page
- % of users who view plan history
- Click-through rate on Financial Snapshot metrics
- Chat interactions with geographic advisors

**Satisfaction:**
- Reduction in support requests (account removal, country changes)
- User feedback on new features
- Net Promoter Score (NPS)

**Targets:**
- 60%+ of active users explore account details within 2 weeks
- 40%+ of users who relocate update their countries
- 80%+ satisfaction rating on post-feature surveys

---

## Session Workflow

**At the start of each session:**
1. Read this roadmap to understand current task
2. Review relevant feature spec (linked in task description)
3. Read SESSION_NOTES.md for recent context
4. Begin implementation

**At the end of each session:**
1. Update task status in this roadmap (checkboxes)
2. Document progress in SESSION_NOTES.md
3. Commit and push changes
4. Update "Last Updated" date at top of this file

---

## Current Status Summary

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1** | 🎯 **Active** | 0% (Starting Task 1) |
| Phase 2 | 📋 Planned | 0% |
| Phase 3 | 📋 Planned | 0% |
| Phase 4 | 📋 Planned | 0% |

**Next Session: Start with Task 1 (Fix News Bug)** 🚀

---

## Related Documents

- [Backlog](./BACKLOG.md) - All feature requests and bugs
- [Session Notes](../SESSION_NOTES.md) - Development history
- [Feature: Account Management](./FEATURE_ACCOUNT_MANAGEMENT.md) - Full spec for Phase 1, Task 2
- [Feature: Portfolio News](./FEATURE_PORTFOLIO_NEWS.md) - Full spec for Phase 3, Task 5
- [Manual Test Checklist](./MANUAL_TEST_CHECKLIST.md) - QA checklist
