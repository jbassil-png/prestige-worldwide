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

_(Empty - will add as we find issues during testing)_

---

## Feature Requests

_(Empty - will add as needed)_

---

## Technical Debt

_(Empty - will add as needed)_
