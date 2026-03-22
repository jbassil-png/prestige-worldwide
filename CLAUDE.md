# Claude Context — Prestige Worldwide

> **Start every session here.** Read this file first, then `SESSION_NOTES.md` (most recent entry), then begin work.

---

## Project

Cross-border financial planning app for expats, dual citizens, and global citizens. Helps users with assets in multiple countries build a unified retirement and tax strategy.

**Live:** https://prestige-worldwide-kappa.vercel.app
**Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (auth + DB), Plaid (bank data), OpenRouter (AI), PostHog (analytics), Vercel (deploy)

---

## Current Task — START HERE

**Task 14: New unified settings page.**

Replace `/setup` (re-entry wizard) and `/settings` (plain form) with a single, unified settings page. Both dashboard buttons ("Update setup" and "Settings") become one "Settings" button pointing to the new page.

### Design intent
- **Not a wizard replay.** The onboarding wizard is a one-time linear journey. Returning users should never re-experience it.
- **Single page, non-linear.** All sections visible and editable in place — users jump to what they need, no enforced step order.
- **Visually recalls the wizard** — same card style, typography, colour palette — but clearly a settings home, not a flow.
- **Covers everything:** countries, accounts (manual entry for free users), goals, theme, check-in frequency.

### Freemium model (locked in — see Key Decisions)
- Free tier: full access except Plaid bank connection. Manual account entry only.
- Paid tier: Plaid connection unlocked.
- The settings page accounts section shows manual entry for free users; Plaid connect for paid users.

### Plan
1. Build `/settings` as a new single-page component with sectioned cards (Countries, Accounts, Goals, Style, Profile)
2. Each section is independently editable and saves without affecting others
3. Accounts section: manual entry always available; Plaid gated behind paid tier with upgrade prompt
4. Replace both dashboard buttons with one "Settings" link → `/settings`
5. Delete `/setup` (SetupClient, setup page) — no longer needed
6. Delete old `/settings` page — replaced by new implementation

### Open question (resolve before building Accounts section)
**How is paid/free tier status tracked?** Options: a Supabase column on `user_profiles`, or Stripe subscription status checked at runtime. Decision affects how the upgrade prompt is implemented and whether the gate is enforced server-side or client-side. Decide this at the start of Task 14.

---

