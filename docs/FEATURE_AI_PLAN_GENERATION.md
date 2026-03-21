# Feature Spec: AI Plan Generation

**Status:** Design / Pre-implementation
**Last Updated:** 2026-03-21
**Priority:** High — this is the biggest functional gap between current state and a credible product

---

## The Problem

The current `/api/plan/route.ts` is a stub. It runs real math (net worth, CAGR projection, on-track status) but produces hardcoded recommendation strings with interpolated country names. Every user who is US+Canada sees the same Tax recommendation. The summary is a template sentence. There is no domain knowledge whatsoever.

The chat agent (`/api/chat`) is already powered by real AI and does a good job when users ask follow-up questions about their plan — but there is no actual plan for it to reference. It's answering questions about a stub document.

Fixing this is the unlock for the whole product.

---

## Guiding Constraints

### What AI should generate
- **The narrative summary** — 2-3 sentence overview of the user's specific situation
- **The recommendations** — structured array with category, priority, and specific text

### What code should keep calculating
- Net worth (sum of balances)
- Years to retirement (`retirementYear - currentYear`)
- Projected retirement balance (7% CAGR)
- Estimated annual income (4% rule)
- On-track status (projected vs. goal target)

These are math, not language. Keeping them deterministic means they can't hallucinate and the UI can always trust them.

The AI layer receives the calculated metrics as *context* and generates the narrative and recommendations *on top of* them. The two layers compose, they don't interleave.

---

## Architecture

```
POST /api/plan
      │
      ├─── calculateMetrics(input)          ← deterministic code, no AI
      │         returns: netWorth, projected, onTrack, yearsToRetirement
      │
      └─── generateAIPlan(input, metrics)   ← AI call
                returns: summary, recommendations[]

      Combined response returned to client
```

If the AI call fails, the API falls back to the existing stub-generated recommendations (same pattern as `/api/insight` and `/api/chat`). The metrics are always available — the dashboard never goes blank.

---

## The AI Call

### Endpoint
OpenRouter, same as the rest of the app. Uses `OPENROUTER_PLAN_MODEL` env var (falls back to `OPENROUTER_MODEL`, which defaults to `anthropic/claude-3.5-haiku`).

**Model recommendation:** Start with Haiku for cost/speed, upgrade to Sonnet if recommendation quality is thin. Cross-border tax treaty knowledge exists in both — Sonnet handles multi-country edge cases better.

### Output format
The AI must return **valid JSON**. Options:

1. **Prompt-based JSON** — ask for JSON in the prompt, parse it, validate structure, fall back to stub on parse failure. Simple, works today.
2. **OpenRouter JSON mode** — pass `response_format: { type: "json_object" }` in the request body. More reliable, supported by most models on OpenRouter.
3. **Structured outputs / function calling** — most reliable but overkill for this schema.

**Recommendation: Option 2** (JSON mode) as the primary path, with Option 1 as the fallback prompt pattern. JSON mode is already supported in OpenRouter for Claude and Gemini models.

### Expected output schema
```json
{
  "summary": "string — 2-3 sentences specific to the user's situation",
  "recommendations": [
    {
      "category": "Tax | Retirement | Currency | Estate | Investment",
      "priority": "high | medium | low",
      "text": "string — specific, actionable, references actual treaties/accounts/rules"
    }
  ]
}
```

The recommendations array should have 3-6 items. At minimum one per relevant category given the user's country combination.

---

## The Prompt

### System prompt
```
You are a cross-border financial planning specialist at Prestige Worldwide.
Generate a financial plan analysis as JSON. Be specific to the user's exact country
combination, account types, and situation. Do not give generic advice. Reference
specific tax treaties, account rules, and cross-border regulations by name.

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "recommendations": [
    { "category": "...", "priority": "...", "text": "..." }
  ]
}

Valid categories: Tax, Retirement, Currency, Estate, Investment
Valid priorities: high, medium, low
Aim for 3-6 recommendations. Today's date: [DATE]
```

### User prompt (structured context block)
```
Countries with assets: [e.g. United States, Canada]
Current residence: [e.g. United States]
Planned retirement country: [e.g. Canada]
Retirement target year: [e.g. 2047] (21 years away)

Accounts:
  US — 401(k): $185,000 USD
  US — IRA/Roth IRA: $47,000 USD
  CA — RRSP: $92,000 CAD (~$67,000 USD)
  CA — TFSA: $41,000 CAD (~$30,000 USD)

Calculated snapshot:
  Net worth: ~$329,000 USD
  Projected balance at retirement (7% CAGR): ~$1,243,000 USD
  Retirement goal target: $2,000,000 USD
  On-track status: off_track (projected is 62% of target)

User notes: [optional free text from the notes field]
```

**Privacy note:** We never send account names, institution names, or Plaid account IDs to the AI. We send account types and approximate balances — enough for the AI to reason about contribution room, tax treatment, and currency exposure.

### Key specificity the AI should deliver
By providing real country and account type combinations, the AI can reference things like:
- **US+CA:** The Canada-US tax treaty, RRSP/401k reciprocity, FBAR reporting obligations, foreign tax credits
- **UK+US:** The US-UK treaty, ISA treatment in the US (not tax-advantaged under US law), SIPP as foreign pension
- **SG+US:** FBAR thresholds, CPF treatment as foreign pension, no capital gains tax in SG
- **Retirement country change:** Relevant emigration rules, deemed disposition rules in Canada, OAS clawback thresholds

