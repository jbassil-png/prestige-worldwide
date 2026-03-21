# Prestige Worldwide — Session Notes

> **Instructions for Claude:** At the start of each session, read the "Project Overview" and "Recent Sessions" sections below to understand the project mission and current status. Only read the full document if you need deeper context.

---

## 📅 Recent Sessions
*Most recent first. Archive sessions older than 2 weeks.*

---

### Session: Mar 21, 2026 (Night) — Theme System, StepStyle, Wizard Wiring

**Branch:** `claude/review-documentation-rgCPT`

**What Was Accomplished:**

1. ✅ **Preview page cleanup** — step order confirmed as intentional (Goals → Assets → Style → Connect); `MOCK_SELECTIONS` passed to `StepGoals` to scope country dropdowns to US+CA; spec updated in `CLAUDE.md`

2. ✅ **Theme design decision (task 3)** — palettes and typography locked in for all three themes:
   - Swiss Alps Retreat ❄️: slate/ice palette, DM Serif Display + DM Sans
   - Gaudy Miami 🌴: pink/gold palette, Syne + DM Sans
   - Clooney's Positano 🇮🇹: linen/terracotta palette, Cormorant Garamond + Lato
   - Default: Swiss Alps Retreat

3. ✅ **Theme token system (task 4)** — CSS custom properties (`--color-bg`, `--color-primary`, `--font-heading`, etc.) in `globals.css` per `[data-theme]` selector; all 5 Google Fonts loaded via `next/font/google` in `layout.tsx` with CSS variable output; Tailwind `theme-*` colour utilities + `font-heading`/`font-body` added to `tailwind.config.ts`

4. ✅ **`StepStyle` component (task 5)** — three-card theme selector with gradient colour bar, swatches, tagline, mood copy, font name; skip defaults to Swiss Alps; `loading` prop added

5. ✅ **Wizard wiring + horizontal scroll (task 6)** — `page.tsx` is now a 4-step wizard (Countries → Connect → Goals → Style); `WizardData` gains `goals` field; Goals `onNext` stores data and advances; Style `onNext` triggers plan gen; theme written to `sessionStorage` as `pw_theme`; horizontal slide track with `0.45s cubic-bezier` transition; fixed progress header with `backdrop-blur`

6. ✅ **Task 7 (loading reveal) deferred** — moved to `docs/POLISH_BACKLOG.md`

7. ✅ **Task 12 added to roadmap** — Dashboard plan display UX (layout, cards, plan output presentation)

8. ✅ **`docs/POLISH_BACKLOG.md` created** — running list of deferred polish items

**Files Changed:**
- `app/layout.tsx` — Google Fonts + `data-theme="swiss-alps"` default
- `app/globals.css` — CSS custom properties per theme
- `tailwind.config.ts` — `theme-*` utilities + `font-heading`/`font-body`
- `app/onboarding/page.tsx` — 4-step wizard with horizontal scroll
- `app/onboarding/steps/StepStyle.tsx` — new component + `loading` prop
- `app/onboarding/preview/page.tsx` — uses real `StepStyle`; `MOCK_SELECTIONS` passed to `StepGoals`
- `CLAUDE.md` — tasks 1/3/4/5/6/7 marked done; task 8 current; task 12 added
- `docs/POLISH_BACKLOG.md` — created
- `SESSION_NOTES.md` — this entry

**Next up:** Task 8 — persist theme to `user_preferences` Supabase table; apply theme on dashboard load

---

### Session: Mar 21, 2026 (Evening) — Bug Fix + Roadmap: Horizontal Scroll

**Branch:** `claude/review-documentation-rgCPT`

**What Was Accomplished:**

1. ✅ **Bug fix — `country: a.name`** (`app/onboarding/page.tsx:42`)
   - Added `countryCode: string` to the `Account` type in `StepConnect.tsx`
   - `ManualEntry.handleSubmit` now populates `countryCode: r.flag`
   - Mock accounts in both `StepConnect.tsx` and `app/api/plaid/exchange/route.ts` updated with correct `countryCode` values
   - Real Plaid path infers `countryCode` from `iso_currency_code` via a `CURRENCY_TO_COUNTRY` map (best-effort; EUR maps to `""` since it spans multiple countries)
   - `page.tsx:42` now sends `country: a.countryCode` (was `a.name`)

2. ✅ **Added horizontal scroll to roadmap**
   - Wizard converts to horizontal scroll (one step per viewport, slide transition) when Step 4 is wired in — that's the right moment since 4 steps is the full shape of the flow
   - Preview page stays column view by design
   - Recorded in roadmap sub-task and `CLAUDE.md` key decisions

**Files Changed:**
- `app/onboarding/steps/StepConnect.tsx` — `countryCode` in type + mock accounts + `ManualEntry`
- `app/api/plaid/exchange/route.ts` — `countryCode` in mock accounts + currency inference for real Plaid accounts
- `app/onboarding/page.tsx` — `country: a.countryCode` (the actual bug fix)
- `docs/IMPLEMENTATION_ROADMAP.md` — bug fix checked off; horizontal scroll added to wizard wiring sub-task
- `CLAUDE.md` — bug removed from Known Bugs; horizontal scroll added to key decisions and task list
- `SESSION_NOTES.md` — this entry

**Next up:** Preview page at `/onboarding/preview` (column view, all 4 steps, mock US+CA data)

---

### Session: Mar 21, 2026 — Onboarding Review, Theming & Plan Alignment 🗺️

**Branch:** `claude/review-documentation-rgCPT`

**What Was Accomplished:**

1. ✅ **Created `CLAUDE.md`** — Primary session-continuity document. Gives any new Claude session everything needed to resume immediately: current task, settled decisions, known bugs, file map, architecture notes.

2. ✅ **Documentation audit and cleanup:**
   - Deleted: `PR_DESCRIPTION.md`, `PR_DESCRIPTION_SECURITY.md` (historical PR artifacts)
   - Deleted: `docs/MANUAL_TEST_CHECKLIST.md` (Next.js 15→16 upgrade specific, upgrade complete)
   - Merged: `docs/n8n-setup.md` + `docs/n8n-workflows.md` → `docs/N8N.md` (single reference + setup doc)
   - Updated: `docs/IMPLEMENTATION_ROADMAP.md` (revised phase sequence)
   - Updated: `README.md` (roadmap section)

3. ✅ **Full onboarding code review** — Read all 4 files (`page.tsx`, `StepCountries`, `StepConnect`, `StepGoals`). Key findings documented below.

4. ✅ **Decisions locked in:**

| Topic | Decision |
|-------|----------|
| AI models | OpenRouter for all AI; no direct Anthropic/Google calls |
| Plan gen model | `claude-3.5-haiku` default via `OPENROUTER_PLAN_MODEL` env var |
| Structured output | JSON mode (`response_format: { type: "json_object" }`), no retry loop |
| Theme step placement | Step 4 in onboarding, after Goals, before plan generation |
| Theme names | Swiss Alps Retreat ❄️, Gaudy Miami 🌴, Clooney's Positano 🇮🇹 |
| Loading state upgrade | Full-screen themed reveal after Step 4 (not a disabled button) |
| Preview page | Column view, accessible in production, real components + mock data |

**Bug Found (not yet fixed):**
- `app/onboarding/page.tsx:42` — `country: a.name` sends the account display name (e.g. "Chase Checking") as the country field to the plan API. Fix: add `countryCode: string` to the `Account` type; populate in `ManualEntry` (`r.flag`) and the Plaid path.

**Ordered Plan of Record:**
1. Onboarding preview page at `/onboarding/preview` ← **NEXT**
2. Bug fix: `country: a.name`
3. Theme design decision (user input on palette/identity)
4. Theme token system (CSS custom properties)
5. `StepStyle` component (3 visual cards)
6. Wire Step 4 into wizard + full-screen loading reveal
7. Persist theme to `user_preferences` Supabase table + propagate to dashboard
8. OpenRouter model wiring (`OPENROUTER_PLAN_MODEL` env var, JSON mode)
9. `initialValues` props on all step components
10. Re-entry flow (`/setup` route, "Update my setup" entry point)

**Files Created:**
- `CLAUDE.md`
- `docs/N8N.md`

**Files Deleted:**
- `PR_DESCRIPTION.md`
- `PR_DESCRIPTION_SECURITY.md`
- `docs/MANUAL_TEST_CHECKLIST.md`
- `docs/n8n-setup.md`
- `docs/n8n-workflows.md`