## Route Map

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/sign-in`, `/sign-up` | Supabase Auth |
| `/onboarding` | 4-step wizard (Countries → Connect → Goals → Style) — one-time only |
| `/onboarding/preview` | Public preview — no auth, no data written |
| `/dashboard` | Main authenticated view |
| `/settings` | **Task 14** — new unified settings page (replaces `/setup` + old `/settings`) |
| `/setup` | ⚠️ To be deleted in Task 14 |
| `/accounts` | Manage Plaid-connected accounts |
| `/plan/history` | Last 10 plan generations |
| `/contact`, `/terms`, `/privacy` | Marketing |

---

## What's Been Built

| # | Task | Status |
|---|------|--------|
| 1 | Preview page | ✅ DONE — column view, real components, mock US+CA data |
| 2 | Bug fix — `country: a.name` | ✅ DONE — `countryCode: string` on `Account` type |
| 3 | Theme design decision | ✅ DONE — palettes + typography locked in |
| 4 | Theme token system | ✅ DONE — CSS custom properties in `globals.css`; Tailwind utilities; fonts via `next/font/google` |
| 5 | `StepStyle` component | ✅ DONE — three cards with colour bar, swatches, tagline, mood, font name |
| 6 | Wire Step 4 into wizard + horizontal scroll | ✅ DONE — 4-step wizard; horizontal slide track (0.45s cubic-bezier) |
| 7 | Full-screen loading reveal | ↳ moved to `docs/POLISH_BACKLOG.md` |
| 8 | Persist theme | ✅ DONE — `user_preferences` table + RLS; upserted on plan gen; applied via `data-theme` on dashboard load |
| 9 | OpenRouter model wiring | ✅ DONE — all three routes wired; `OPENROUTER_API_KEY` + `OPENROUTER_PLAN_MODEL` in Vercel |
| 10 | `initialValues` props on step components | ✅ DONE — all four steps accept `initialValues` |
| 11 | Re-entry flow | ✅ DONE — `/setup` route with pre-filled wizard; "Update setup" in dashboard control bar |
| 12 | Dashboard UX pass | ✅ DONE — control bar, news promoted, top bar stripped, plan header personalised |
| 13 | Charts | ✅ DONE — `ProjectionChart` (Recharts area chart) in PlanView; `AllocationCharts` (geo + account type) in DashboardClient |

| 14 | New unified settings page | 🔜 NEXT — single-page, non-linear, visually recalls wizard; replaces `/setup` + `/settings` |
| 15 | Freemium model | 🔜 — gate Plaid behind paid tier; free users manual-entry only |

**Partial / placeholder:**
- `AllocationCharts` — empty state fallbacks exist but chart content needs real data validation
- Plan history UI (`/plan/history`) — fetch works, display is stub

---

## Key Decisions (Settled — Do Not Revisit)

| Topic | Decision |
|-------|----------|
| Business model | Freemium. Free tier: full app access (onboarding, plan gen, dashboard, chat, news) except Plaid bank connection. Paid tier: Plaid connection unlocked. Manual account entry is always available on free tier. |
| Settings UX | Post-onboarding settings is a single non-linear page, not a wizard replay. Visually recalls the onboarding aesthetic (cards, typography, palette) but all sections are independently editable. The horizontal wizard is a one-time onboarding experience only. |
| Settings entry point | One "Settings" button on the dashboard. Replaces both "Update setup" (`/setup`) and "Settings" (`/settings`). `/setup` will be deleted. |
| AI models | OpenRouter for all AI calls (not direct Anthropic/Google APIs) |
| Plan generation model | `anthropic/claude-3.5-haiku` default via `OPENROUTER_PLAN_MODEL` env var; upgrade to `claude-3.5-sonnet` if quality is thin |
| Chat model | `anthropic/claude-3.5-haiku` via `OPENROUTER_MODEL` env var |
| Insights model | `google/gemini-flash-1.5` (hardcoded in `/api/insight`) |
| Structured output | **JSON mode** (`response_format: { type: "json_object" }`), no retry loop. Stub plan is the fallback on API failure. |
| Theme count | 3 themes |
| Theme names | Swiss Alps Retreat ❄️, Gaudy Miami 🌴, Clooney's Positano 🇮🇹 |
| Theme step placement | Step 4 in onboarding, after Goals, before plan generation |
| Theme default | Swiss Alps Retreat ❄️ (`data-theme="swiss-alps"` on `<html>`) |
| Theme palettes | Swiss Alps: slate/ice. Gaudy Miami: pink/gold. Positano: linen/terracotta. See `docs/POLISH_BACKLOG.md` for exact values. |
| Theme typography | Swiss Alps: DM Serif Display + DM Sans. Gaudy Miami: Syne + DM Sans. Positano: Cormorant Garamond + Lato. Loaded via `next/font/google`. |
| Theme token system | CSS custom properties (`--color-bg`, `--color-primary`, etc.) + `--font-heading`/`--font-body`. Tailwind `theme-*` utilities reference them. Applied via `data-theme` on `<html>`. |
| Preview page | Column view, production-accessible, real components with mock data |
| Loading reveal | Full-screen themed transition — deferred to Polish backlog |
| Horizontal scroll | Wizard uses horizontal scroll — one step per viewport, 0.45s cubic-bezier slide transition |

---

## Onboarding Structure

```
app/onboarding/
├── page.tsx                ← 4-step wizard orchestrator
├── preview/
│   ├── page.tsx            ← Preview shell (public, no auth)
│   └── mock.ts             ← Mock US+CA data
└── steps/
    ├── StepCountries.tsx   ← Step 1: "Where are your assets?"
    ├── StepConnect.tsx     ← Step 2: "Connect your accounts" (Plaid or manual)
    ├── StepGoals.tsx       ← Step 3: "Where are you headed?"
    └── StepStyle.tsx       ← Step 4: "Choose your style"
