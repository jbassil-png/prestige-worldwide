# MVP Launch Checklist - Prestige Worldwide

**Created:** 2026-03-19
**Purpose:** Pre-submission readiness checklist based on Vibe Coding MVP principles
**Target:** Ensure production-ready MVP before launch

---

## 📚 Background: Vibe Coding MVP Principles

This checklist is based on the following key principles:

**What to Keep in MVP:**
- Core value proposition feature ✅
- Basic authentication / user accounts ✅
- Essential error handling ⚠️ (verify)
- One clean, intuitive workflow ✅
- Basic responsive layout ✅
- Analytics / event tracking ⚠️ (add)

**Dangerous Technical Debt (Must Fix):**
- No error handling — crashes lose users
- No data backups — one bug = data loss
- Security shortcuts — auth, API keys, input validation

**MVP Launch Checklist Essentials:**
- Core feature works end-to-end without crashing
- Basic auth protects user data
- Error states show helpful messages (not blank screens)
- Analytics/tracking captures key user actions
- Feedback channel set up
- 5+ people ready to try it on day one
- Custom domain (or at least clean URL)
- Tested on mobile (most users are on phones)

---

## 🔴 CRITICAL: Security & Error Handling (Must Complete Before Launch)

### 1. Security Audit: API Keys
**Priority:** CRITICAL
**Time Estimate:** 15 minutes
**Reference:** Slide 6 - "Keep API keys on the server, never in client code"

- [ ] Review all client-side code (`app/`, `components/`) for exposed API keys
- [ ] Verify all API keys are in environment variables only
- [ ] Check `.env.example` doesn't contain real keys
- [ ] Confirm no API keys in git history (`git log -p | grep -i "api.*key"`)

**Files to check:**
- `components/**/*.tsx`
- `app/**/page.tsx`
- `lib/**/*.ts`

**Dangerous patterns:**
```typescript
// ❌ NEVER do this
const apiKey = "sk-xxx..."

// ✅ Always use env vars on server
const apiKey = process.env.OPENROUTER_API_KEY
```

---

### 2. Security Audit: Authentication Protection
**Priority:** CRITICAL
**Time Estimate:** 15 minutes
**Reference:** Slide 4 - "Basic auth protects user data"

- [ ] Test `/dashboard` redirects to `/sign-in` when logged out
- [ ] Test `/onboarding` redirects to `/sign-in` when logged out
- [ ] Test `/sign-in` redirects to `/dashboard` when logged in
- [ ] Test `/sign-up` redirects to `/dashboard` when logged in
- [ ] Verify middleware.ts covers all protected routes

**Test commands:**
```bash
# Logout, then try accessing:
curl -I https://prestige-worldwide-kappa.vercel.app/dashboard
# Should return 307 redirect to /sign-in
```

**Files to review:**
- `middleware.ts`

---

### 3. Security Audit: Input Validation
**Priority:** CRITICAL
**Time Estimate:** 20 minutes
**Reference:** Slide 2 - "Security shortcuts — auth, API keys, input"

- [ ] Review all form inputs for validation
- [ ] Check chat input sanitization
- [ ] Verify Plaid integration handles errors safely
- [ ] Test edge cases (empty inputs, special characters, SQL injection attempts)

**Forms to audit:**
- Sign-up form (`app/(auth)/sign-up/page.tsx`)
- Sign-in form (`app/(auth)/sign-in/page.tsx`)
- Onboarding forms (`app/onboarding/steps/*.tsx`)
- Chat input (`components/ChatPanel.tsx`)

---

### 4. Error Handling: API Routes Audit
**Priority:** CRITICAL
**Time Estimate:** 30 minutes
**Reference:** Slide 2 - "No error handling — crashes lose users"

