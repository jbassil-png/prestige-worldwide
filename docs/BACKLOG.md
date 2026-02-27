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

_(Empty - will add as needed)_

---

## Technical Debt

_(Empty - will add as needed)_