```

### WizardData shape
```ts
type WizardData = {
  selections: CountrySelection[];
  accounts: Account[];
  goals: GoalsData;
  // theme is passed directly from StepStyle, not stored in WizardData
};
```

All step components accept `initialValues` props (built for the `/setup` re-entry flow, which will be deleted in Task 14).

---

## Dashboard Structure

**Layout:** 2-column on desktop (plan/news/allocations left; sticky chat right), single column on mobile.

**Left column (top to bottom):**
1. Demo banner (unauthenticated only) — marketing copy + CTA
2. Personalised control bar (authenticated) — country pair, plan date, currency toggle, refresh plan, settings *(currently two buttons "Update setup" + "Settings" — Task 14 reduces to one)*
3. News panel — portfolio news (Alpha Vantage, 30-min cache) or demo news
4. Plan view — summary, metrics, projection chart, recommendations
5. Allocation charts — geo breakdown + account type breakdown

**Right column (sticky, desktop only):**
6. Chat panel — streaming chat with plan context

---

## Known Gaps

- **Settings page** — missing retirement savings target amount field (profile stores country + year, not goal amount)
- **Plan history UI** — `/plan/history` fetches from `plan_history` table but display is a stub
- **`AllocationCharts`** — empty state placeholders in place; needs validation with real multi-account data

---

## Key Architecture

| Concern | Implementation |
|---------|----------------|
| Auth | Supabase Auth (sign-in/sign-up, middleware guards `/dashboard` and `/onboarding`) |
| Database | Supabase (Postgres). Tables: `user_plans`, `user_preferences`, `user_profiles`, `user_holdings`, `user_portfolio_news`, `plaid_items`, `user_checkin_schedule` |
| AI | OpenRouter via `/api/plan` (Haiku, JSON mode), `/api/chat` (Haiku, streaming), `/api/insight` (Gemini Flash) — all have stub fallbacks |
| Bank data | Plaid (sandbox); mock accounts returned when credentials not configured |
| Analytics | PostHog — `onboarding_started`, `plan_generated`, `onboarding_completed`, `plan_refreshed`, `chat_message_sent` |
| Theme system | CSS custom properties in `globals.css`; applied via `data-theme` on `<html>`; persisted to `user_preferences` table |
| Charts | Recharts (`ProjectionChart`); CSS bar charts (`AllocationCharts`) |
| N8N | Referenced in older docs but not in the active call path. Ignore. |

---

## Dev Workflow Notes

- **Branch:** Check `SESSION_NOTES.md` for the current working branch
- **Mock data path:** If no Supabase session, plan is stored in `sessionStorage` as `pw_plan` and read by `DashboardClient` on load
- **Plaid mock:** If `PLAID_CLIENT_ID` not set, `/api/plaid/link-token` returns `{ mock: true }` and onboarding shows demo accounts
- **Preview page:** Navigate to `/onboarding/preview` — no auth required, no data written
- **OpenRouter:** `OPENROUTER_API_KEY` and `OPENROUTER_PLAN_MODEL` set in Vercel for all environments

---

## Full Context Documents

- `docs/IMPLEMENTATION_ROADMAP.md` — Complete phase/task breakdown with sub-tasks
- `SESSION_NOTES.md` — Session-by-session history (most recent first)
- `docs/PRODUCT_PRINCIPLES.md` — UX philosophy, onboarding consistency rules
- `docs/FEATURE_AI_PLAN_GENERATION.md` — AI plan gen spec