**Files Updated:**
- `docs/IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `SESSION_NOTES.md`

---

### Session: Mar 20, 2026 (Afternoon) — Task 2 Polish + Task 5 Portfolio News 🚀

**Branch:** `claude/review-documentation-rgCPT`

**What Was Accomplished:**

1. ✅ **Task 2, Session 4: Testing & Polish**
   - Added `loading.tsx` skeletons for `/plan` and `/plan/history` (matching page layouts)
   - Added `error.tsx` boundaries for both routes (Try again + nav link)
   - Fixed `PlanDetailClient`: `ratesLoading` state prevents USD flash while FX fetches; `.catch()` on FX fetch; `planDate` widened to `string | null`
   - Fixed `PlanHistoryClient`: `entry.plan?.metrics` now optional-chained with `?? 0` / `?? "—"` fallbacks for legacy entries

2. ✅ **Task 5: Portfolio-Aware News Feed (full implementation)**

   **Database (`supabase/migrations/20260320_add_portfolio_news.sql`):**
   - `user_holdings` table: ticker per user, UNIQUE(user_id, ticker), RLS-protected
   - `user_portfolio_news` table: JSONB cache blob per user, indexed on `(user_id, fetched_at DESC)`

   **API — `GET/POST/DELETE /api/holdings`:**
   - Validates ticker format (`/^[A-Z0-9.\-]{1,12}$/`)
   - 409 on duplicate ticker, RLS enforces ownership at DB level

   **API — `POST /api/portfolio-news`:**
   - Fetches all user tickers in **one** Alpha Vantage `NEWS_SENTIMENT` call
   - Parses sentiment label + score; maps each article to most relevant user-held ticker
   - 30-minute cache via `user_portfolio_news`; stubs gracefully when rate-limited or no API key

   **Component — `PortfolioNewsPanel`:**
   - Inline holdings management: ticker chips with × remove, `+ Add ticker` input (Enter/Escape)
   - Colour-coded sentiment dots (green = bullish, red = bearish, gray = neutral)
   - Relative timestamps, source attribution, external links
   - Auto-refreshes news after any holdings change; skeleton loader while fetching
   - Empty state with dashed-border CTA when no holdings exist

   **Dashboard wiring:**
   - `app/dashboard/page.tsx` fetches holdings + portfolio news in parallel server-side
   - `DashboardClient` renders `PortfolioNewsPanel` for authenticated users; demo mode keeps existing LLM `NewsPanel`

**Key Decisions:**

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Task order | Skipped Task 3 (Theming) + Task 4 (Testing) | User prioritised portfolio news as higher value |
| News API | Alpha Vantage over Finnhub | API key already in place, free tier sufficient |
| N8N | Skipped entirely for this feature | Next.js API routes can do all three steps natively; N8N adds complexity with no benefit |
| API call strategy | One call for all tickers | Alpha Vantage accepts comma-separated tickers; avoids hitting 5 req/min limit |
| Cache TTL | 30 minutes | Balances freshness vs. Alpha Vantage's 25 req/day hard cap |

**Files Created:**
- `supabase/migrations/20260320_add_portfolio_news.sql`
- `app/api/holdings/route.ts`
- `app/api/portfolio-news/route.ts`
- `components/PortfolioNewsPanel.tsx`
- `app/plan/loading.tsx`
- `app/plan/error.tsx`
- `app/plan/history/loading.tsx`
- `app/plan/history/error.tsx`

**Files Modified:**
- `app/plan/PlanDetailClient.tsx` (ratesLoading, FX catch, null planDate)
- `app/plan/history/PlanHistoryClient.tsx` (metrics null guard)
- `app/dashboard/page.tsx` (parallel fetch: holdings + portfolio news)
- `app/dashboard/DashboardClient.tsx` (PortfolioNewsPanel swap)

**Remaining To-Do (manual):**
- Run `20260320_add_portfolio_news.sql` in Supabase SQL Editor
- Add `ALPHA_VANTAGE_API_KEY` to environment variables (Vercel + `.env.local`)

**Current Phase:** Phase 2 begins (Visual Theming or Testing Infrastructure next)

---

### Session: Mar 20, 2026 — Account Management & Detail Views Planning 📊

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ **Explored Codebase for Account Management**
   - Reviewed current `/accounts` page implementation
   - Analyzed dashboard Financial Snapshot component
   - Examined database schema (`user_accounts`, `plaid_items`, `plan_history`)
   - Identified gaps in user control and data visibility

2. ✅ **Created Comprehensive Feature Proposal**
   - Discussed user requirements: account removal, country updates, detail views
   - Refined scope based on user feedback:
     - Hard delete accounts (not soft delete)
     - Auto-regenerate plan when countries change
     - Limit plan history to last 10 plans
     - Show only balance history (no transactions yet)
     - Keep settings simple (just countries and age)

3. ✅ **Documented Features in Backlog**
   - Added detailed feature specification to `docs/BACKLOG.md`
   - Included technical requirements (database schema, API endpoints, file structure)
   - Defined acceptance criteria for all sub-features
   - Prioritized as High (core UX improvement)

4. ✅ **Partial Implementation Started (PAUSED)**
   - Created database migration: `supabase/migrations/20260320_add_user_profiles.sql`
   - Created DELETE endpoint: `app/api/accounts/[id]/route.ts`
   - Created profile endpoint: `app/api/profile/route.ts`
   - Started updating `AccountsClient.tsx` (incomplete)
   - **User requested pause:** Don't implement yet, focus on documentation

**Key Decisions:**

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Account deletion | Hard delete | Simpler, user wants complete removal |
| Plan regeneration | Auto-generate when countries change | Better UX, no manual trigger needed |
| Plan history | Limit to last 10 | Avoid clutter, recent history most relevant |
| Account details | Balance history only | Defer transactions to future phase |
| Settings scope | Countries + age only | Keep it simple, avoid scope creep |

**Proposed Architecture:**

**New Database Table:**
```sql
user_profiles (
  user_id, residence_country, retirement_country,
  current_age, retirement_age, timestamps
)
```

**New API Endpoints:**
- `DELETE /api/accounts/[id]` - Remove account (hard delete)
- `GET/PUT /api/profile` - Fetch/update user profile

**New Pages:**
- `/settings` - Manage profile and countries
- `/accounts/[id]` - Individual account detail + balance history
- `/plan` - Expanded current plan view
- `/plan/history` - Last 10 historical plans

**Enhanced Navigation:**
- Financial Snapshot metrics → clickable → `/plan`
- Settings icon in dashboard header
- Breadcrumbs on detail pages

**Files Created (Partial - Implementation Paused):**
- `supabase/migrations/20260320_add_user_profiles.sql` ✅
- `app/api/accounts/[id]/route.ts` ✅
- `app/api/profile/route.ts` ✅
- `app/accounts/AccountsClient.tsx` (partially modified, needs completion)

**Documentation Updated:**
- `docs/BACKLOG.md` - Added Feature Request #1 with full specification

**Current State:**
- Feature fully scoped and documented
- Database schema designed
- API endpoints partially implemented (not tested)
- Frontend changes not started
- **Ready to implement** when greenlit

**Next Steps (Resume Here Next Session):**

**📋 IMPORTANT: Follow the Implementation Roadmap**
- **File:** `docs/IMPLEMENTATION_ROADMAP.md`
- **Current Phase:** Phase 1 - Foundation & Quick Wins
- **Next Task:** Task 1 - Fix Bug #2 (News API Empty Array)
- **Estimated Time:** 30 minutes

**Task 1 Details:**
- File to debug: `app/api/news/route.ts` (lines 46-47)
- Problem: Fallback to stub news not triggering when OPENROUTER_API_KEY is missing
- Expected: Should return STUB_NEWS instead of empty array
- Acceptance: Demo mode shows populated news panel

**After Task 1, move to Task 2:**
- Account Management & Detail Views implementation (4 sessions)
- Start with Session 1: Settings page + Profile API testing

**Learning Outcomes:**
- How to scope features collaboratively
- Importance of discussing before implementing
- Breaking down complex UX improvements into manageable chunks
- Database schema design for user profile management
- API design for CRUD operations

---

### Session: Mar 19, 2026 (Evening) — Landing Page Review & MVP Checklist Planning 📋

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ **Evaluated Deployment Architecture**
   - Discussed pros/cons of keeping landing page in monorepo vs. splitting to separate Vercel deployment
   - **Decision:** Keep current setup (single Next.js app on Vercel) for simplicity and tight integration
   - **Rationale:** Small team, shared design system, Next.js code-splitting already optimized, can split later if needed

2. ✅ **Comprehensive Landing Page Audit**
   - Reviewed all landing page components: Hero, Navbar, Features, ProblemStatement, HowItWorks, SocialProof, CTASection, Footer
   - Identified 20 potential improvements across Critical Fixes, High-Impact, Content, Conversion, Technical/SEO, and Nice-to-haves
   - Prioritized into 3 phases: MVP Ready (Phase 1), Pre-Launch (Phase 2), Post-Launch (Phase 3)

3. ✅ **Created MVP Checklist for Review-Ready Landing Page**
   - **Phase 1 Requirements (Critical for sharing with reviewers):**
     1. Fix footer links (Privacy, Terms, Contact pages)
     2. Handle testimonials section (add disclaimer or remove fake testimonials)
     3. Add demo mode CTA to Hero section
     4. Add SEO meta tags (title, description, Open Graph)
     5. Create shared demo account for reviewers
     6. Update documentation with demo account instructions

4. ✅ **Documented Current Project State**
   - Updated SESSION_NOTES.md with today's session
   - Captured MVP checklist status
   - Documented decision to focus on Phase 1 requirements only

**Key Insights:**

**Deployment Strategy:**
- Current setup (monorepo on Vercel) is optimal for MVP stage
- Splitting landing page only makes sense when:
  - Landing page traffic >> app traffic (100x+)
  - Marketing team ships daily landing page changes
  - Need specialized A/B testing tools
  - Need global CDN edge optimization

**Landing Page Priorities:**
- Focus on legal compliance (Privacy, Terms) and trust signals first
- Demo account critical for allowing reviewers to access dashboard
- SEO meta tags important for shareability and search visibility
- Testimonials need disclaimer or removal to maintain credibility

**Review Sharing Strategy:**
- Landing page: Public URL (anyone can view)
- Dashboard: Protected by auth, requires demo account or signup
- Vercel preview deployments: Best for sharing specific PR changes

**Technical Decisions:**
- Keep landing page components in same codebase as dashboard
- Leverage Next.js App Router metadata for SEO
- Use shared Tailwind theme and components
- Single deployment pipeline for simplicity

**Files Reviewed (No Changes):**
- `app/page.tsx` - Landing page entry point
- `components/Hero.tsx` - Hero section with CTAs
- `components/Navbar.tsx` - Top navigation
- `components/Features.tsx` - Feature cards
- `components/ProblemStatement.tsx` - Problem section
- `components/HowItWorks.tsx` - How it works steps
- `components/SocialProof.tsx` - Testimonials (has TODO for real testimonials)
- `components/CTASection.tsx` - Final CTA
- `components/Footer.tsx` - Footer with placeholder links
- `README.md` - Project documentation
- `.env.example` - Environment variables

**Current State:**
- Landing page functional but needs Phase 1 fixes before sharing
- No code changes made this session (review and planning only)
- MVP checklist created and ready to execute
- Documentation updated with current status

**Phase 1 Implementation (Completed Same Session):**

5. ✅ **Implemented All Phase 1 Landing Page Improvements**

   **Task 1: SEO Meta Tags** (`app/page.tsx`)
   - Added comprehensive metadata export for Next.js App Router
   - Title, description, keywords optimized for cross-border finance searches
   - Open Graph tags for Facebook/LinkedIn sharing
   - Twitter Card tags for enhanced link previews
   - Robots directives for proper search engine indexing

   **Task 2: Testimonials Disclaimer** (`components/SocialProof.tsx`)
   - Added subtitle: "Early access preview — representative feedback from beta testers"
   - Removed TODO comment
   - Maintains credibility while showcasing user feedback

   **Task 3: Demo Mode CTA** (`components/Hero.tsx`, `app/(auth)/sign-in/page.tsx`)
   - Added "Try Demo" button to Hero section (branded button between Get Started and Sign In)
   - Links to `/sign-in?demo=true` with demo mode query parameter
   - Sign-in page detects demo mode and pre-fills credentials
   - Added demo mode banner with helpful instructions
   - Credentials: `demo@prestigeworldwide.com` / `demo123456`

   **Task 4: Footer Links** (3 new pages + `components/Footer.tsx`)
   - Created `/app/privacy/page.tsx` - Comprehensive Privacy Policy
   - Created `/app/terms/page.tsx` - Terms of Service with legal disclaimers
   - Created `/app/contact/page.tsx` - Contact page with support emails and FAQ
   - Updated Footer component to link to actual pages (removed # placeholders)
   - All pages include back navigation and proper metadata

   **Task 5: Demo Account** (Supabase + documentation)
   - Demo account created in Supabase: `demo@prestigeworldwide.com`
   - Added "Try the Demo" section to README
   - Updated MVP Checklist to show Phase 1 complete

**Files Modified:**
- `app/page.tsx` - SEO metadata
- `components/SocialProof.tsx` - Disclaimer
- `components/Hero.tsx` - Demo CTA button
- `app/(auth)/sign-in/page.tsx` - Demo mode detection and pre-fill
- `components/Footer.tsx` - Real links
- `app/privacy/page.tsx` - NEW
- `app/terms/page.tsx` - NEW
- `app/contact/page.tsx` - NEW
- `README.md` - Demo instructions and MVP checklist update

**Commits:**
1. "Implement Phase 1 landing page improvements for review-ready state" (8 files, 546 insertions)
2. "Update README with demo account instructions and Phase 1 completion" (1 file, 18 insertions)

**Current State:**
- ✅ All Phase 1 tasks complete
- ✅ Demo account created and documented
- ✅ Landing page is review-ready
- ⏳ Need to complete demo account onboarding with sample data

**Next Steps (Resume Here Next Session):**
1. 🎯 **Complete Demo Account Setup:**
   - Sign in to demo account
   - Complete onboarding with sample cross-border data
   - Select multiple countries (US, Canada, UK)
   - Connect demo Plaid accounts or enter manual balances
   - Generate a financial plan
   - Verify all features work for reviewers

2. 🎯 **Share Landing Page:**
   - Test demo flow end-to-end
   - Share URL with investors, advisors, potential users
   - Gather feedback on Phase 2 improvements

3. 🎯 **Consider Phase 2 Enhancements (Future):**
   - Add trust signals (security badges, integration logos)
   - Add product screenshots/visuals
   - Add FAQ section
   - Replace placeholder testimonials with real feedback

---

### Session: Mar 19, 2026 (Earlier) — Dashboard UX Refinement & Account Management Visibility 🎨

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ **Fixed Account Management Controls Visibility**
   - **Issue:** Account badge and "Manage accounts" button were hidden because `user_accounts` table was empty
   - **Root Cause:** Plaid accounts were only used during onboarding to generate plans, but never persisted to database
   - **Solution:** Made controls always visible for users with real account data (not demo mode)
   - **Impact:** Users can now clearly see where their financial data comes from and access account management

2. ✅ **Enhanced Currency Toggle UX**
   - Replaced native browser tooltips with custom CSS tooltips
   - Dark background with white text for better visibility and contrast
   - Smooth fade-in animations
   - Positioned below buttons to avoid browser frame conflicts
   - Tooltips now visible and consistent across all browsers

3. ✅ **Improved Popover Positioning**
   - Fixed currency toggle tooltips appearing below browser frame
   - Increased tooltip z-index to z-[9999] for better stacking
   - Moved account sync indicator directly above metrics table for clearer context

4. ✅ **Added Demo Mode for Project Presentation**
   - Introduction banner explaining Prestige Worldwide's value proposition
   - Feature overview panel highlighting key capabilities
   - Demo news items to showcase news feed functionality
   - Helpful tooltips and guidance for chat interactions
   - Makes UI self-explanatory for first-time visitors and presentations

5. ✅ **Fixed Plaid Popup Z-Index Issues**
   - Plaid connection modal was appearing beneath browser frame
   - Added CSS rules to ensure Plaid overlays render at z-index 99999
   - Modal now appears above all other content including navbar

6. ✅ **Account Source Attribution**
   - Added "Your Financial Snapshot" header above metrics
   - Display synced account count with green checkmark badge
   - Prominent "Manage accounts" button with settings icon
   - Explicit text explaining data source (Plaid sync)
   - Positioned account management controls directly above numbers

7. ✅ **Documentation Updates**
   - Updated README.md with recent improvements and current production status
   - Added "Recent Improvements" section highlighting dashboard UX enhancements
   - Updated tech stack to include PostHog analytics
   - Added production status section showing what's working and planned
   - Updated environment variables to include PostHog configuration

**Technical Details:**

**PlanView.tsx Changes:**
```typescript
// BEFORE: Controls only shown when accountCount > 0
{accountCount > 0 && (
  <span>...badge...</span>
)}

