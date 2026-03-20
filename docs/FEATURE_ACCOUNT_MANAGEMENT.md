# Feature Specification: Account Management & Detail Views

**Status:** ✅ Implemented
**Priority:** High
**Effort:** Medium (5-6 new files, 3-4 modified files, 1 migration)
**Owner:** TBD
**Created:** 2026-03-20
**Completed:** 2026-03-20

---

## Problem Statement

Users currently lack control over their financial data and visibility into account details:

1. **No account removal** - Users who disconnect a bank or close an account cannot remove it from Prestige Worldwide
2. **No country updates** - Users who relocate internationally cannot update their residence/retirement countries
3. **Limited data exploration** - Financial Snapshot shows aggregate metrics but users can't drill down into details
4. **No account history** - Users can't see how individual account balances have changed over time
5. **No plan comparison** - Users can't compare current plan with past plans to track progress

**User Story:**
> "As a user who moved from Canada to the United States, I want to update my residence country so that my financial plan reflects my new tax situation and currency preferences."

---

## Proposed Solution

Add five interconnected features that give users full control and visibility:

### 1. Account Removal
Allow users to delete accounts they no longer want tracked.

**User Flow:**
1. User visits `/accounts`
2. Clicks "Remove" button on an account card
3. Confirms deletion in modal dialog
4. Account is permanently deleted
5. User is prompted to regenerate plan with updated accounts

**Technical Details:**
- Hard delete from `user_accounts` table
- Check if `plaid_item` is orphaned → delete it too
- No soft delete (simpler, user wants complete removal)

### 2. User Profile & Country Management
Allow users to update their profile when life circumstances change.

**User Flow:**
1. User clicks "Settings" in dashboard header
2. Settings page shows current residence country, retirement country, and ages
3. User updates one or more fields
4. Clicks "Save"
5. Profile is updated in database
6. Plan automatically regenerates with new parameters
7. User redirected to dashboard with updated plan

**Technical Details:**
- New `user_profiles` table (separate from plan metadata)
- Auto-trigger plan regeneration on country change
- Validation: current age ≥ 18, retirement age > current age

### 3. Individual Account Details
Show deep dive into each account's performance and history.

**User Flow:**
1. User clicks account card in `/accounts` (or link from plan)
2. Navigates to `/accounts/[id]`
3. Sees account overview, balance history chart, recommendations
4. Can remove account or return to accounts list

**Technical Details:**
- Query `user_balance_history` for historical data
- Render balance trend chart (simple line chart)
- Extract account-specific recommendations from current plan

### 4. Plan Detail View
Expand the Financial Snapshot into an explorable, detailed view.

**User Flow:**
1. User clicks a metric in Financial Snapshot (e.g., "Net worth")
2. Navigates to `/plan`
3. Sees expanded metrics, interactive charts, full recommendations
4. Can filter recommendations by category/priority
5. Can navigate to account details from recommendations

**Technical Details:**
- Reuse existing plan data structure
- Add filtering UI for recommendations
- Make recommendations linkable (e.g., "Review your US 401(k)" → `/accounts/[id]`)

### 5. Plan History
Allow users to view and compare past financial plans.

**User Flow:**
1. User clicks "Plan History" link (from dashboard or plan page)
2. Navigates to `/plan/history`
3. Sees list of last 10 plans with dates and trigger reasons
4. Can expand each plan to see details
5. Can compare metrics side-by-side

**Technical Details:**
- Query `plan_history` table (limit 10, order by `created_at DESC`)
- Display trigger reason (onboarding, balance change, user request, etc.)
- Optional: Side-by-side comparison view

---

## Technical Specification

### Database Schema

#### New Table: `user_profiles`
```sql
CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  residence_country text NOT NULL,
  retirement_country text NOT NULL,
  current_age integer NOT NULL,
  retirement_age integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_updated_at();
```

**Migration file:** `supabase/migrations/20260320_add_user_profiles.sql`

### API Endpoints

#### `DELETE /api/accounts/[id]`
**Purpose:** Remove an account (hard delete)

**Request:**
- URL param: `id` (account UUID)
- Auth: Required (user session)

**Response:**
```json
{ "success": true }
```

**Error Cases:**
- 401: Unauthorized (no session)
- 404: Account not found or doesn't belong to user
- 500: Database error

**Logic:**
1. Verify account belongs to authenticated user
2. Delete account from `user_accounts`
3. Check if `plaid_item` is orphaned
4. If orphaned, delete `plaid_item` too
5. Return success

**File:** `app/api/accounts/[id]/route.ts`

#### `GET /api/profile`
**Purpose:** Fetch user profile

**Response:**
```json
{
  "user_id": "uuid",
  "residence_country": "United States",
  "retirement_country": "Portugal",
  "current_age": 35,
  "retirement_age": 65,
  "created_at": "2026-03-20T10:00:00Z",
  "updated_at": "2026-03-20T10:00:00Z"
}
```

