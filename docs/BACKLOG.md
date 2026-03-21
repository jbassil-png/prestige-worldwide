# Backlog - Issues & Improvements

This document tracks non-critical issues and improvements identified during testing that should be addressed after the Next.js update.

---

## UX Improvements

### 1. Sign-up Page Redirect - No User Feedback
**Issue:** When an authenticated user navigates to `/sign-up`, they are silently redirected to `/dashboard` with no explanation.

**Current Behavior:**
- Middleware redirects authenticated users from `/sign-up` and `/sign-in` to `/dashboard`
- No message or indication why the redirect happened
- Can be confusing if user doesn't realize they're already logged in

**Proposed Fix:**
- Add query parameter when redirecting (e.g., `?already_signed_in=true`)
- Display a friendly message on dashboard: "You're already signed in"
- Or show a toast notification explaining the redirect

**Location:** `middleware.ts` lines 45-54

**Priority:** Low
**Effort:** Small

---

## Bug Fixes

### 1. News API Returns Empty Array Without API Key
**Issue:** When `OPENROUTER_API_KEY` is not configured, the `/api/news` endpoint returns an empty items array instead of stub/mock news.

**Current Behavior:**
- API returns `{ "items": [] }` when OpenRouter API key is missing
- Users see empty news panel with no content
- No indication that stub data should be shown

**Expected Behavior:**
- Should return stub news data (defined in `STUB_NEWS` constant) when API key is not configured
- Code has fallback logic (lines 46-47) but it's not triggering correctly

**Location:** `app/api/news/route.ts` lines 44-48

**Impact:** News panel appears broken until OpenRouter API is configured

**Priority:** Medium
**Effort:** Small - Debug why the fallback condition isn't working

---

## Feature Requests

### ✅ 1. Account Management & Detail Views — COMPLETE (2026-03-20)
**Vision:** Give users complete control over their accounts and deep visibility into their financial data.

**Current Limitations:**
- Users can add accounts but cannot remove them
- No ability to update countries when user relocates
- Financial Snapshot metrics are static (not clickable/explorable)
- No way to view individual account details or balance history
- No way to compare financial plans over time

**Proposed Features:**

#### A. Account Removal
- Add "Remove" button to each account card in `/accounts`
- **Strategy:** Hard delete (not soft delete)
- Confirmation dialog before deletion
- Auto-remove associated `plaid_items` if no other accounts use it
- Suggest plan regeneration after account removal

#### B. User Settings/Profile Page (`/settings`)
- Allow users to update:
  - Residence country (affects currency display and tax advice)
  - Retirement country (affects retirement planning)
  - Current age and retirement age
- **Strategy:** Auto-regenerate plan when countries change
- Store in new `user_profiles` table (separate from plan metadata)
- **Why separate:** Plan metadata is immutable history; profile is current state

#### C. Account Detail Page (`/accounts/[id]`)
- Account overview (institution, type, balance, currency)
- Balance history chart (from `user_balance_history` table)
- Account-specific recommendations from current plan
- Quick actions: refresh balance, remove account

#### D. Financial Plan Details (`/plan`)
- Expanded view of current plan metrics
- Interactive charts for projections
- Detailed breakdown by account and country
- Full recommendation list with filtering (category/priority)
- Optional: Export plan as PDF

#### E. Plan History (`/plan/history`)
- **Limit:** Show last 10 plans (not all history)
- Compare plans side-by-side
- See what triggered each plan (onboarding, balance change, etc.)
- Track how projections changed over time

#### F. Enhanced Navigation
- Make Financial Snapshot metrics clickable → navigate to `/plan`
- Add account links in recommendations
- Settings icon in header navigation
- Breadcrumb navigation on detail pages

**Technical Requirements:**