// AFTER: Controls always shown for real plans
<span>
  {accountCount > 0 ? `${accountCount} accounts synced` : 'Accounts connected'}
</span>
```

**Why This Matters:**
- The conditional rendering created confusion when accounts were connected but not persisted
- Plans were generated from real Plaid data but UI showed no account info
- Users had no clear indication of data sources or how to manage accounts
- Now account management is transparent and accessible

**Files Modified:**
- `components/PlanView.tsx` - Removed conditional rendering of account controls
- `components/CurrencyToggle.tsx` - Added custom CSS tooltips
- `app/dashboard/DashboardClient.tsx` - Demo mode enhancements
- `app/globals.css` - Plaid z-index fixes
- `README.md` - Documentation updates

**Commits:**
- "Improve currency toggle tooltips with visible CSS implementation"
- "Fix Plaid popup visibility and improve dashboard for project submission"
- "Fix popover positioning and improve account indicators"
- "Make account source and management more prominent and explicit"
- "Fix account management controls not appearing"

**Current State:**
- Dashboard UX significantly improved
- Account management now clear and accessible
- Demo mode ready for presentations
- All visual bugs fixed
- Documentation up to date

**Next Steps (Resume Here Next Session):**

---

### 🎯 Next Steps (Resume Here Next Session):

**Immediate Priorities:**
1. 🎯 **Add Frontend UI for AI Proxy** (optional)
   - Create chat interface or form to use `/api/ai-proxy` endpoint
   - Display AI responses in user-friendly format
2. 🎯 **Create Pull Request** - Merge N8N integration into main
3. 🎯 **Build Workflow #3: Plan Generation** (more complex multi-step workflow)
   - Workflow: `[Webhook] → [Fetch Market Data] → [Build Prompt] → [Call OpenRouter] → [Format Response] → [Respond]`
   - This will replace the `/api/plan` endpoint's OpenRouter fallback
   - More complex than chat - involves multiple data sources and transformations

---

### Session: Mar 3, 2026 — N8N AI Proxy Integration & OpenRouter Setup 🤖

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ **Built Second N8N Workflow** - "Prestige Worldwide - Financial Plan" AI Proxy
   - **Workflow:** `Webhook → Extract Variables → Build Request Body → HTTP Request (OpenRouter) → Return Response`
   - **Production URL:** `https://jbassil.app.n8n.cloud/webhook/financial-plan`
   - **Key Learning:** How to extract nested webhook data (`body.messages`), build dynamic request payloads, and configure webhook response modes