**Error Cases:**
- 401: Unauthorized
- 500: Database error

#### `PUT /api/profile`
**Purpose:** Update user profile and auto-regenerate plan

**Request Body:**
```json
{
  "residence_country": "United States",
  "retirement_country": "Portugal",
  "current_age": 35,
  "retirement_age": 65
}
```

**Response:**
```json
{
  "profile": { /* updated profile */ },
  "planRegenerated": true
}
```

**Error Cases:**
- 400: Missing required fields or invalid ages
- 401: Unauthorized
- 500: Database error

**Logic:**
1. Validate input (all fields present, ages valid)
2. Upsert profile in `user_profiles`
3. Fetch user's accounts
4. Fetch latest plan metadata (to extract goals)
5. Build plan payload with new countries/ages
6. Call `/api/plan` to generate new plan
7. Save new plan to `user_plans`
8. Return profile and success flag

**File:** `app/api/profile/route.ts`

### Frontend Pages

#### `/settings`
**Purpose:** User profile management

**Components:**
- Form with country selectors (residence, retirement)
- Number inputs for ages
- Save button
- Cancel/back button

**State:**
- Loading state while fetching profile
- Saving state while updating
- Error state if save fails
- Success message after save

**File:** `app/settings/page.tsx`

#### `/accounts/[id]`
**Purpose:** Individual account detail view

**Components:**
- Account header (name, institution, type, balance)
- Balance history chart (from `user_balance_history`)
- Account-specific recommendations
- Quick actions: "Remove account", "Back to accounts"

**Data Sources:**
- Account data: `user_accounts` table
- Balance history: `user_balance_history` table
- Recommendations: Current plan from `user_plans`

**File:** `app/accounts/[id]/page.tsx`

#### `/plan`
**Purpose:** Detailed current plan view

**Components:**
- Expanded metrics with interactive charts
- Recommendation list with filtering (category, priority)
- Account breakdown table
- Country-specific insights
- Export button (optional)

**Data Sources:**
- Current plan from `user_plans` (latest)

**File:** `app/plan/page.tsx`

#### `/plan/history`
**Purpose:** Historical plans view

**Components:**
- List of last 10 plans (cards or table)
- Each plan shows: date, trigger reason, key metrics
- Expandable detail view
- Optional: Comparison mode (side-by-side)

**Data Sources:**
- `plan_history` table (limit 10, DESC)

**File:** `app/plan/history/page.tsx`

### Modified Files

#### `app/accounts/AccountsClient.tsx`
**Changes:**
- Add "Remove" button to each account card
- Add confirmation modal state
- Add `handleRemoveAccount()` function
- Update local state after successful deletion
- Show "Plan may need regeneration" message

**New State:**
```typescript
const [removing, setRemoving] = useState<string | null>(null);
const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
```

#### `components/PlanView.tsx`
**Changes:**
- Wrap metric cards in `<Link>` to `/plan`
- Add hover state to indicate clickability
- Add small "View details" icon to each metric

#### `app/dashboard/DashboardClient.tsx`
**Changes:**
- Add "Settings" button/icon to header
- Link to `/settings`
- Position near "Sign out" button

---

## User Experience

### Navigation Flow

```
Dashboard
├── Settings (header link)
│   └── Update profile → Auto-regenerate plan → Back to dashboard
├── Financial Snapshot (PlanView)
│   └── Click metric → /plan (detail view)
│       └── Plan History link → /plan/history
├── Accounts badge
    └── Manage accounts → /accounts
        └── Click account → /accounts/[id]
            ├── View balance history
            └── Remove account → Confirm → Back to /accounts
```

### Visual Design

**Settings Page:**
- Clean form layout
- Country dropdowns with flag icons
- Age inputs with validation
- Clear "Save" and "Cancel" buttons
- Success toast notification after save

**Account Detail Page:**
- Large account name and balance at top
- Balance history chart (last 30 days)
- "Recommendations" section below chart
- Action buttons at bottom

**Plan Detail Page:**
- Expanded metric cards (larger, more prominent)
- Filterable recommendation list
- Charts showing projections
- Export button (optional)

**Plan History Page:**
- Timeline or table view of plans
- Each entry shows date, trigger, and delta from previous
- Expandable detail view
- "Compare" mode (future enhancement)

---

## Testing Plan

### Unit Tests
- [ ] `DELETE /api/accounts/[id]` - verify deletion logic
- [ ] `GET /api/profile` - verify data fetching
- [ ] `PUT /api/profile` - verify validation and plan regeneration
- [ ] Account removal handler in `AccountsClient`