**Database Changes:**
```sql
-- New table for user profile
CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  residence_country text NOT NULL,
  retirement_country text NOT NULL,
  current_age integer NOT NULL,
  retirement_age integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**New API Endpoints:**
- `DELETE /api/accounts/[id]` - Remove account
- `GET/PUT /api/profile` - Fetch/update user profile

**New Pages:**
- `/settings` - User profile and country management
- `/accounts/[id]` - Individual account detail view
- `/plan` - Current plan detail view
- `/plan/history` - Historical plans (last 10)

**Files to Modify:**
- `app/accounts/AccountsClient.tsx` - Add remove button
- `components/PlanView.tsx` - Make metrics clickable
- `app/dashboard/DashboardClient.tsx` - Add settings link to header

**Location:**
- Database migration: `supabase/migrations/20260320_add_user_profiles.sql`
- API routes: `app/api/accounts/[id]/route.ts`, `app/api/profile/route.ts`
- Pages: `app/settings/`, `app/accounts/[id]/`, `app/plan/`

**Impact:**
- Addresses major user pain point when relocating countries
- Provides transparency into financial data sources
- Enables users to explore their plan in depth
- Gives users full control over connected accounts

**Priority:** High (core UX improvement)
**Effort:** Medium (5-6 new files, 3-4 modified files, 1 migration)

**Acceptance Criteria:**
- [x] User can remove accounts from `/accounts` page
- [x] User can update countries and age in `/settings`
- [x] Plan auto-regenerates when countries change
- [x] User can view individual account details at `/accounts/[id]`
- [x] User can see balance history chart for each account
- [x] User can view expanded plan details at `/plan`
- [x] User can view last 10 historical plans at `/plan/history`
- [x] Financial Snapshot metrics are clickable and navigate to plan details
- [x] Settings link appears in dashboard header

---

### ✅ 2. Portfolio-Aware News Feed — COMPLETE (Phases 1–3, 2026-03-20)
**Vision:** Replace generic country/account news with ticker-specific news for stocks/assets the user actually owns.

**Current Implementation:**
- `/api/news/route.ts` uses Perplexity Sonar Pro (LLM)
- Generates 3-5 generic news items based on user's countries and account types
- Example: "IRS releases foreign tax credit guidance for US-Canada taxpayers"
- 24-hour cache in `user_news` table

**New Vision:**
- **Portfolio tracking:** Users add stocks/ETFs they own (AAPL, TSLA, VGRO.TO, etc.)
- **Real news API:** Fetch actual financial news from Finnhub or Alpha Vantage
- **Ticker-specific:** Show news about companies/assets in user's portfolio
- **Dynamic updates:** When user buys a new stock, news about that stock appears automatically
- **Example:** User holds AAPL → sees "Apple announces Q4 earnings beat expectations"

**Technical Requirements:**
See detailed specification: `docs/FEATURE_PORTFOLIO_NEWS.md`

**Priority:** High (after Workflow #2 - Financial Plan)
**Effort:** Large (requires DB schema changes, new API integration, N8N workflow, frontend redesign)

---

## Feature Requests

### 3. Post-Onboarding Re-entry Flows
**Vision:** When returning users want to add accounts, change countries, or edit goals, the experience should feel like a natural continuation of onboarding — not a separate admin panel.

**Current state:** Users go to `/settings` for country/retirement changes and `/accounts` for account management. These UIs are functional but don't share the component language of onboarding.

**Proposed:**
- "Add countries" and "Add accounts" actions on the dashboard that open flows reusing `StepCountries` and `StepConnect`
- Goal editing that renders the same goal card UI as `StepGoals`
- Entry points from the dashboard ("Connect another account", "Add a goal")
- Dev-mode "Reset onboarding" button in settings

**Reference:** `docs/PRODUCT_PRINCIPLES.md#onboarding-consistency`
**Priority:** Medium
**Effort:** Medium (~4-6 hours)

---

### 4. Scheduled Check-in Email Delivery
**Vision:** When `next_checkin_at` arrives, send the user an email prompting them to review their portfolio.

**Current state:** `user_checkin_schedule` table tracks the schedule and is writable from settings. No emails are sent yet.

**Proposed:**
- Vercel cron job (daily) that queries for users whose `next_checkin_at <= now()`
- Sends a Resend email: "It's time for your [quarterly / biannual] portfolio review"
- Updates `last_checkin_at` and sets next `next_checkin_at`
- Email includes: current net worth snapshot, any significant balance changes, link to dashboard

**Priority:** Medium
**Effort:** Medium (~3-4 hours)

---

### 5. Goal Account Linking UI
**Vision:** Users can drag or assign accounts to goals so the unallocated bucket shrinks meaningfully.

**Current state:** `user_goals.linked_account_ids` column exists in the DB. The unallocated bucket calculation is approximate (net worth minus goal target, capped).

**Proposed:**
- On the goals/plan page, show each goal with an "Add accounts" action
- Multi-select from user's connected accounts
- Update `linked_account_ids` array
- Unallocated bucket = net worth minus sum of balances in linked accounts

**Priority:** Medium
**Effort:** Small-Medium (~3-4 hours)

---

## Technical Debt

### 1. user_profiles — drop legacy age columns
The `current_age` and `retirement_age` columns in `user_profiles` were made nullable in migration `20260321`. Once we confirm no active users have data in those columns, they can be dropped in a follow-up migration.

**Migration needed:**
```sql
ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS current_age,
  DROP COLUMN IF EXISTS retirement_age;
```

**Priority:** Low (housekeeping)

---

### 2. PlanView Plan type — forward compatibility
`PlanView.tsx` and `PlanDetailClient.tsx` both define local `Plan` / `Metrics` types. As the plan schema grows (goals, on-track status, check-in metadata), these types should be centralised in a shared `types/plan.ts` file.

**Priority:** Low