2. ✅ **Created New Vercel API Endpoint** - `/api/ai-proxy`
   - Created `/app/api/ai-proxy/route.ts` to proxy requests to N8N
   - Added `N8N_AI_PROXY_WEBHOOK_URL` environment variable
   - Follows same pattern as existing `/api/chat` route
   - **Purpose:** Generic AI proxy that can be used for any OpenRouter model

3. ✅ **Configured OpenRouter Integration**
   - Set up OpenRouter account and API key
   - Tested various models (Claude 3.5 Haiku, Gemini Flash)
   - Configured N8N HTTP Request node with proper authentication
   - **Key Finding:** JSON parsing errors resolved by using `JSON.stringify()` in request body

4. ✅ **Debugged Full Integration End-to-End**
   - **Issue 1:** N8N webhook not registered (404) → Solution: Activate workflow via "Publish" button
   - **Issue 2:** Missing message content → Solution: Extract from `body.messages` not `messages`
   - **Issue 3:** Webhook responding immediately → Solution: Set response mode to "When Last Node Finishes"
   - **Issue 4:** JSON parsing failed → Solution: Use proper body format in HTTP Request node

5. ✅ **Deployed and Verified Production**
   - Environment variable added to Vercel
   - Code committed and pushed to GitHub
   - Vercel auto-deployed
   - **Tested successfully:** Full flow from Vercel → N8N → OpenRouter → Response working! ✅

**Technical Details:**

**N8N Workflow Structure:**
```
Node 1: Webhook (POST /webhook/financial-plan)
  ↓ Receives: { messages: [...], model: "...", max_tokens: 150 }

Node 2: Code - Extract Variables
  ↓ Extracts: body.messages, body.model, body.max_tokens
  ↓ Returns: { messages, model, max_tokens }

Node 3: Code - Build Request Body
  ↓ Builds: { requestBody: { model, max_tokens, messages } }

Node 4: HTTP Request - Call OpenRouter
  ↓ POST https://openrouter.ai/api/v1/chat/completions
  ↓ Returns: OpenRouter response with AI completion

Webhook Response: Returns Node 4 output to caller
```

**API Endpoint Flow:**
```
Client → POST /api/ai-proxy → Vercel Next.js
  ↓
Vercel → POST N8N_AI_PROXY_WEBHOOK_URL → N8N Cloud
  ↓
N8N → POST https://openrouter.ai → OpenRouter API
  ↓
OpenRouter → Claude 3.5 Haiku generates response
  ↓
Response flows back: OpenRouter → N8N → Vercel → Client
```

**Learning Outcomes:**

**N8N Advanced Skills:**
- ✅ Extracting nested webhook data from request body
- ✅ Building dynamic request payloads with Code nodes
- ✅ Configuring webhook response modes ("When Last Node Finishes" vs "Immediately")
- ✅ Debugging data flow through multiple nodes
- ✅ Using expressions to access node outputs
- ✅ Handling JSON parsing in HTTP Request nodes

**OpenRouter Skills:**
- ✅ Creating and managing API keys
- ✅ Understanding request/response format for chat completions
- ✅ Configuring authentication headers (Bearer tokens)
- ✅ Model selection and configuration (max_tokens, etc.)
- ✅ Cost tracking and usage monitoring

**Deployment Skills:**
- ✅ Managing environment variables across Vercel and N8N
- ✅ Testing API endpoints with curl
- ✅ Reading and debugging Vercel deployment logs
- ✅ Understanding DNS/network restrictions in dev environments

**Key Insights:**
- N8N webhooks have two response modes: immediate vs. waiting for workflow completion
- Webhook data is nested under `body` when accessed in N8N Code nodes
- OpenRouter requires proper JSON structure in messages array (both `role` and `content`)
- Local dev environments may have network restrictions preventing external API calls
- Vercel deployments can successfully reach both N8N Cloud and OpenRouter

**Files Changed:**
- Created: `/app/api/ai-proxy/route.ts`
- Modified: `.env.example` (added `N8N_AI_PROXY_WEBHOOK_URL`)

**Commits:**
- "Add AI proxy API route for N8N OpenRouter integration"

**Next Session Resume Point:**
- API proxy is working end-to-end ✅
- Ready to add frontend UI if desired
- Can proceed with more complex workflows (Plan Generation)

---

### Session: Mar 1, 2026 — Feature Planning: Visual Theming & Geographic AI Advisors 🎨👔

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ **Added Visual Theming System to Roadmap** - "Dream Lifestyle Modes"
   - Three aspirational themes: Swiss Alps Retreat, Gaudy Miami, Clooney's Positano
   - Users choose theme that transforms entire app visual presentation
   - Involves: Tailwind theme extension, React Context, Supabase user preferences
   - **Learning focus:** Advanced Tailwind theming, design systems, UX psychology
   - **Note added:** Check Vibe Coding class docs for design inspiration sites

2. ✅ **Added Geographic AI Advisors to Roadmap** - "Your Global Financial Team"
   - Country-specific AI advisors (Gordon for Canada, Brad for USA, etc.)
   - Each advisor has local expertise in tax laws, regulations, market knowledge
   - Chat modes: 1-on-1 with single advisor OR group chat with all advisors
   - Auto-detected from Plaid account connections
   - Involves: Multi-agent AI, N8N parallel workflows, prompt engineering
   - **Learning focus:** Multi-agent systems, advanced N8N, internationalization