- [ ] `/api/plan` - Returns proper error responses (not 500 crashes)
- [ ] `/api/chat` - Handles OpenRouter failures gracefully
- [ ] `/api/news` - Handles API failures (fix Bug #2 from BACKLOG.md)
- [ ] `/api/fx` - Handles exchange rate API failures
- [ ] `/api/plaid/link-token` - Returns helpful errors
- [ ] `/api/plaid/exchange` - Validates tokens before exchange

**Test each endpoint:**
```bash
# Test with invalid/missing env vars
curl -X POST https://prestige-worldwide-kappa.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

**Pattern to follow:**
```typescript
try {
  // API call
} catch (error) {
  console.error('Descriptive error:', error)
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  )
}
```

---

### 5. Error Handling: Helpful Error Messages
**Priority:** CRITICAL
**Time Estimate:** 20 minutes
**Reference:** Slide 4 - "Error states show helpful messages (not blank screens)"

- [ ] Sign-up flow shows clear errors (email taken, weak password, etc.)
- [ ] Sign-in flow shows clear errors (wrong password, user not found)
- [ ] Plaid connection failure shows helpful message
- [ ] Chat panel handles AI failures gracefully (shows fallback message)
- [ ] News panel shows fallback content when API fails (fix Bug #2)
- [ ] Plan generation shows loading state and error fallback

**Test scenarios:**
- Sign in with wrong password
- Disconnect internet, try to generate plan
- Try to connect bank with invalid Plaid credentials

---

## 🟡 HIGH PRIORITY: Launch Essentials

### 6. Analytics & Event Tracking
**Priority:** HIGH
**Time Estimate:** 1 hour
**Reference:** Slide 4 - "Analytics/tracking captures key user actions"

- [ ] Install analytics tool (Vercel Analytics, PostHog, or custom)
- [ ] Track sign-ups
- [ ] Track onboarding completion
- [ ] Track plan generation
- [ ] Track chat messages sent
- [ ] Track Plaid connection attempts (success/failure)

**Implementation options:**

**Option A: Vercel Analytics (easiest)**
```bash
npm install @vercel/analytics
```

**Option B: PostHog (most powerful, free tier)**
```bash
npm install posthog-js
```

**Key events to track:**
- `user_signed_up`
- `onboarding_completed`
- `plan_generated`
- `chat_message_sent`
- `bank_connected`

---

### 7. Mobile Testing: Complete Flow
**Priority:** HIGH
**Time Estimate:** 45 minutes
**Reference:** Slide 4 & 5 - "Tested on mobile (most users are on phones)" / "Ignoring mobile experience"

**Test on actual phone (iPhone or Android):**

- [ ] Landing page loads correctly
- [ ] Sign-up flow works on mobile
- [ ] Onboarding wizard is usable on mobile
  - [ ] Country selector
  - [ ] Plaid modal opens correctly
  - [ ] Goals form is usable
- [ ] Dashboard loads without horizontal scroll
- [ ] Chat panel is usable (keyboard doesn't break layout)
- [ ] News panel is readable
- [ ] Plan view is readable (not cut off)
- [ ] Currency toggle works on mobile

**Tools:**
- Use Chrome DevTools mobile emulator first
- Test on real device: https://prestige-worldwide-kappa.vercel.app

---

### 8. Mobile Testing: Fix Layout Issues
**Priority:** HIGH
**Time Estimate:** 30 minutes (depends on issues found)

- [ ] Fix any horizontal scroll issues
- [ ] Fix any text overflow issues
- [ ] Fix any button/tap target size issues
- [ ] Verify forms work with mobile keyboards
- [ ] Test landscape orientation

**Common mobile issues:**
- Fixed widths instead of `max-w-*`
- Text too small (< 16px causes zoom on iOS)
- Buttons too small (< 44px tap target)
- Forms hidden behind keyboard

---

### 9. README: Structure & Content Review
**Priority:** HIGH
**Time Estimate:** 30 minutes
**Reference:** Slide 7 - "Your MVP Needs a Landing Page" (README is your GitHub landing page)

Review `README.md` and ensure it follows best practices:

- [ ] **Hero section**: Clear one-liner (8 words) + value proposition
- [ ] **Problem → Solution**: What pain does it solve?
- [ ] **Tech stack**: List key technologies
- [ ] **Screenshots**: See task #10
- [ ] **What Works vs. What's Planned**: See task #11
- [ ] **Setup instructions**: For developers who want to run locally
- [ ] **Environment variables**: Clear list of required vars
- [ ] **Deployment**: Link to live demo
- [ ] **Contributing**: Optional but good for open-source credibility

**Structure to follow:**
```markdown
# Prestige Worldwide

