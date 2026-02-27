# Manual Testing Checklist - Next.js 16 Upgrade
**Date:** 2026-02-27
**Upgrade:** Next.js 15 → Next.js 16.1.6 (React 19)
**Tester:** _____________

## 🚀 Pre-Test Setup

- [ ] Navigate to: **https://prestige-worldwide-kappa.vercel.app**
- [ ] Open browser console (F12) - watch for errors throughout
- [ ] Clear browser cache and cookies (for clean auth testing)
- [ ] Have test credentials ready (or prepare to create new account)

---

## ✅ Priority 1: Critical Path Testing

### 1. Authentication - New User Flow
**Goal:** Verify complete signup → onboarding → dashboard flow

- [ ] Navigate to homepage (https://prestige-worldwide-kappa.vercel.app)
- [ ] Click "Sign Up" or navigate to `/sign-up`
- [ ] **CHECKPOINT:** Sign-up page loads without errors
- [ ] Fill out sign-up form with new credentials
- [ ] Submit form
- [ ] **CHECKPOINT:** Supabase auth succeeds (check console)
- [ ] **CHECKPOINT:** Redirects to `/onboarding`
- [ ] Complete onboarding flow
- [ ] **CHECKPOINT:** Redirects to `/dashboard`
- [ ] **CHECKPOINT:** Dashboard loads with user data

**Console Check:** No errors or warnings related to React 19 or Next.js 16

---

### 2. Authentication - Existing User Flow
**Goal:** Verify sign-in flow

- [ ] Sign out (if signed in)
- [ ] Navigate to `/sign-in`
- [ ] **CHECKPOINT:** Sign-in page loads
- [ ] Enter existing credentials
- [ ] Submit form
- [ ] **CHECKPOINT:** Redirects to `/dashboard`
- [ ] **CHECKPOINT:** User session persists on refresh (F5)

---

### 3. Middleware Protection
**Goal:** Verify protected routes work correctly

- [ ] Sign out completely
- [ ] Try to access `/dashboard` directly
- [ ] **CHECKPOINT:** Redirects to `/sign-in`
- [ ] Try to access `/onboarding` directly
- [ ] **CHECKPOINT:** Redirects to `/sign-in`
- [ ] Sign in successfully
- [ ] Try to access `/sign-in` while authenticated
- [ ] **CHECKPOINT:** Redirects to `/dashboard`
- [ ] Try to access `/sign-up` while authenticated
- [ ] **CHECKPOINT:** Redirects to `/dashboard`

---

## ✅ Priority 2: Dashboard Features

### 4. Chat Panel
**Goal:** Verify AI chat functionality

- [ ] Navigate to `/dashboard` (while authenticated)
- [ ] **CHECKPOINT:** ChatPanel component renders
- [ ] Type a message in chat input
- [ ] Send message
- [ ] **CHECKPOINT:** Message sends successfully (check network tab)
- [ ] **CHECKPOINT:** Response received from `/api/chat`
- [ ] **CHECKPOINT:** No console errors during chat interaction

---

### 5. News Panel
**Goal:** Verify financial news loads

- [ ] On dashboard, locate NewsPanel
- [ ] **CHECKPOINT:** News items display
- [ ] **CHECKPOINT:** `/api/news` request succeeds (network tab)
- [ ] Click on a news item (if interactive)
- [ ] **CHECKPOINT:** Interaction works as expected

---

### 6. Financial Plan View
**Goal:** Verify plan generation and display

- [ ] On dashboard, locate PlanView
- [ ] **CHECKPOINT:** Financial plan displays or triggers generation
- [ ] If plan exists: verify it renders correctly
- [ ] If no plan: trigger plan generation
- [ ] **CHECKPOINT:** `/api/plan` request succeeds
- [ ] **CHECKPOINT:** Plan renders after generation

---

### 7. Currency Toggle
**Goal:** Verify currency switching

- [ ] Locate CurrencyToggle component
- [ ] Click to switch currency
- [ ] **CHECKPOINT:** Currency changes throughout dashboard
- [ ] **CHECKPOINT:** Values update correctly
- [ ] Switch back
- [ ] **CHECKPOINT:** Returns to original currency

---

### 8. Plaid Integration
**Goal:** Verify banking connection (CRITICAL for financial app)

- [ ] On dashboard, find "Connect Bank" or Plaid integration
- [ ] Click to initiate Plaid Link
- [ ] **CHECKPOINT:** `/api/plaid/link-token` succeeds (network tab)
- [ ] **CHECKPOINT:** Plaid Link modal opens
- [ ] (OPTIONAL) Complete bank connection if safe to do so
- [ ] OR close modal and verify no errors

---

### 9. Balance Refresh
**Goal:** Verify balance updates work

- [ ] On dashboard with connected account
- [ ] Find "Refresh Balance" or similar action
- [ ] Trigger balance refresh
- [ ] **CHECKPOINT:** `/api/balance-refresh` request succeeds
- [ ] **CHECKPOINT:** Balance updates in UI
- [ ] **CHECKPOINT:** No loading state issues

---

## ✅ Priority 3: Performance & Polish

### 10. Page Performance
**Goal:** Verify production deployment performs well

- [ ] Open Network tab in DevTools
- [ ] Hard refresh homepage (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] **CHECKPOINT:** Page loads in reasonable time (< 3s)
- [ ] Check total page weight and requests
- [ ] Navigate to dashboard
- [ ] **CHECKPOINT:** Dashboard loads smoothly
- [ ] Note any slow-loading resources

**Performance Notes:**
```
- Homepage load time: ___ ms
- Dashboard load time: ___ ms
- Any slow resources: ___
```

---

### 11. Console & Network Health
**Goal:** Verify no React 19 or Next.js 16 warnings

- [ ] Clear console
- [ ] Navigate through: Home → Sign-in → Dashboard
- [ ] **CHECKPOINT:** No React 19 deprecation warnings
- [ ] **CHECKPOINT:** No Next.js 16 compatibility errors
- [ ] **CHECKPOINT:** No 404s or failed requests (check Network tab)
- [ ] **CHECKPOINT:** All API routes return proper status codes

---

## 🔍 Cross-Browser Testing (Optional but Recommended)

- [ ] Chrome/Edge - All tests pass
- [ ] Firefox - Critical path works
- [ ] Safari - Critical path works

---

## 📊 Results Summary

### Issues Found
| Severity | Issue | Page/Component | Notes |
|----------|-------|----------------|-------|
| 🔴 High  |       |                |       |
| 🟡 Medium|       |                |       |
| 🟢 Low   |       |                |       |

### Console Errors Observed
```
(List any console errors here)
```

### Performance Notes
```
- Page load times feel: Fast / Normal / Slow
- Build time: ___ seconds
- Bundle size change: +/- ___ kB
```

---

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for automated test creation

**Tested By:** _____________
**Date:** _____________
**Result:** ✅ PASS / ⚠️ PASS WITH ISSUES / ❌ FAIL