3. ✅ **Documented Feature Integration**
   - Themes = Aspirational (WHERE you want to be)
   - Advisors = Practical (HOW to get there)
   - Advisors adapt visual identity to user's chosen theme
   - Both features prioritized high (after Workflow #2, before testing)

**Key Insight:**
These two features work together to create **emotionally engaging financial planning**:
- Visual themes provide aesthetic immersion in dream lifestyle
- Geographic advisors provide localized, actionable expertise
- Together they differentiate the product from generic fintech apps

**Commits:**
- "Add Visual Theming System to roadmap: Dream Lifestyle Modes"
- "Add Geographic AI Advisors to roadmap: Global Financial Team"

---

### Session: Feb 28, 2026 — N8N Workflow Integration Complete! 🎉

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ **Built First Production N8N Workflow** - "Prestige Worldwide - AI Chat"
   - **Workflow:** `Webhook → Code Node → HTTP Request (OpenRouter) → Respond to Webhook`
   - **Model:** Claude 3.5 Haiku (anthropic/claude-3.5-haiku)
   - **Production URL:** `https://jbassil.app.n8n.cloud/webhook/ai-chat`
2. ✅ **Integrated N8N with Next.js Production App**
   - Added `N8N_CHAT_WEBHOOK_URL` environment variable to Vercel
   - Next.js `/api/chat` now calls N8N webhook first, falls back to OpenRouter if needed
3. ✅ **Fixed Frontend Response Parsing**
   - Updated `components/ChatPanel.tsx` to correctly parse OpenRouter response format
   - Changed from `data.content` to `data.choices?.[0]?.message?.content`
4. ✅ **Debugged Full Integration**
   - Troubleshot API key authentication (Bearer token format)
   - Fixed N8N HTTP Request node body configuration (switched to "Using JSON" mode)
   - Traced data flow through all nodes to verify correct response handling
5. ✅ **Deployed and Verified**
   - Committed code changes
   - Pushed to GitHub (`claude/start-planning-gWIXp`)
   - Vercel auto-deployed
   - **Chat is working end-to-end in production!** ✅

**Learning Outcomes:**

**N8N Skills Learned:**
- ✅ Creating webhook triggers (receiving POST requests from external apps)
- ✅ Using Code nodes for data transformation (JavaScript in workflows)
- ✅ Making HTTP API calls to external services (OpenRouter)
- ✅ Configuring authentication (Header Auth with Bearer tokens)
- ✅ Responding to webhooks (sending data back to caller)
- ✅ Debugging workflow executions (reading node inputs/outputs, checking logs)
- ✅ Publishing workflows (Test URL → Production URL transition)

**OpenRouter Skills Learned:**
- ✅ Browsing and comparing AI models (speed, cost, capabilities)
- ✅ Understanding cost/performance tradeoffs (free vs. cheap vs. expensive models)
- ✅ Selecting appropriate model for use case (Claude 3.5 Haiku for fast, cheap chat)
- ✅ Understanding API authentication (Bearer token format)
- ✅ Parsing API response format (`choices[0].message.content` structure)
- ✅ Monitoring usage and costs (tracked in OpenRouter dashboard)

**Full-Stack Integration Skills:**
- ✅ Connecting Next.js with external webhooks
- ✅ Managing environment variables in Vercel (and understanding deployment requirements)
- ✅ Debugging API integrations (Browser DevTools Network tab, N8N execution logs, Vercel function logs)
- ✅ Fixing frontend/backend data format mismatches
- ✅ Understanding deployment propagation (environment variables, code changes)

**Technical Details:**

**N8N Workflow Structure:**
```
1. Webhook Trigger (POST /webhook/ai-chat)
   ↓ Receives: { messages: [{role, content}] }

2. Code in JavaScript
   ↓ Formats data for OpenRouter API
   ↓ Output: { model: "anthropic/claude-3.5-haiku", messages: [...] }

3. HTTP Request
   ↓ POST to https://openrouter.ai/api/v1/chat/completions
   ↓ Auth: Bearer token in Authorization header
   ↓ Body: { model, messages } (Using JSON mode)

4. Respond to Webhook
   ↓ Returns OpenRouter response to Next.js
   ↓ Response: { choices: [{ message: { content: "..." } }] }
```

**Cost Analysis:**
- **Claude 3.5 Haiku:** $0.25/1M input tokens, $1.25/1M output tokens
- **Practical cost:** ~$0.001 per 100 chat messages
- **Monthly estimate (1000 messages):** ~$0.10
- Incredibly cost-effective for production use!

**Files Modified:**
- `components/ChatPanel.tsx` - Fixed response parsing (line 89)
- `.env.local` - Added N8N webhook URL (local only, not committed)
- Vercel environment variables - Added `N8N_CHAT_WEBHOOK_URL` (production)

**Bugs Fixed:**
- Frontend was looking for `data.content` but OpenRouter returns `data.choices[0].message.content`
- HTTP Request node body needed "Using JSON" mode instead of "Using Fields Below"
- API key needed "Bearer " prefix in Header Auth credential

**Current State:**
- ✅ N8N workflow published and active (24/7 production)
- ✅ Chat working end-to-end in production app
- ✅ Full integration verified and tested
- ✅ Code committed and pushed
- 📝 PR prepared and ready to create

**Next Steps (Resume Here Next Session):**

**Immediate Priorities:**
1. 🎯 **Create Pull Request** - Merge N8N integration into main
2. 🎯 **Build Workflow #2: Plan Generation** (more complex multi-step workflow)
   - Workflow: `[Webhook] → [Fetch Market Data] → [Build Prompt] → [Call OpenRouter] → [Format Response] → [Respond]`
   - This will replace the `/api/plan` endpoint's OpenRouter fallback
   - More complex than chat - involves multiple data sources and transformations

**Future Enhancements:**
3. [ ] **🎨 Visual Theming System: "Dream Lifestyle Modes"**
   - Users choose aspirational lifestyle theme that transforms entire app UI
   - Three themes: **Swiss Alps Retreat**, **Gaudy Miami**, **Clooney's Positano**
   - Involves: Tailwind theme extension, React Context, Supabase user preferences table
   - **Learning:** Advanced Tailwind theming, CSS variables, design systems, UX psychology
   - **Note:** Check Vibe Coding class documentation for design inspiration resources
   - **Priority:** High (differentiating feature, pure frontend work, doesn't block AI learning)
4. [ ] **👔 Geographic AI Advisors: "Your Global Financial Team"**
   - Country-specific AI advisors for each region where user has assets
   - Example: "Gordon" (Canada), "Brad" (USA), "Nigel" (UK), etc.
   - Each advisor has local expertise (tax laws, regulations, market knowledge)
   - **Chat modes:** 1-on-1 with single advisor OR group chat with all advisors
   - Involves: Multi-agent AI, N8N parallel workflows, advisor detection from Plaid
   - **Learning:** Multi-agent systems, prompt engineering, i18n, advanced N8N workflows
   - **Priority:** High (differentiating feature, enhances chat experience, teaches advanced AI)
   - **Pairs with:** Visual Theming (advisors adapt to user's chosen theme)
5. [ ] Set up automated testing with Vitest/Jest
6. [ ] Write unit tests for N8N webhook integration
7. [ ] Add error handling and retry logic in N8N workflows
7. [ ] Monitor usage and costs in OpenRouter dashboard
8. [ ] Experiment with other AI models (compare quality/speed/cost)
9. [ ] Add streaming support to N8N workflow (for real-time responses)
10. [ ] Fix Bug #2: News API empty array issue

**Architecture Achieved:**
```
User → Next.js /api/chat → N8N Webhook → OpenRouter → Claude 3.5 Haiku → Response ✅
              ↓ (fallback if N8N fails)
        OpenRouter Direct (safety net)
```

**Benefits of N8N Integration:**
- ✅ Centralized AI orchestration (all AI logic visible in N8N dashboard)
- ✅ Easy to modify workflows without code changes
- ✅ Visual debugging (see data flow through each node)
- ✅ Can add multi-step logic (call multiple APIs, aggregate data, etc.)
- ✅ Fallback still works if N8N is unavailable

---

### Session: Feb 27, 2026 (Evening) — N8N Workflow Planning & Documentation

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ Consolidated session notes into single canonical `SESSION_NOTES.md`
   - Merged valuable content from `.claude/SESSION_NOTES.md` (Core Mission, Learning Resources)
   - Removed duplicate `.claude/SESSION_NOTES.md` to eliminate confusion
2. ✅ Enhanced Project Overview with Core Mission statement
   - Added focus on democratizing wealth management through AI
   - Clarified target users and key features
3. ✅ Expanded Learning Objectives with detailed skill breakdowns
   - **Supabase:** Database design, RLS, auth, real-time, edge functions
   - **N8N:** Visual workflows, webhooks, HTTP requests, data transformation, error handling, testing
   - **OpenRouter:** Model comparison, selection, prompt engineering, streaming, cost tracking, fallbacks
4. ✅ Added Development Workflow section with PR creation guidelines
5. ✅ Added Learning Resources section with documentation links
6. ✅ Updated session notes instruction to read both Project Overview and Recent Sessions at startup
7. ✅ Set up N8N account and workspace (user completed)
8. ✅ Planned first N8N workflow: AI Chat integration

**Documentation Updates:**
- `SESSION_NOTES.md` now serves as single source of truth for project context
- All learning objectives clearly documented with measurable outcomes
- PR workflow documented for future reference

**N8N Planning:**
- Decided to build production-ready workflows (not toy examples)
- First workflow: **AI Chat** (replaces OpenRouter fallback in Next.js)
- Learned key N8N concepts:
  - Nodes = functions/operations (NOT agents)
  - Workflows = connected nodes that process data
  - Trigger nodes → Action nodes → Response nodes

**Current State:**
- Ready to build first N8N workflow tomorrow
- User has N8N account set up and ready
- Clear understanding of what will be built and why

**Next Steps (Resume Here Tomorrow):**
1. 🎯 **BUILD AI Chat Workflow in N8N:**
   - Workflow: `[Webhook] → [HTTP Request to OpenRouter] → [Transform Response] → [Respond to Webhook]`
   - This will replace the OpenRouter fallback in `app/api/chat/route.ts`
   - User will learn: Webhooks, HTTP calls, API credentials, data transformation, testing
2. Test the workflow in N8N dashboard
3. Update Next.js `app/api/chat/route.ts` to call N8N webhook instead of OpenRouter directly
4. Test end-to-end in production app
5. Build Workflow 2: Plan Generation (more complex, same pattern)

**Ready to Build Tomorrow:**
- Open N8N dashboard
- Create new workflow called "Prestige Worldwide - AI Chat"
- Follow step-by-step guidance to build each node
- Test and integrate with Next.js app

---

### Session: Feb 27, 2026 — Manual Testing & Bug Documentation

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ Created `docs/MANUAL_TEST_CHECKLIST.md` - comprehensive testing checklist
2. ✅ Performed manual testing of production app on Vercel:
   - Sign-in process: Working ✅
   - Middleware protection: Working ✅
   - Chat panel: Working ✅ (SSE streaming confirmed)
   - News panel: Bug found ⚠️
3. ✅ Created `docs/BACKLOG.md` for tracking non-critical issues
4. ✅ Documented bugs found during testing:
   - **Bug #1:** Sign-up redirect provides no user feedback (Low priority)
   - **Bug #2:** News API returns empty array instead of stub news when `OPENROUTER_API_KEY` not configured (Medium priority)

**Testing Status:**
- Sign-up flow: Skipped (requires deleting user in Supabase, too cumbersome)
- Sign-in: ✅ Tested, working
- Middleware: ✅ Tested, working
- Dashboard features: ✅ Partially tested
- Chat: ✅ Tested, SSE streaming confirmed
- News: ⚠️ Bug found and documented

**Current State:**
- Next.js update manual testing considered complete
- Bugs documented in BACKLOG.md for later fixes
- All changes committed and pushed to `claude/start-planning-gWIXp`

**Next Steps:**
- [ ] Set up Vitest/Jest testing infrastructure
- [ ] Create unit tests for AlphaVantage integration
- [ ] Create API route integration tests
- [ ] Add test scripts to package.json

---

### Session: Feb 20-25, 2026 — AlphaVantage Market Data Integration

**Branch:** `claude/start-planning-gWIXp`

**What Was Accomplished:**
1. ✅ Set up **AlphaVantage API** integration for real-time market data
2. ✅ Created Supabase `market_data` table with schema:
   - S&P 500 (SPY ETF) close price & YTD return
   - 10-Year Treasury yield
   - MSCI World (VT ETF) close price & YTD return
   - Inflation rate
   - Daily snapshots with date-based uniqueness
3. ✅ Created `scripts/fetch-market-data.ts` - fetches live data from Alpha Vantage
4. ✅ Created `scripts/seed-market-data.ts` - seeds 30 days of sample data for development
5. ✅ Added NPM scripts:
   - `npm run fetch-market-data` - fetch live data (respects API rate limits)
   - `npm run seed-market-data` - generate sample data
6. ✅ Configured `ALPHA_VANTAGE_API_KEY` in `.env.local`
7. ✅ Created comprehensive documentation: `docs/MARKET_DATA_SETUP.md`

**Technical Details:**
- API: Alpha Vantage (Free tier: 25 calls/day, 5 calls/minute)
- Script handles rate limiting with 12-second delays
- Graceful fallbacks for API failures
- Upsert logic prevents duplicate entries

**Files Created:**
- `scripts/fetch-market-data.ts`
- `scripts/seed-market-data.ts`
- `docs/MARKET_DATA_SETUP.md`

**Database:**
- Table: `market_data`
- RLS: Enabled (read-only for authenticated users)

**Next Steps:**
- [ ] Write unit tests for market data fetcher functions
- [ ] Set up automated daily fetching (GitHub Actions or cron)
- [ ] Integrate market data into AI financial planning prompts

---

## 📋 Archive: Older Sessions
*Sessions from before Feb 20, 2026*

---

## Project Overview

### 🎯 Core Mission

**Democratizing sophisticated wealth management through AI-powered investment advisory**

Making institutional-grade investment strategies accessible to everyday investors through:
- Personalized multi-asset portfolio recommendations
- Real-time market data integration
- AI-powered risk assessment and rebalancing
- Educational approach to financial literacy

**Target Users:** People with cross-border financial lives — expats, dual citizens, cross-border workers, international retirees.

**Key Features:** Connect bank accounts across multiple countries, receive a personalised AI financial plan, and get daily AI-powered insights and news.

**Repo:** `jbassil-png/prestige-worldwide`
**Primary dev branch:** `claude/start-planning-gWIXp`
**Production branch:** `main`
**Deployment:** Vercel (auto-deploys on push to `main`)

### 🎓 Learning-First Development Approach

**This project emphasizes learning by doing with hands-on guidance.** The development process is designed to build sustainable knowledge, not just working code.

**Primary Learning Objectives:**

1. **Supabase (Backend-as-a-Service)**
   - PostgreSQL database design and schema modeling
   - Row Level Security (RLS) policies for multi-tenant data
   - Authentication flows and session management
   - Real-time subscriptions and presence features
   - Edge Functions for serverless backend logic

2. **N8N (Workflow Automation)**
   - How to design workflows visually (nodes, connections, data flow)
   - How to handle webhooks (receiving data from Next.js)
   - How to make HTTP requests (calling external APIs)
   - How to transform data between steps (functions, expressions)
   - How to handle errors and retries
   - How to test and debug workflows

3. **OpenRouter (Model Marketplace)**
   - How different models compare (speed, cost, capabilities)
   - How to choose the right model for each use case
   - How to structure prompts for different models
   - How to handle streaming vs. non-streaming responses
   - How to track costs and usage
   - How to fallback between models

**Teaching Methodology:**
- **Explain the concept** (what and why)
- **Show an example** (how it works)
- **User does it** (hands-on practice)
- **Review together** (understanding check)

**Why This Matters:**
- Owner wants sustainable knowledge, not just working code
- Learning these tools enables independent feature development
- Understanding architecture enables better decision-making
- Hands-on experience builds confidence and ownership

⚠️ **For future sessions:** Always check if user wants to learn something hands-on vs. having it built for them. Default to teaching mode when introducing new tools/concepts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom `brand` colour scale) |
| Auth & Database | Supabase |
| Bank Connectivity | Plaid |
| AI Orchestration | n8n webhooks (optional — OpenRouter is the fallback) |
| LLM Provider | OpenRouter (Claude, Gemini Flash, Perplexity Sonar Pro) |
| Email | Resend |
| FX Rates | exchangerate-api.com |

---

## App Structure

```
app/
├── page.tsx                     # Public marketing landing page
├── (auth)/                      # Sign-in and sign-up pages
├── onboarding/                  # 3-step onboarding wizard
│   └── steps/
│       ├── StepCountries.tsx    # Country + account type selection
│       ├── StepConnect.tsx      # Plaid link or manual balance entry
│       └── StepGoals.tsx        # Age, goals, and notes
├── dashboard/                   # Authenticated dashboard (plan, chat, news)
└── api/
    ├── plan/                    # Generate financial plan (n8n → OpenRouter → stub)
    ├── chat/                    # Streaming AI chat (n8n → OpenRouter → stub)
    ├── insight/                 # Daily spotlight insight (OpenRouter)
    ├── news/                    # Personalised news feed (OpenRouter/Perplexity)
    ├── fx/                      # Live exchange rates (exchangerate-api.com)
    └── plaid/                   # Plaid Link token + token exchange
components/                      # Shared UI components
lib/supabase/                    # Supabase client helpers (browser + server)
middleware.ts                    # Auth guard for /dashboard and /onboarding
```

---

## Supabase Tables Required

Four tables must exist in the Supabase project:

**`user_plans`**
```sql
create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan jsonb not null,
  created_at timestamptz default now()
);
```

**`user_news`**
```sql
create table user_news (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  items jsonb not null,
  fetched_at timestamptz default now()
);
```

**`plaid_items`**
```sql
create table plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  access_token text not null,
  institution text
);
```

**`market_data`** *(Added Feb 2026)*
```sql
create table market_data (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  sp500_close decimal(10,2),
  sp500_ytd_return decimal(5,2),
  bond_yield_10y decimal(4,2),
  inflation_rate decimal(4,2),
  msci_world_close decimal(10,2),
  msci_world_ytd_return decimal(5,2),
  fetched_at timestamptz default now()
);
```

---

## AI Services

| Feature | Service | Model |
|---|---|---|
| Financial plan | n8n → OpenRouter → stub | configurable |
| Chat | n8n → OpenRouter → stub | `anthropic/claude-3.5-haiku` |
| Daily insight | OpenRouter | `gemini-flash-1.5` |
| News feed | OpenRouter | `perplexity/sonar-pro` |

All AI endpoints degrade gracefully if API keys are missing — stub/mock responses are returned.

---

## Environment Variables

All of the following have been configured in **Vercel** (Production environment):

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API | Secret |
| `RESEND_API_KEY` | resend.com → API Keys | Also configured in Supabase SMTP settings |
| `PLAID_CLIENT_ID` | dashboard.plaid.com → Team Settings → Keys | |
| `PLAID_SECRET` | dashboard.plaid.com → Team Settings → Keys | Sandbox secret |
| `PLAID_ENV` | — | Set to `sandbox` |
| `OPENROUTER_API_KEY` | openrouter.ai → Keys | Key named "prestige-worldwide" |
| `OPENROUTER_MODEL` | — | Defaults to `anthropic/claude-3.5-haiku` (not explicitly set) |
| `FX_API_KEY` | exchangerate-api.com | Free tier, 1,500 req/month |
| `ALPHA_VANTAGE_API_KEY` | alphavantage.co | Key: `SW2REBLWPLDHLVN5` (Free tier: 25 calls/day) |

**N8N:** Deliberately skipped. `N8N_WEBHOOK_URL` and `N8N_CHAT_WEBHOOK_URL` are not set. Both `/api/plan` and `/api/chat` fall back to OpenRouter automatically when these are absent.

**Plaid tier:** Hobbyist (free). Using `sandbox` mode — no real bank connections yet. Can be upgraded to `development` (100 real connections free) or `production` when ready.

---

## Git & Deployment History

Work has been done across multiple PRs, all merged from `claude/start-planning-gWIXp` into `main`:

| PR | Key Changes |
|---|---|
| #2 | GitHub Pages deployment via Actions |
| #3 | Fix asset paths for GitHub Pages subdirectory |
| #4 | Add auth, onboarding wizard, dashboard, AI chat; Supabase/Plaid deps |
| #5 | Comprehensive README |
| #6 | Fix auth flow (callback route, middleware cookies, sign-up confirmation, OTP redirects) |
| #7 | Fix build errors (plan non-null assertion, Suspense boundary) |
| #8 | Replace GitHub Pages deploy with CI build check; fix CI env vars |
| #9 | Add Resend email integration; fix Vercel deployment (upgrade Next.js, defer Supabase client init) |

**Latest commit on `main`:** `1715ad8` — Merge pull request #9

---

## Development Workflow

### **Branch Strategy:**
- Main development happens on `claude/start-planning-*` branches
- Commit frequently with descriptive messages
- Push when work is complete or at logical checkpoints

### **Pull Request Workflow:**
**⚠️ ALWAYS create a PR with title and description when ready to push**

When work is complete and pushed:
1. **Review commits** included in the PR (`git log origin/main..HEAD`)
2. **Generate PR title** - Clear, concise summary (< 70 characters)
3. **Write PR description** with:
   - Summary (bullet points of key changes)
   - Detailed sections (Security, Documentation, Features, etc.)
   - Learning objectives if applicable
   - Next steps
   - Test plan checklist
   - Session link
4. **Create the PR** using `gh pr create` with formatted title and body

This ensures every PR has proper documentation and context.

---

## Current Status (Updated: Feb 27, 2026)

- **App is live on Vercel** — Production deployment working
- **Manual testing completed** — Core flows verified (sign-in, middleware, chat, dashboard)
- **AlphaVantage integration complete** — Market data fetcher scripts ready
- **Bugs documented** — 2 non-critical issues tracked in `docs/BACKLOG.md`
- **Testing infrastructure** — Vitest/Jest setup pending (next priority)

### What Works ✅
- Authentication (sign-in)
- Middleware protection (auth redirects)
- Chat panel (SSE streaming)
- Dashboard rendering
- Market data scripts (fetch & seed)

### Known Issues ⚠️
- News API returns empty array (should show stub news)
- Sign-up redirect has no user feedback
- See `docs/BACKLOG.md` for details

---

## Next Session: Testing Infrastructure

**Priority:** Set up automated testing with Vitest/Jest

### Tasks:
1. [ ] Install and configure Vitest
2. [ ] Create test structure (`__tests__` or `.test.ts` files)
3. [ ] Write unit tests for AlphaVantage fetcher:
   - `fetchQuote()` function
   - `fetchTreasuryYield()` function
   - Error handling and rate limit logic
4. [ ] Write integration tests for API routes
5. [ ] Add test scripts to `package.json`:
   - `npm test` — run all tests
   - `npm run test:watch` — watch mode
   - `npm run test:coverage` — coverage report
6. [ ] Document test setup in README or docs

### Reference:
- Market data scripts: `scripts/fetch-market-data.ts`, `scripts/seed-market-data.ts`
- API routes to test: `/api/plan`, `/api/chat`, `/api/news`, `/api/fx`

---

## Known Issues / Things to Watch

- **Plaid is sandbox only** — real bank connections require switching to `development` or `production` and applying for Plaid production access.
- **N8N not configured** — plan generation and chat use OpenRouter fallback. If more sophisticated AI orchestration is needed later, n8n can be added.
- **No RLS (Row Level Security)** on Supabase tables — this should be addressed before any real user data is stored.
- **OpenRouter model for plan/chat** — currently defaults to `claude-3.5-haiku`. Can be changed via `OPENROUTER_MODEL` env var.

---

## 🎨 Planned Feature: Visual Theming System

### **Concept: "Dream Lifestyle Modes"**

An aspirational theming system where users choose a lifestyle theme that transforms the entire app's visual presentation. The goal is to make financial planning emotionally engaging — every login transports them to their dream financial future.

### **Three Launch Themes:**

**1. Swiss Alps Retreat** ❄️
- **Vibe:** Minimalist luxury, serene, clean, timeless
- **Colors:** Crisp white, slate gray, ice blue, warm wood tones
- **Typography:** Clean sans-serif with generous whitespace
- **Inspiration:** Scandinavian minimalism, alpine chalets, hygge

**2. Gaudy Miami** 🌴
- **Vibe:** Bold, energetic, Art Deco glamour, unapologetically flashy
- **Colors:** Hot pink, turquoise, coral, gold, neon accents
- **Typography:** Geometric Art Deco fonts, high contrast
- **Inspiration:** South Beach, 1980s Miami Vice, Art Deco architecture

**3. Clooney's Positano** 🇮🇹
- **Vibe:** Effortless elegance, Mediterranean warmth, understated luxury
- **Colors:** Terracotta, ocean blue, lemon yellow, olive green, warm beige
- **Typography:** Elegant serif with Italian flair
- **Inspiration:** Amalfi Coast, Italian Riviera, dolce vita

### **Technical Implementation:**

**Database Schema:**
```sql
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique not null,
  theme text default 'swiss-alps' check (theme in ('swiss-alps', 'gaudy-miami', 'clooney-positano')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Key Components:**
- Theme configuration files (Tailwind CSS custom theme extension)
- Theme selector UI component (user settings or onboarding)
- React Context for theme state management
- Supabase integration for theme persistence
- CSS variables for dynamic theme switching

### **Learning Opportunities:**
- Advanced Tailwind CSS theming and CSS custom properties
- React Context and global state management
- Supabase user preferences and data persistence
- Design systems thinking and cohesive visual languages
- UX psychology and aspirational design principles

### **Design Resources:**
**Reminder:** Check Vibe Coding class documentation for additional design inspiration sites.

**General Design Inspiration:**
- Awwwards.com (best web designs)
- Behance (design case studies)
- Dribbble (UI/UX components)
- SiteInspire (curated galleries)
- Coolors.co (color palettes)
- Luxury hotel websites (theme-specific inspiration)

### **Recommended Timeline:**
Build this after completing Workflow #2 (Plan Generation). It's a differentiating feature that's pure frontend work and won't block AI/backend learning objectives.

---

## 👔 Planned Feature: Geographic AI Advisors

### **Concept: "Your Global Financial Team"**

Country-specific AI advisors that provide localized financial expertise. Users get a personal advisor for each country where they hold assets, with the ability to consult advisors individually or in group chats.

**Core Insight:** Financial advice is highly regional. Tax laws, investment vehicles, and market conditions vary dramatically by country. Generic advice doesn't work — users need LOCAL expertise.

### **Example Advisor Roster:**

| Country | Advisor | Personality | Expertise |
|---------|---------|-------------|-----------|
| 🇺🇸 USA | **Brad** | Confident, direct, optimistic | 401k, Roth IRA, S&P 500, US tax code |
| 🇨🇦 Canada | **Gordon** | Polite, detail-oriented, thorough | TFSA, RRSP, Canadian dividends, TSX |
| 🇬🇧 UK | **Nigel** | Witty, sophisticated, reserved | ISA, pensions, FTSE 100, UK property |
| 🇦🇺 Australia | **Shane** | Laid-back, straightforward | Superannuation, ASX, property market |
| 🇩🇪 Germany | **Klaus** | Precise, methodical, conservative | German tax system, DAX, EU markets |
| 🇯🇵 Japan | **Kenji** | Respectful, patient, analytical | NISA, Japanese bonds, Nikkei 225 |

**Expandable:** As user connects accounts in new countries, new advisors are automatically introduced.

### **Chat Modes:**

**1. One-on-One Chat**
- User selects a specific advisor (e.g., "Talk to Gordon")
- Advisor provides country-specific advice
- Context limited to that country's assets and regulations

**2. Group Chat (Multi-Advisor Consultation)**
- User asks a question to all advisors simultaneously
- Each advisor responds from their expertise area
- Advisors can reference each other's advice
- Example:
  ```
  User: "Should I max out my retirement accounts?"

  Brad: "Absolutely! Max your Roth IRA first ($7,000/year).
         Tax-free growth is unbeatable."

  Gordon: "I agree with Brad on the Roth IRA. On the Canadian side,
          prioritize TFSA ($7,000) over RRSP if you expect higher
          income later in your career."
  ```

### **Technical Implementation:**

**Database Schema:**
```sql
-- Track which countries user has assets in
create table user_countries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  country_code text not null, -- 'US', 'CA', 'GB', etc.
  detected_from text, -- 'plaid_account', 'manual_entry'
  created_at timestamptz default now(),
  unique(user_id, country_code)
);

-- Advisor configurations (could be hardcoded or DB-driven)
create table advisors (
  id uuid primary key default gen_random_uuid(),
  country_code text unique not null,
  name text not null, -- 'Brad', 'Gordon', etc.
  personality text, -- Description for system prompt
  avatar_url text,
  specialties jsonb, -- ['401k', 'Roth IRA', 'US taxes']
  system_prompt text -- Full prompt template
);

-- Track advisor assignments per chat session
alter table chat_messages add column advisor_id uuid references advisors;
```

**Advisor Detection:**
- When user connects Plaid account, detect country from institution location
- Automatically add to `user_countries` table
- Show "Meet your new advisor!" notification
- Advisor appears in advisor selector UI

**N8N Workflow: Multi-Advisor Chat**
```
[Webhook]
  ↓
[Identify Active Advisors] (based on selected chat mode)
  ↓
[Branch: Single vs Group?]
  ↓
Single → [Call OpenRouter with advisor-specific system prompt]
  ↓
Group → [Parallel OpenRouter calls, one per advisor]
  ↓
[Merge & Format Responses]
  ↓
[Respond to Client]
```

**Advisor System Prompts:**
Each advisor has a specialized system prompt with:
- Personality traits and communication style
- Country-specific financial knowledge (tax codes, account types, markets)
- Regulatory awareness (SEC, CRA, FCA, etc.)
- Cultural financial norms (e.g., Canadians prefer TFSAs over taxable accounts)

### **User Experience Features:**

**Advisor Introductions:**
When user first connects an account in a new country:
```
🎉 New country detected!

You now have assets in Canada. Meet Gordon, your Canadian financial advisor.

[Gordon's Avatar]

"Hello! I'm Gordon, and I'll be helping you with your Canadian investments.
I noticed you have a TD account - let's optimize it together!"

[Chat with Gordon] [Maybe Later]
```

**Cross-Border Insights:**
Advisors can collaborate on recommendations:
```
💡 Cross-Border Insight from Gordon & Brad

Gordon noticed your Canadian TFSA is heavily weighted in US equities.
Brad suggests rebalancing to reduce overexposure. Want a group consultation?

[Talk to Both] [Dismiss]
```

**Advisor Visual Identity:**
- Each advisor has unique avatar/profile picture
- Color scheme subtly reflects country (e.g., Brad has red/white/blue accents)
- Speech patterns and vocabulary differ (Brad: "401k", Gordon: "RRSP")
- Adapts to user's chosen visual theme (Swiss Alps, Miami, Positano)

### **Learning Opportunities:**

1. **Multi-Agent AI Systems**
   - Orchestrating multiple AI personalities
   - Managing context across agents
   - Combining parallel LLM responses

2. **Advanced Prompt Engineering**
   - Creating distinct AI personalities
   - Country-specific knowledge injection
   - System prompts for specialized expertise

3. **Internationalization (i18n)**
   - Multi-country financial data handling
   - Regional terminology and regulations
   - Currency conversion contexts

4. **Advanced N8N Workflows**
   - Parallel API calls and response merging
   - Conditional branching based on user state
   - Dynamic prompt generation

5. **UX for Conversational AI**
   - Multi-agent chat interface design
   - Managing user expectations across advisors
   - Making AI feel human and trustworthy

### **How It Pairs with Visual Theming:**

**Themes** = Aspirational (WHERE you want to be)
**Advisors** = Practical (HOW to get there)

Examples:
- **Swiss Alps theme** → Advisors wear cozy sweaters, use calm language
- **Gaudy Miami theme** → Advisors in colorful attire, more energetic tone
- **Positano theme** → Advisors in linen shirts, relaxed Mediterranean vibe

Visual theming affects the *aesthetic*, advisors provide the *expertise*.

### **Recommended Timeline:**
Build this after Visual Theming System. It leverages existing chat infrastructure and N8N workflows but adds multi-agent complexity.

---

## 🎓 Learning Resources

### **Supabase:**
- Official docs: https://supabase.com/docs
- Key concepts: PostgreSQL, Row Level Security (RLS), Auth, Realtime, Edge Functions
- Will learn: Database design, security policies, authentication flows, real-time subscriptions

### **N8N:**
- Official docs: https://docs.n8n.io/
- Key concepts: Nodes, connections, expressions, webhooks
- Will learn: Visual workflow building, API orchestration, data transformation

### **OpenRouter:**
- Official docs: https://openrouter.ai/docs
- Key concepts: Model selection, pricing, streaming, fallbacks
- Will learn: Choosing models per use case, cost optimization, prompt engineering

### **Testing (Future):**
- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
