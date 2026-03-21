# N8N Workflows

> **Note:** N8N is used as an optional middleware layer. New features call OpenRouter directly from Next.js API routes. These workflows remain in production for the existing chat and AI proxy paths.

---

## Overview

| Workflow | Purpose | Production Webhook | Vercel Endpoint |
|----------|---------|-------------------|-----------------|
| AI Chat | Streaming chat with plan context | `https://jbassil.app.n8n.cloud/webhook/ai-chat` | `/api/chat` |
| AI Proxy | Generic OpenRouter proxy | `https://jbassil.app.n8n.cloud/webhook/financial-plan` | `/api/ai-proxy` |
| Plan Generation | AI financial plans with market data | `https://jbassil.app.n8n.cloud/webhook/plan-generation` | `/api/plan` (legacy) |

---

## Prerequisites

### API Keys

| Service | Purpose | Where to Get |
|---------|---------|--------------|
| OpenRouter | AI models | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Alpha Vantage | Market data | [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key) |
| Supabase | Database access | Supabase dashboard → Settings → API |
| Plaid | Bank account data | [dashboard.plaid.com](https://dashboard.plaid.com) |

### N8N Setup

```bash
# Self-hosted (Docker)
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Or use n8n.cloud (easiest)
# Sign up at https://n8n.cloud
```

### N8N Environment Variables

Set in N8N Cloud → Settings → Environments:

```
OPENROUTER_API_KEY=sk-or-v1-...
ALPHA_VANTAGE_API_KEY=your_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
```

### Vercel Environment Variables

```
N8N_CHAT_WEBHOOK_URL=https://jbassil.app.n8n.cloud/webhook/ai-chat
N8N_AI_PROXY_WEBHOOK_URL=https://jbassil.app.n8n.cloud/webhook/financial-plan
```

---

## Workflow 1: AI Chat

**Flow:** `Webhook → Code (build prompt) → HTTP Request (OpenRouter) → Respond`

### Node 1: Webhook
- Path: `/webhook/ai-chat`
- Method: POST
- Respond: When Last Node Finishes
- Response Data: First Entry JSON

### Node 2: Code — Process Request

```javascript
const { messages, planContext } = $input.first().json.body;

const systemPrompt = planContext
  ? `You are a helpful cross-border financial planning assistant for Prestige Worldwide.
The user's current financial plan context:

${JSON.stringify(planContext, null, 2)}

Answer questions about their plan, explain recommendations, and provide general guidance. Always note you are not a licensed financial adviser.`
  : "You are a helpful cross-border financial planning assistant.";

return {
  json: {
    model: "anthropic/claude-3.5-haiku",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ]
  }
};
```

### Node 3: HTTP Request — OpenRouter
- Method: POST
- URL: `https://openrouter.ai/api/v1/chat/completions`
- Auth: Header — `Authorization: Bearer {{ $env.OPENROUTER_API_KEY }}`
- Headers: `Content-Type: application/json`, `HTTP-Referer: https://prestigeworldwide.app`
- Body: `{{ $json }}`

---

## Workflow 2: AI Proxy

**Flow:** `Webhook → Extract Variables → Build Request → HTTP Request (OpenRouter) → Respond`

### Node 1: Webhook
- Path: `/webhook/financial-plan`
- Method: POST
- Respond: When Last Node Finishes

### Node 2: Code — Extract Variables

```javascript
const input = $input.first().json;
const body = input.body || input;

return {
  json: {
    messages: body.messages || [],
    model: body.model || 'anthropic/claude-3.5-haiku',
    max_tokens: body.max_tokens || 1000
  }
};
```

### Node 3: Code — Build Request Body

```javascript
const input = $input.first().json;

return {
  json: {
    requestBody: {
      model: input.model,
      max_tokens: input.max_tokens,
      messages: input.messages
    }
  }
};
```

### Node 4: HTTP Request — OpenRouter
- Method: POST
- URL: `https://openrouter.ai/api/v1/chat/completions`
- Auth: Header — `Authorization: Bearer {{ $env.OPENROUTER_API_KEY }}`
- Headers: `Content-Type: application/json`, `HTTP-Referer: https://prestigeworldwide.app`
- Body Content Type: Raw/Custom (`application/json`)
- Body: `{{ JSON.stringify($json.requestBody) }}`

---

## Workflow 3: Financial Plan Generation

> **Note:** New plan generation calls OpenRouter directly from `/api/plan/route.ts`. This workflow is the legacy path and remains in production but is not the primary implementation path going forward.

**Flow:** `Webhook → Extract Input → Fetch Market Data (Supabase) → Build Prompt → Call OpenRouter → Format Response`

### Node 1: Webhook
- Path: `plan-generation`
- Method: POST
- Respond: When Last Node Finishes
- Response Data: First Entry JSON

**Expected Input:**
```json
{
  "countries": ["US", "CA"],
  "residenceCountry": "US",
  "retirementCountry": "CA",
  "retirementYear": 2055,
  "accounts": [
    { "type": "401k", "countryCode": "US", "balanceUsd": 50000, "currency": "USD" },
    { "type": "RRSP", "countryCode": "CA", "balanceUsd": 30000, "currency": "CAD" }
  ],
  "notes": "Planning to move to Canada in 5 years"
}
```

### Node 2: Code — Extract & Validate

```javascript
const body = $input.first().json.body || $input.first().json;
const currentYear = new Date().getFullYear();
const yearsToRetirement = body.retirementYear ? body.retirementYear - currentYear : null;
const totalBalance = body.accounts.reduce((sum, acc) => sum + acc.balanceUsd, 0);

return {
  json: {
    userData: {
      ...body,
      yearsToRetirement,
      totalBalance
    }
  }
};
```

### Node 3: HTTP Request — Fetch Market Data
- Method: GET
- URL: `https://your-project.supabase.co/rest/v1/market_data`
- Auth: Header — `apikey` + `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`
- Query params: `select=*`, `order=date.desc`, `limit=1`

### Node 4: Code — Build AI Prompt

```javascript
const webhookData = $('Webhook').first().json.body;
const marketDataArray = $input.first().json;
const marketData = marketDataArray?.[0] || null;

const currentYear = new Date().getFullYear();
const yearsToRetirement = webhookData.retirementYear
  ? webhookData.retirementYear - currentYear
  : null;
const totalBalance = webhookData.accounts.reduce((sum, acc) => sum + acc.balanceUsd, 0);

const accountsSummary = webhookData.accounts.map(acc =>
  `- ${acc.type} in ${acc.countryCode}: $${acc.balanceUsd.toLocaleString()} ${acc.currency}`
).join('\n');

const marketContext = marketData ? `
CURRENT MARKET CONDITIONS (as of ${marketData.date}):
- S&P 500: $${marketData.sp500_close} (YTD: ${marketData.sp500_ytd_return}%)
- 10-Year Treasury: ${marketData.bond_yield_10y}%
- Inflation: ${marketData.inflation_rate}%
` : '';

const systemPrompt = `You are an expert cross-border financial planner.

USER PROFILE:
- Countries: ${webhookData.countries.join(', ')}
- Current residence: ${webhookData.residenceCountry}
- Retirement location: ${webhookData.retirementCountry}
- Years to retirement: ${yearsToRetirement ?? 'not specified'}

FINANCIAL POSITION:
${accountsSummary}
Total: $${totalBalance.toLocaleString()} USD

${webhookData.notes ? `NOTES: ${webhookData.notes}` : ''}
${marketContext}

Return JSON only (no markdown):
{
  "summary": "2-3 sentence summary",
  "metrics": {
    "netWorthUsd": ${totalBalance},
    "yearsToRetirement": ${yearsToRetirement},
    "projectedRetirementBalanceUsd": <7% CAGR projection>,
    "estimatedAnnualIncomeAtRetirement": <4% withdrawal>
  },
  "recommendations": [
    {"category": "Tax|Retirement|Currency|Estate", "priority": "high|medium|low", "text": "specific advice"}
  ],
  "disclaimer": "Standard disclaimer"
}

Provide 4-6 actionable recommendations.`;

return {
  json: {
    messages: [{ role: "user", content: systemPrompt }],
    model: "anthropic/claude-3.5-haiku",
    max_tokens: 2500,
    response_format: { type: "json_object" }
  }
};
```

### Node 5: Code — Call OpenRouter

```javascript
const requestBody = $input.first().json;
const OPENROUTER_API_KEY = $env.OPENROUTER_API_KEY;

const response = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://prestige-worldwide.com'
  },
  body: requestBody,
  json: true
});

const planData = JSON.parse(response.choices[0].message.content);

return {
  json: {
    plan: planData,
    usage: response.usage
  }
};
```

### Node 6: Code — Format Response

```javascript
const { plan, usage } = $input.first().json;

return {
  json: {
    success: true,
    data: plan,
    metadata: {
      generated_at: new Date().toISOString(),
      tokens_used: usage?.total_tokens || 0,
      model: "anthropic/claude-3.5-haiku"
    }
  }
};
```

---

## Testing

### AI Chat
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

### AI Proxy
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/financial-plan \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}], "model": "anthropic/claude-3.5-haiku", "max_tokens": 150}'
```

### Plan Generation
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/plan-generation \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["US", "CA"],
    "residenceCountry": "US",
    "retirementCountry": "CA",
    "retirementYear": 2055,
    "accounts": [
      {"type": "401k", "countryCode": "US", "balanceUsd": 50000, "currency": "USD"},
      {"type": "RRSP", "countryCode": "CA", "balanceUsd": 30000, "currency": "CAD"}
    ],
    "notes": "Planning to move to Canada in 5 years"
  }'
```

### Via Vercel Endpoints
```bash
# Chat
curl -X POST https://prestige-worldwide-kappa.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

# AI Proxy
curl -X POST https://prestige-worldwide-kappa.vercel.app/api/ai-proxy \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}], "model": "anthropic/claude-3.5-haiku", "max_tokens": 150}'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Webhook 404 "not registered" | Make sure workflow is **Published** (not just saved) |
| Webhook returns "started" but no response | Change Respond setting to "When Last Node Finishes"; set Response Data to "First Entry JSON" |
| Auth error on HTTP Request | Verify `OPENROUTER_API_KEY` is set in N8N env vars; format must be `Bearer {{ $env.OPENROUTER_API_KEY }}` |
| Messages missing content | Check Node 2 reads `body.messages`; verify input data structure |
| JSON parse failed | Use `JSON.stringify()` when building request bodies; ensure `Content-Type: application/json` |
| Alpha Vantage rate limit | 25 calls/day — cache market data, don't refetch on every plan |
| N8N timeout | Default 5 min — increase in Settings → Executions → Timeout |
| Supabase RLS blocking | Use service_role key (bypasses RLS) |
