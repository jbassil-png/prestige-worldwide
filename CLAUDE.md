# Claude Context — Prestige Worldwide

> **Start every session here.** Read this file first, then `SESSION_NOTES.md` (most recent entry), then begin work.

---

## Project

Cross-border financial planning app for expats, dual citizens, and global citizens. Helps users with assets in multiple countries build a unified retirement and tax strategy.

**Live:** https://prestige-worldwide-kappa.vercel.app
**Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (auth + DB), Plaid (bank data), OpenRouter (AI), PostHog (analytics), Vercel (deploy)

---

## Current Task — START HERE

**Persist theme** (task 8) — write the chosen theme to a `user_preferences` Supabase table; fall back to `sessionStorage` for the no-auth path.

### Confirmed approach
- **Column view** — all 4 steps stacked vertically, visible without clicking through the flow
- **Real components** — uses `StepCountries`, `StepConnect`, `StepGoals` with mock props; Step 4 is a placeholder
- **Mock data** — US + Canada scenario, pre-filled so every step is in a valid/submittable state
- **No API calls** — `onNext` handlers are intercepted; plan generation is stubbed
- **Accessible in production** (not dev-only gated)
- **Theme placeholder** — Step 4 shows three named cards: Swiss Alps Retreat ❄️, Gaudy Miami 🌴, Clooney's Positano 🇮🇹 — no full UI yet, just the shape

### Preview display order (differs from wizard order)
1. Goals (`StepGoals`)
2. Assets (`StepCountries`)
3. Style (`ThemePlaceholder`)
4. Connect (`StepConnect`)

The wizard's step order (Countries → Connect → Goals → Style) is the live flow. The preview reorders for a better top-to-bottom reading experience — "why you're here" before "what you have".

### Files
```
app/onboarding/preview/page.tsx   ← preview shell (column view + step navigator)
app/onboarding/preview/mock.ts    ← MOCK_SELECTIONS, MOCK_ACCOUNTS, MOCK_GOALS
```

---

## What Comes After the Preview Page

In order:

| # | Task | Notes |
|---|------|-------|
| 1 | ~~**Preview page**~~ | ✅ DONE — column view, real components, mock US+CA data |
| 2 | ~~**Bug fix** — `country: a.name` in `app/onboarding/page.tsx:42`~~ | ✅ DONE — `countryCode: string` added to `Account` type; populated in `ManualEntry` and Plaid path |
| 3 | ~~**Theme design decision**~~ | ✅ DONE — palettes + typography locked in; see Key Decisions |
| 4 | ~~**Theme token system**~~ | ✅ DONE — CSS custom properties in `globals.css`; Tailwind `theme-*` + `font-heading`/`font-body` utilities; fonts via `next/font/google` |
| 5 | ~~**`StepStyle` component**~~ | ✅ DONE — three cards with colour bar, swatches, tagline, mood, font name |
| 6 | ~~**Wire Step 4 into wizard + horizontal scroll**~~ | ✅ DONE — 4-step wizard; Goals stores data, Style triggers plan gen; horizontal slide track (0.45s cubic-bezier); theme stored to sessionStorage |
| 7 | ~~**Full-screen loading reveal**~~ | ↳ moved to `docs/POLISH_BACKLOG.md` |
| 8 | **Persist theme** | CURRENT — `user_preferences` Supabase table; sessionStorage fallback for no-auth path |
| 9 | **OpenRouter model wiring** | `OPENROUTER_PLAN_MODEL` env var, JSON mode, validate plan output quality |
| 10 | **`initialValues` props on step components** | Seam for re-entry flow |
| 11 | **Re-entry flow** | `/setup` route, "Update my setup" dashboard entry point |

---

## Key Decisions (Settled — Do Not Revisit)