### Integration Tests
- [ ] Remove account → verify `plaid_item` cleanup
- [ ] Update profile → verify plan regeneration
- [ ] Navigate to account detail → verify balance history loads

### End-to-End Tests
- [ ] Full account removal flow (click → confirm → deleted)
- [ ] Full profile update flow (settings → save → plan regenerates)
- [ ] Navigation from dashboard → plan → account detail

### Manual Testing Checklist
- [ ] Can remove account successfully
- [ ] Confirmation modal prevents accidental deletion
- [ ] Orphaned plaid_items are cleaned up
- [ ] Can update countries in settings
- [ ] Plan auto-regenerates after country change
- [ ] Can view account detail page
- [ ] Balance history chart renders correctly
- [ ] Can navigate from Financial Snapshot to plan detail
- [ ] Can view plan history (last 10 plans)
- [ ] All breadcrumbs and back buttons work

---

## Future Enhancements

### Phase 2 (Post-MVP)
1. **Transaction History** - Show detailed transactions per account (requires Plaid transactions API)
2. **Plan Comparison Tool** - Side-by-side comparison of two plans
3. **PDF Export** - Download plan as formatted PDF
4. **Email Notifications** - Alert user when plan regenerates
5. **Account Nicknames** - Let users rename accounts for easier identification

### Phase 3 (Advanced)
1. **Account Goals** - Set savings goals per account
2. **What-If Analysis** - Simulate country changes before applying
3. **Multi-Currency Dashboard** - View balances in multiple currencies simultaneously
4. **Account Categories** - Tag accounts (Emergency fund, Retirement, etc.)

---

## Success Metrics

**Adoption:**
- % of users who visit `/settings` within first week
- % of users who remove at least one account
- % of users who click into account details

**Engagement:**
- Average time spent on account detail page
- % of users who view plan history
- Click-through rate on Financial Snapshot metrics

**Satisfaction:**
- Reduction in support requests about "how to remove account"
- Reduction in support requests about "how to change country"
- User feedback on new features

**Target:**
- 60%+ of active users explore account details within 2 weeks
- 40%+ of users who relocate update their countries (vs. churning)
- 80%+ satisfaction rating on post-feature survey

---

## Dependencies

**External:**
- None (all functionality uses existing Supabase and API infrastructure)

**Internal:**
- Requires `user_balance_history` table to be populated (from Plaid balance refresh)
- Requires `plan_history` table to exist (added in recent migration)

**Blocked By:**
- None (can implement immediately)

**Blocks:**
- None (other features can proceed independently)

---

## Open Questions

1. **Should we allow users to pause account tracking without deleting?**
   - Potential "Archive" feature instead of hard delete
   - Decision: Defer to Phase 2, start with delete

2. **How to handle plan regeneration failures?**
   - If `/api/plan` fails after profile update, should we revert profile?
   - Decision: Keep profile update, show error, allow manual retry

3. **What to show if user has no balance history yet?**
   - Show "No history available yet" message
   - Decision: Add sample data generator for demo mode

4. **Should plan history show diffs or full snapshots?**
   - Diffs are more useful but harder to compute
   - Decision: Start with snapshots, add diff view in Phase 2

5. **How to surface plan detail page to users?**
   - Make metrics clickable (current proposal)
   - Also add "View full plan" button?
   - Decision: Both (clickable metrics + explicit button)

---

## Implementation Timeline

**Estimated:** 2-3 days for full implementation + testing

| Task | Est. Time | Status |
|------|-----------|--------|
| Database migration | 30 min | ✅ Done |
| API endpoints (accounts, profile) | 1 hour | ✅ Done |
| Settings page | 2 hours | ✅ Done |
| Account detail page | 3 hours | ✅ Done |
| Plan detail page | 2 hours | ✅ Done |
| Plan history page | 2 hours | ✅ Done |
| Update existing components | 1 hour | ✅ Done |
| Testing & polish (loading/error states) | 3 hours | ✅ Done |
| Manual QA | 1 hour | ✅ Done |
| Documentation | 1 hour | ✅ Done |
| **Total** | **~16 hours** | **✅ 100% complete** |

---

## Rollout Plan

### Phase 1: Beta Testing (Week 1)
- Deploy to staging
- Test with 3-5 beta users
- Gather feedback on UX
- Fix critical bugs

### Phase 2: Production Release (Week 2)
- Merge to main branch
- Deploy to production
- Announce feature in product updates
- Monitor usage metrics

### Phase 3: Iteration (Week 3+)
- Analyze user behavior
- Address feedback
- Plan Phase 2 enhancements

---

## Related Documents

- [Backlog](./BACKLOG.md) - Feature Request #1
- [Session Notes](../SESSION_NOTES.md) - Mar 20, 2026 session
- [Database Migration](../supabase/migrations/20260320_add_user_profiles.sql)