This is what makes the product valuable. The stub cannot do any of this.

---

## Prompt Engineering Considerations

### Tone and specificity
- Recommendations should be actionable, not aspirational. "Consider reviewing your tax treaty position" is bad. "The Canada-US tax treaty Article XVIII allows you to deduct RRSP contributions in your US return — ensure this election is filed by April 15" is good.
- Short recommendations (1-3 sentences) work better for the card UI than long paragraphs.
- Priorities should reflect genuine urgency relative to the user's timeline and situation — not all high.

### Hallucination risk
Cross-border tax law is complex and changes. Known risks:
- The AI may cite treaty articles that don't exist or have changed
- Specific thresholds (contribution limits, clawback amounts) may be outdated or wrong

Mitigations:
- The disclaimer ("not financial advice, consult qualified professionals") is already in every plan
- We should add "do not cite specific dollar thresholds or article numbers unless you are certain" to the system prompt — better to say "the treaty provides for X" than "under Article XVIII(7), the limit is $X"
- Geographic advisors (when built) will be the deeper expertise layer where specifics are more appropriate

### Consistency across regenerations
If the user refreshes their plan with the same data, recommendations should be directionally consistent. Add a note to the system prompt: "Be consistent — do not change recommendations randomly. New information warrants new recommendations."

---

## When Plans Regenerate

The `plan_history` table already has a `trigger_reason` column. Triggers:

| Event | trigger_reason | Notes |
|---|---|---|
| Onboarding completion | `onboarding` | Always |
| User clicks "Refresh plan" | `user_request` | On demand |
| Profile update (countries, retirement year) | `scheduled` | Via `/api/profile` PUT |
| Balance change >10% | `balance_change` | Detected by balance history check |
| Scheduled check-in | `scheduled` | Future: cron job |

**Plans should NOT regenerate on every page load.** The dashboard reads the latest plan from `user_plans`, it does not call `/api/plan` on load. Plan generation is an intentional event.

---

## Relationship to the Chat Agent

The plan generation and the chat agent are complementary, not competing:

- **Plan generation** (`/api/plan`): runs once per trigger event, produces a structured document stored in Supabase. Expensive AI call, cached result.
- **Chat agent** (`/api/chat`): runs on every message, takes the plan as context, answers follow-up questions in real time.

The chat agent already receives `planContext` in its system prompt. Once plan generation is real, the chat agent's responses will be dramatically better because they'll be grounded in actual recommendations rather than the stub.

**Implication for advisors:** The geographic AI advisors (Phase 4) will be specialised chat agents — not separate plan generators. They read from the same plan document the chat agent reads, but with country-specific system prompts and personas. This is why getting plan generation right first is the prerequisite.

---

## Implementation Steps

**Do not implement until this spec is agreed on.**

When ready, changes are limited to one file and one pattern:

1. **`app/api/plan/route.ts`**
   - Add `generateAIPlan(input, metrics)` function that calls OpenRouter with JSON mode
   - Add Zod (or manual) validation of the AI response schema
   - If AI call succeeds: return `{ ...metrics, ...aiOutput }`
   - If AI call fails: fall back to `buildStubPlan()` (existing function, keep it)
   - Log which path was taken for debugging

2. **Environment variables** (add to `.env.example`)
   - `OPENROUTER_PLAN_MODEL` — model to use for plan generation (optional, falls back to `OPENROUTER_MODEL`)

3. **Testing**
   - Unit test: `calculateMetrics()` with various inputs
   - Integration test: `/api/plan` with `OPENROUTER_API_KEY` set, validate response schema
   - Integration test: `/api/plan` without API key, confirm stub fallback

No database changes required. No frontend changes required — the plan schema is already flexible enough to hold real AI content.

---

## Open Questions

These should be resolved before implementation:

1. **Model:** Start with Haiku or go straight to Sonnet? Haiku is ~10x cheaper and 3x faster. The question is whether it has sufficient cross-border tax knowledge. Suggest: start with Haiku, have a test prompt ready with a known US+CA case, evaluate quality.

2. **JSON mode vs. prompt-only:** OpenRouter JSON mode is the safe default. But some models (especially smaller/cheaper ones) may handle it inconsistently. Do we want a validation + retry loop, or just single-attempt with fallback?

3. **Context depth — market data:** The `market_data` table exists and has daily snapshots (treasury yields, equity returns). Should we inject current market conditions into the plan prompt? e.g. "Current 10-year treasury yield: 4.5%, S&P trailing return: 12.3%". This would make recommendations more timely. Adds complexity but aligns with the "Today's spotlight" insight.

4. **How many recommendations:** 3-6 feels right for the card UI. Should we specify a minimum per category when the user has relevant accounts? e.g. always a Tax rec, always a Retirement rec if retirement goal is set.

5. **Streaming:** Plan generation currently returns a complete JSON response. We could stream the summary text for a faster perceived response on the onboarding completion screen. Worth it? The loading animation covers most of the wait time.

---

## Sequencing in the Overall Roadmap

This is the correct implementation order given the dependencies:

```
AI Plan Generation  ←── enables real chat context, unblocks advisors
        ↓
Re-entry Flows + Goal/Account Editing  ←── user can come back and update
        ↓
Theming (onboarding integration)       ←── discuss now, build later
        ↓
Goal-Account Linking + Check-in Emails ←── product depth
        ↓
Geographic AI Advisors                 ←── builds on real plan + themes
```