> One-liner value proposition (8 words or fewer)

[Screenshot of dashboard]

## The Problem
Cross-border investors need...

## The Solution
Prestige Worldwide provides...

## What Works Today ✅
## What's Planned 🚧
## Tech Stack
## Getting Started
## Environment Variables
## Live Demo
```

---

### 10. README: Add Screenshots/Screen Recording
**Priority:** HIGH
**Time Estimate:** 30 minutes
**Reference:** Slide 7 - "Show how your product solves it — use a screenshot or GIF"

- [ ] Take screenshot of landing page
- [ ] Take screenshot of dashboard (blur sensitive data)
- [ ] Take screenshot of chat panel in action
- [ ] Take screenshot of plan view
- [ ] (Optional) Record 30-second demo GIF using [Loom](https://loom.com) or [Kap](https://getkap.co)

**Tools for screenshots:**
- Mac: Cmd + Shift + 4
- Windows: Win + Shift + S
- Chrome DevTools: Cmd/Ctrl + Shift + P → "Screenshot"

**Tools for GIFs:**
- [Kap](https://getkap.co) (Mac, free)
- [LICEcap](https://www.cockos.com/licecap/) (Windows, free)
- [CloudApp](https://www.getcloudapp.com) (All platforms)

**Save to:**
```
docs/screenshots/
├── landing-page.png
├── dashboard.png
├── chat-panel.png
└── plan-view.png
```

---

### 11. README: Document "What Works" vs. "What's Planned"
**Priority:** HIGH
**Time Estimate:** 20 minutes
**Reference:** Sets clear expectations, manages scope (MVP principle)

Add two clear sections to README.md:

**What Works Today ✅**
- [ ] List all functional features
- [ ] Be specific (e.g., "AI chat with Claude 3.5 Haiku via N8N")
- [ ] Include any limitations (e.g., "Plaid in sandbox mode only")

**What's Planned 🚧**
- [ ] List planned features from SESSION_NOTES.md
- [ ] Prioritize (Next, Later, Future)
- [ ] Link to roadmap or BACKLOG.md if applicable

**Example:**
```markdown
## ✅ What Works Today

- **Authentication**: Email/password sign-in with Supabase Auth
- **Onboarding**: 3-step wizard (countries, bank connection, goals)
- **AI Financial Planning**: Generate personalized plan using OpenRouter
- **AI Chat**: Real-time streaming chat with Claude 3.5 Haiku
- **Market Data**: Daily S&P 500, bonds, inflation data (AlphaVantage)
- **News Feed**: Personalized financial news via Perplexity
- **Bank Integration**: Plaid sandbox mode (fake bank connections for testing)

**Known Limitations:**
- Plaid is in sandbox mode (no real bank connections yet)
- N8N integration optional (falls back to OpenRouter)
- No RLS on Supabase tables (OK for MVP, must add before production)

## 🚧 What's Planned

**Next (Post-MVP):**
- Visual Theming System ("Dream Lifestyle Modes")
- Geographic AI Advisors (country-specific expertise)
- Automated testing infrastructure (Vitest)

