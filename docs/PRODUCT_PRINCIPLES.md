# Product Principles — Prestige Worldwide

**Last Updated:** 2026-03-21

This document captures the product decisions and UX philosophy that should guide every feature we build. When facing a design trade-off, refer here first.

---

## 1. Progressive Disclosure, Not Progressive Obligation

The tool should work at whatever level of sophistication the user wants — without making simpler users feel like their set-up is broken or incomplete.

**What this means in practice:**

- A user who connects 3 accounts and skips goals entirely should land on a **fully functional, affirmative dashboard**, not one that shows empty states, warnings, or "complete your profile" banners.
- Power features (goals, on-track tracking, retirement projections, goal-account linking) are surfaced as **invitations**, never requirements.
- The messaging for skipped features should be warm and forward-looking: *"You can add a retirement goal any time from your dashboard"* — not *"Your plan is incomplete."*

**Hierarchy of enhancement nudges:**
1. User has accounts, no goals → show "Unlock more from your plan" CTA (subtle, brand-coloured, not alarming)
2. User has a retirement goal → show on-track progress and projected balance
3. User has linked accounts to goals → show per-goal allocation and unallocated bucket

Each tier adds value without implying the previous tier was lacking.

---

## 2. The Unallocated Bucket Is a First-Class Concept

Funds not assigned to a goal are not a gap — they are **liquid flexibility**. Display them as the "Unallocated" bucket with positive or neutral copy.

- Never label unallocated funds with negative language ("untracked", "unmanaged", "missing")
- The bucket shrinks naturally as users add goals and link accounts — this is a satisfying UX arc
- For users without any goals, *all* funds are shown as unallocated — this is correct and intentional

---

## 3. Retirement Year, Not Age

We ask for a **target retirement year** (e.g. 2055), not current age and retirement age.

**Why:**
- Age is sensitive and invasive for a new product relationship
- A year is more concrete and forward-looking — it's what users actually plan around
- Years-to-retirement is trivially computable: `retirementYear - currentYear`
- Removes one required field from onboarding entirely

**Income:** We do not ask for income at any stage. If a user needs help estimating their post-retirement income target, they should be directed to the chat agent: *"Not sure what target to set? Ask our planning assistant →"*

---

## 4. Default Goals Reduce Blank-Slate Anxiety

When a user reaches Step 3 of onboarding, they see a **pre-populated retirement goal card** (default: $2,000,000 / target year ~30 years out). They can:

- Edit the target amount
- Edit the target year
- Remove the card entirely
- Skip the whole step

This pattern converts passive users into engaged ones by giving them something concrete to react to, rather than an empty form to fill.

The defaults are intentionally round numbers — they signal "starting point" not "calculated recommendation."

---

## 5. Onboarding Consistency

Once a user completes onboarding, they will not see it again. But when they want to:
- Add countries or account types
- Connect additional accounts
- Edit or add goals
- Update retirement year or countries

...the UI they encounter should **look and feel continuous** with what they saw during onboarding. Same layout, same component shapes, same copy style.

**Implementation approach:**
- The onboarding step components (`StepCountries`, `StepConnect`, `StepGoals`) are **reusable** — they should be imported by post-onboarding flows, not duplicated
- Settings page mirrors the structure of Step 3: same country selectors, same retirement year input, same optional fields
- Goal editing should open a modal or page that renders the same goal card UI from onboarding

This reduces re-learning friction and creates a coherent product feel.

---

## 6. Scheduled Check-ins Are the App's Heartbeat

The check-in schedule drives ongoing engagement without requiring the user to remember to return.

**Defaults and configuration:**
- Default frequency: **twice per year** (every 182 days)
- Configurable in Settings: Monthly / Quarterly / Twice a year / Annually
- NOT part of onboarding — this is a setting discovered after the user is active

**What a check-in does:**
- Prompts the user to review their portfolio (balance updates, new accounts, goal drift)
- Will eventually trigger an email/notification (tracked in roadmap as Task 11)
- Logged in `user_checkin_schedule` with `last_checkin_at` and `next_checkin_at`

Check-ins should feel like a service to the user, not a product retention mechanism. The tone should be: *"It's been 6 months — here's what changed and what's worth reviewing."*

---

## 7. On-Track Calculation

The on-track status for a retirement goal uses the following logic:

```
projected = currentNetWorth × (1.07 ^ yearsToRetirement)
target    = retirementGoal.targetAmountUsd

on_track  → projected ≥ target
at_risk   → projected ≥ target × 0.80
off_track → projected < target × 0.80
```

**7% CAGR** is used as a long-run real-asset growth assumption. This is disclosed in the UI.

The 80% threshold for "at risk" is deliberately generous — we want to flag potential shortfalls without alarming users who are close to on track.

All projections include the standard disclaimer that this is not financial advice.

---

## 8. Income Is Out of Scope at Onboarding

We do not ask for income. Reasons:
- Privacy sensitivity early in the relationship
- Income is complex for expats (multiple income streams, currencies, tax treaties)
- The 4% withdrawal rule already provides a reasonable income estimate from projected balance
- Users who need detailed income planning should engage the chat agent

This may be revisited when geographic AI advisors are introduced (they can ask contextually in chat).

---

## 9. Country Is Always Captured

Country of residence is the most important piece of context for a cross-border financial planning tool. It gates:
- Currency display
- Tax treaty recommendations
- Account type suggestions
- Retirement country projections

Country is captured in **Step 1 of onboarding** (which countries you have assets in) and **Step 3** (current residence, optional retirement country). Settings allows updating both. No screen should be reached without knowing at least one country.

---

## 10. Developer Ergonomics — Onboarding Iteration

During active development, we need to be able to quickly edit and re-run the onboarding flow. See `docs/IMPLEMENTATION_ROADMAP.md#dev-utilities` for current options.

**Planned:** A dev-mode "Reset & re-run onboarding" button in Settings (visible only when `NODE_ENV === 'development'`) that clears `user_plans` for the current user and redirects to `/onboarding`.

This allows rapid iteration on the onboarding UX without needing to use Supabase dashboard each time.