| Topic | Decision |
|-------|----------|
| AI models | OpenRouter for all AI calls (not direct Anthropic/Google APIs) |
| Plan generation model | `claude-3.5-haiku` default via `OPENROUTER_PLAN_MODEL` env var; upgrade to `claude-3.5-sonnet` if quality is thin |
| Chat model | `claude-3.5-haiku` |
| Insights model | `google/gemini-flash-1.5` |
| Structured output | **JSON mode** (`response_format: { type: "json_object" }`), no retry loop. Stub plan is the fallback on API failure. |
| Theme count | 3 themes |
| Theme names | Swiss Alps Retreat ❄️, Gaudy Miami 🌴, Clooney's Positano 🇮🇹 |
| Theme step placement | Step 4 in onboarding, after Goals, before plan generation |
| Theme default | Swiss Alps Retreat ❄️ (`data-theme="swiss-alps"` on `<html>`) |
| Theme palettes | Swiss Alps: slate/ice. Gaudy Miami: pink/gold. Positano: linen/terracotta. See `docs/POLISH_BACKLOG.md` for exact values. |
| Theme typography | Swiss Alps: DM Serif Display + DM Sans. Gaudy Miami: Syne + DM Sans. Positano: Cormorant Garamond + Lato. Loaded via `next/font/google`. |
| Theme token system | CSS custom properties (`--color-bg`, `--color-primary`, etc.) + `--font-heading`/`--font-body`. Tailwind `theme-*` utilities reference them. Applied via `data-theme` on `<html>`. |
| Preview page | Column view, production-accessible, real components with mock data |
| Loading reveal | Full-screen themed transition after Step 4, not a disabled button on Step 3 |
| Horizontal scroll | Wizard converts to horizontal scroll when Step 4 is wired in — one step per viewport, slide transition. Preview page stays column view. |

---

## Onboarding Structure

```
app/onboarding/
├── page.tsx                ← Wizard orchestrator (currently 3-step; becomes 4-step)
├── preview/
│   ├── page.tsx            ← Preview shell (NEW)
│   └── mock.ts             ← Mock data (NEW)
└── steps/
    ├── StepCountries.tsx   ← Step 1: "Where are your assets?"
    ├── StepConnect.tsx     ← Step 2: "Connect your accounts" (Plaid or manual)
    ├── StepGoals.tsx       ← Step 3: "Where are you headed?"
    └── StepStyle.tsx       ← Step 4: "Choose your style" (DOES NOT EXIST YET)
```

### WizardData shape (current → target)
```ts
// Current
type WizardData = {
  selections: CountrySelection[];
  accounts: Account[];
};

// Target (after Step 4)
type WizardData = {
  selections: CountrySelection[];
  accounts: Account[];
  goals: GoalsData;       // stored when Step 3 completes, used when Step 4 submits
  theme: ThemeId;         // "swiss-alps" | "gaudy-miami" | "positano"
};
```

---

## Known Bugs

*(None currently)*

---

## Key Architecture

| Concern | Implementation |
|---------|----------------|
| Auth | Supabase Auth (sign-in/sign-up, middleware guards `/dashboard` and `/onboarding`) |
| Database | Supabase (Postgres). Tables: `user_plans`, `user_profiles`, `user_holdings`, `user_portfolio_news`, `plaid_items`, `user_checkin_schedule` |
| AI | OpenRouter via `/api/plan`, `/api/chat`, `/api/insight` — all have stub fallbacks |
| Bank data | Plaid (sandbox); mock accounts returned when credentials not configured |
| Analytics | PostHog — events at onboarding steps, plan generation, bank connection |
| Theme system | Not yet built. Plan: CSS custom properties, applied via `data-theme` attribute on `<html>` |
| N8N | Referenced in older docs but not in the active call path. Ignore for new feature work. |

---

## Dev Workflow Notes

- **Branch:** Check `SESSION_NOTES.md` for the current working branch
- **Mock data path:** If no Supabase session, plan is stored in `sessionStorage` as `pw_plan` and read by `DashboardClient` on load
- **Plaid mock:** If `PLAID_CLIENT_ID` not set, `/api/plaid/link-token` returns `{ mock: true }` and onboarding shows demo accounts
- **Preview page:** Navigate to `/onboarding/preview` — no auth required, no data written

---

## Full Context Documents

- `docs/IMPLEMENTATION_ROADMAP.md` — Complete phase/task breakdown with sub-tasks
- `SESSION_NOTES.md` — Session-by-session history (most recent first)
- `docs/PRODUCT_PRINCIPLES.md` — UX philosophy, onboarding consistency rules
- `docs/FEATURE_AI_PLAN_GENERATION.md` — AI plan gen spec (for Task 4/9)
