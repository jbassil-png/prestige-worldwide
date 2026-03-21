# Polish Backlog

> Things we're deliberately deferring to a later polishing phase. Add items freely — nothing here blocks shipping.

---

## Themes

- **Palette fine-tuning** — current values are "quick" starting points; final values TBD after seeing them in real UI context
  - Swiss Alps: bg `#F1F5F9`, surface `#FFFFFF`, primary `#1E293B`, accent `#38BDF8`, border `#CBD5E1`
  - Gaudy Miami: bg `#FFF0F6`, surface `#FFFFFF`, primary `#DB2777`, accent `#F59E0B`, border `#FBCFE8`
  - Positano: bg `#FEF3C7`, surface `#FFFFFF`, primary `#92400E`, accent `#D97706`, border `#FDE68A`
- **Typography refinement** — font weights, sizes, line-heights, and letter-spacing tuned per theme once `StepStyle` and the wizard are wired up
- **Theme default** — Swiss Alps is the placeholder default; may become a neutral/unthemed base after seeing all three in production
- **StepStyle card visuals** — theme selection cards currently show color swatches; could show a miniature UI preview or moodboard image
- **Dark mode variants** — not planned yet; revisit after theme system is stable

## Onboarding — Loading State

- **Full-screen loading reveal** — after Step 4 (Style), while plan is generating: full-screen overlay in the chosen theme's colours, 3-beat animation (pulsing dots or staged progress bar), copy stepping through "Analysing your accounts… Modelling tax exposure… Building your plan…" before dashboard reveals. Currently just a disabled button with "Building your plan…" text.

## Onboarding Wizard

- **Slide transition animation** — horizontal scroll transition easing, duration, and feel (snap vs. inertia)
- **Step indicator** — dot/progress bar style, position, animation between steps
- **Full-screen loading reveal** — 3-beat animation design (timing, copy, themed visuals)
- **Mobile layout** — step card padding, font sizes, and button placement on small screens
- **Back button behavior** — currently missing from some steps; audit all transitions

## Preview Page (`/onboarding/preview`)

- **Pre-filled mock data** — steps currently start blank; wire in `initialValues` props once task 10 is done so the preview shows a fully filled-out US+CA scenario
- **Step navigator** — sticky sidebar or top-nav jumping to each step section

## Dashboard & Plan

- **Plan output quality** — validate AI plan JSON against expected shape; add a richer stub for dev
- **Insights panel** — Gemini flash integration styling and empty states

## General

- **Accessibility audit** — colour contrast across all three themes (WCAG AA), keyboard nav, focus rings
- **Animation consistency** — establish a motion scale (duration-fast / duration-base / duration-slow)
- **Font loading flash** — verify `display: swap` behaviour doesn't cause layout shift on first load
- **Error states** — design language for form errors, API failures, and empty states across themes