**Later:**
- Real bank connections (Plaid production mode)
- Multi-currency portfolio optimization
- Email notifications
- Mobile app (React Native)
```

---

### 12. Landing Page: MVP Structure Review
**Priority:** HIGH
**Time Estimate:** 1 hour
**Reference:** Slide 7 - "Your MVP Needs a Landing Page"

Review `app/page.tsx` against the 4-part structure:

**1. Hero: One-liner + CTA**
- [ ] Clear value proposition (8 words or fewer)
- [ ] Single prominent CTA button ("Try it free" or "Get started")
- [ ] Hero is above the fold (visible without scrolling)

**2. Problem → Solution**
- [ ] Describe the pain in user's words
- [ ] Show how Prestige solves it
- [ ] Include screenshot or GIF of dashboard/chat

**3. Social Proof**
- [ ] Add testimonial from beta tester (even if just one!)
- [ ] OR show signup count (e.g., "Join 50+ early users")
- [ ] OR mention your credentials ("Built by [background]")

**4. Clear CTA (repeat)**
- [ ] Repeat same CTA at bottom
- [ ] Don't give 5 options — one button, one action
- [ ] Button text matches hero CTA

**Current file:** `app/page.tsx`

---

### 13. Feedback Channel Setup
**Priority:** HIGH
**Time Estimate:** 30 minutes
**Reference:** Slide 4 - "You have a feedback channel set up"

Choose and implement ONE feedback method:

**Option A: Simple feedback form (recommended)**
- [ ] Add feedback button in dashboard header
- [ ] Create `/api/feedback` endpoint
- [ ] Send feedback to your email via Resend (already configured)

**Option B: Dedicated email**
- [ ] Set up feedback@prestigeworldwide.com (if you have domain)
- [ ] Add mailto link in footer

**Option C: External tool**
- [ ] [Tally.so](https://tally.so) - Free form builder
- [ ] [Typeform](https://typeform.com) - Prettier, limited free tier
- [ ] Embed form link in dashboard

**Implementation example (Option A):**
```typescript
// app/api/feedback/route.ts
export async function POST(req: Request) {
  const { message, userId } = await req.json()
  // Send email via Resend
  await resend.emails.send({
    from: 'noreply@prestigeworldwide.com',
    to: 'your-email@example.com',
    subject: 'MVP Feedback',
    text: `User ${userId}: ${message}`
  })
  return NextResponse.json({ success: true })
}
```

---

### 14. Recruit Beta Testers
**Priority:** HIGH
**Time Estimate:** Ongoing (start now)
**Reference:** Slide 4 - "You have 5+ people ready to try it on day one"

- [ ] Identify 5-10 people to test on launch day
- [ ] Brief them on what Prestige Worldwide does
- [ ] Ask for honest feedback (potential testimonials!)
- [ ] Schedule launch day (give them date/time)

**Ideal beta testers:**
- Cross-border investors (matches target user)
- Friends/family with financial assets
- People with international banking experience
- Anyone willing to give honest feedback

**What to ask them:**
- "Does the value proposition make sense?"
- "Is the onboarding flow intuitive?"
- "Would you use this regularly?"
- "What's missing that you expected?"

---

## 🟢 NICE TO HAVE: Credibility & Polish

### 15. Custom Domain
**Priority:** NICE TO HAVE
**Time Estimate:** 30 minutes
**Reference:** Slide 3 - "Custom Domain + DNS: CREDIBILITY - Makes you look legit instantly"

**Current URL:** `prestige-worldwide-kappa.vercel.app`

**Recommendation:** Buy a domain ($10-15/year)

**Domain ideas:**
- prestigeworldwide.app
- prestigewealth.co
- prestigefinancial.ai
- getprestige.io

**Domain registrars:**
- [Namecheap](https://namecheap.com) - Cheap, reliable
- [Porkbun](https://porkbun.com) - Even cheaper
- [Google Domains](https://domains.google) - Simple

**Setup in Vercel:**
1. Buy domain
2. Go to Vercel project → Settings → Domains
3. Add custom domain
4. Update DNS records at registrar (Vercel shows exact records)
5. Wait 24-48 hours for propagation

---

### 16. Define Success Metrics
**Priority:** NICE TO HAVE (but important!)
**Time Estimate:** 15 minutes
**Reference:** Slide 5 - "No clear success metric — Define what success looks like BEFORE you ship"

Write down what success looks like in the first week/month:

**Week 1 Goals:**
- [ ] X sign-ups (be specific: 10? 50? 100?)
- [ ] X% complete onboarding (realistic: 50-70%)
- [ ] X financial plans generated
- [ ] X chat messages sent
- [ ] Specific feedback themes (e.g., "Users love the chat")

**Month 1 Goals:**
- [ ] X total users
- [ ] X daily active users
- [ ] X successful bank connections
- [ ] X return rate (users coming back)

**Document in:**
- `SESSION_NOTES.md` under "Success Metrics"
- OR create `docs/SUCCESS_METRICS.md`

---

### 17. Code Review: AI-Generated Debt
**Priority:** NICE TO HAVE
**Time Estimate:** 1 hour
**Reference:** Slide 2 - "Vibe Coding Rule of Thumb: spend 10 minutes reviewing what was actually created"

Review codebase for common AI-generated issues:

**Duplicated Logic:**
- [ ] Search for duplicate functions across files
- [ ] Check for copy-pasted API calls
- [ ] Look for repeated validation logic

**Missing Error States:**
- [ ] Run: `grep -r "await " app/ | grep -v "try"` (finds unhandled promises)
- [ ] Check all `.then()` calls have `.catch()`
- [ ] Verify all async functions handle errors

**Hardcoded Secrets:**
- [ ] Run: `git log -p | grep -i "sk-"` (search for API key patterns)
- [ ] Check for hardcoded URLs or tokens
- [ ] Verify all secrets are in .env files

**Unused Code:**
- [ ] Look for unreferenced components
- [ ] Check for commented-out code blocks (remove if > 1 week old)
- [ ] Look for unused imports (TypeScript will warn)

**Tools:**
- ESLint (run `npm run lint`)
- TypeScript compiler (`npx tsc --noEmit`)

---

### 18. Document Known Technical Debt
**Priority:** NICE TO HAVE
**Time Estimate:** 30 minutes
**Reference:** Slide 2 - "Acceptable Debt vs. Dangerous Debt"

Update `docs/BACKLOG.md` with two sections:

**Acceptable Debt (OK for MVP):**
- [ ] Manual processes (e.g., market data fetching via script)
- [ ] Hardcoded values (e.g., currency list)
- [ ] Simple UI without polish (no animations, basic styling)
- [ ] Missing features (theming, multi-language, etc.)

**Must Fix Later (Blocks Scaling):**
- [ ] No RLS on Supabase tables (MUST add before real users)
- [ ] Plaid sandbox only (MUST upgrade for real banks)
- [ ] No automated testing (MUST add before scaling team)
- [ ] No data backups (MUST implement before production)
- [ ] No monitoring/alerts (MUST add when traffic grows)

**Example format:**
```markdown
## Acceptable Technical Debt

These are shortcuts we took for MVP speed. They're fine for now.

- **Manual market data fetching**: Run `npm run fetch-market-data` daily
- **Hardcoded currency list**: Stored in `lib/currencies.ts`
- **Basic UI**: No animations, minimal polish (add after validating value)

## Must Fix Before Scale

These will block growth and MUST be addressed.

- **🔴 No RLS on Supabase tables**: Users can see each other's data
- **🔴 Plaid sandbox only**: Can't connect real banks
- **🟡 No automated tests**: Hard to ship with confidence
- **🟡 No error monitoring**: Can't detect production issues
```

---

## 📊 Summary

**Total Tasks:** 18
**Total Estimated Time:** ~8 hours

**Priority Breakdown:**
- 🔴 Critical (Security & Errors): 5 tasks, ~2 hours
- 🟡 High (Launch Essentials): 9 tasks, ~5 hours
- 🟢 Nice to Have (Polish): 4 tasks, ~2.5 hours

**Recommended Order:**
1. Security audit (tasks 1-3) - 50 min
2. Error handling (tasks 4-5) - 50 min
3. Mobile testing (tasks 7-8) - 1.25 hours
4. README improvements (tasks 9-11) - 1.5 hours
5. Analytics (task 6) - 1 hour
6. Landing page (task 12) - 1 hour
7. Feedback channel (task 13) - 30 min
8. Beta testers (task 14) - ongoing
9. Everything else - as time permits

---

## 🎯 Session Resume Instructions

If starting a fresh session, follow this workflow:

1. **Read this file** to understand the full checklist
2. **Check progress** - Review unchecked items
3. **Pick next task** - Start with highest priority unchecked item
4. **Update checkboxes** - Mark completed items as you go
5. **Document issues** - Add any new findings to `BACKLOG.md`

**Current Progress:** 0/18 tasks completed (0%)

---

## 📝 Notes & Findings

Use this section to document issues found during the checklist:

**Security Issues Found:**
- (none yet)

**Error Handling Gaps:**
- (none yet)

**Mobile Issues Found:**
- (none yet)

**Code Debt Identified:**
- (none yet)

---

**Last Updated:** 2026-03-19
**Status:** Ready to begin
**Branch:** `claude/start-planning-gWIXp`
