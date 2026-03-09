# N8N Workflows Documentation

This document describes all N8N workflows used in Prestige Worldwide.

---

## Overview

| Workflow | Purpose | Production URL | Vercel API Endpoint |
|----------|---------|----------------|---------------------|
| AI Chat | Streaming chat responses | `https://jbassil.app.n8n.cloud/webhook/ai-chat` | `/api/chat` |
| AI Proxy | Generic OpenRouter proxy | `https://jbassil.app.n8n.cloud/webhook/financial-plan` | `/api/ai-proxy` |
| **Plan Generation** | **AI financial plans with market data** | `https://jbassil.app.n8n.cloud/webhook-test/plan-generation` | `/api/plan/generate` |

---

## Workflow 1: AI Chat

**Purpose:** Handle streaming AI chat requests with conversation context

**Flow:**
```
Webhook → Code Node → HTTP Request (OpenRouter) → Respond
```

**Configuration:**

### Node 1: Webhook
- **Path:** `/webhook/ai-chat`
- **Method:** POST
- **Respond:** When Last Node Finishes
- **Response Data:** First Entry JSON

### Node 2: Code - Process Request
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

### Node 3: HTTP Request
- **Method:** POST
- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer {{ $env.OPENROUTER_API_KEY }}`
- **Send Headers:** ON
  - `Content-Type`: `application/json`
  - `HTTP-Referer`: `https://prestigeworldwide.app`
- **Send Body:** ON
- **Body Content Type:** JSON
- **Specify Body:** Using JSON
- **JSON:** `{{ $json }}`

---

## Workflow 2: AI Proxy

**Purpose:** Generic proxy for any OpenRouter model/request

**Flow:**
```
Webhook → Extract Variables → Build Request → HTTP Request (OpenRouter) → Respond
```

**Configuration:**

### Node 1: Webhook
- **Path:** `/webhook/financial-plan`
- **Method:** POST
- **Respond:** When Last Node Finishes
- **Response Data:** All Entries (or First Entry JSON)

### Node 2: Code - Extract Variables
```javascript
// Extract data from the body field
const input = $input.first().json;
const body = input.body || input;

// Get the request parameters
const messages = body.messages || [];
const model = body.model || 'anthropic/claude-3.5-haiku';
const maxTokens = body.max_tokens || 1000;

// Return the clean data
return {
  json: {
    messages: messages,
    model: model,
    max_tokens: maxTokens
  }
};
```

### Node 3: Code - Build Request Body
```javascript
// Get the data from Node 2
const input = $input.first().json;

// Build the OpenRouter request body
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

### Node 4: HTTP Request
- **Method:** POST
- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer {{ $env.OPENROUTER_API_KEY }}`
- **Send Headers:** ON
  - `Content-Type`: `application/json`
  - `HTTP-Referer`: `https://prestigeworldwide.app`
- **Send Body:** ON
- **Body Content Type:** Raw/Custom
- **Content Type:** `application/json`
- **Body:** `{{ JSON.stringify($json.requestBody) }}`

---

## Environment Variables (N8N)

Set these in N8N Cloud → Settings → Environments:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Environment Variables (Vercel)

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
N8N_CHAT_WEBHOOK_URL=https://jbassil.app.n8n.cloud/webhook/ai-chat
N8N_AI_PROXY_WEBHOOK_URL=https://jbassil.app.n8n.cloud/webhook/financial-plan
```

---

## Testing Workflows

### Test Plan Generation (Direct to N8N)
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook-test/plan-generation \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["US", "CA"],
    "residenceCountry": "US",
    "retirementCountry": "CA",
    "currentAge": 35,
    "retirementAge": 55,
    "accounts": [
      {
        "type": "401k",
        "country": "US",
        "balanceUsd": 50000,
        "currency": "USD"
      },
      {
        "type": "RRSP",
        "country": "CA",
        "balanceUsd": 30000,
        "currency": "CAD"
      }
    ],
    "goals": ["tax", "retirement", "moveproof"],
    "notes": "Planning to move to Canada in 5 years"
  }'
```

### Test AI Chat (Direct to N8N)
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Test AI Proxy (Direct to N8N)
```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/financial-plan \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "anthropic/claude-3.5-haiku",
    "max_tokens": 150
  }'
```

### Test via Vercel Endpoints
```bash
# Chat
curl -X POST https://prestige-worldwide-kappa.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'

# AI Proxy
curl -X POST https://prestige-worldwide-kappa.vercel.app/api/ai-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "anthropic/claude-3.5-haiku",
    "max_tokens": 150
  }'
```

---

## Troubleshooting

### Webhook returns 404 "not registered"
- Make sure workflow is **Published** (not just saved)
- Check the webhook URL matches exactly

### Webhook returns "Workflow was started" but no response
- Change webhook **Respond** setting to "When Last Node Finishes"
- Make sure **Response Data** is set to "First Entry JSON" or "All Entries"

### HTTP Request fails with auth error
- Verify `OPENROUTER_API_KEY` is set in N8N environment variables
- Make sure Authorization header format is: `Bearer {{ $env.OPENROUTER_API_KEY }}`

### Messages missing content field
- Check that data extraction in Node 2 properly reads `body.messages`
- Verify the input data structure matches what N8N receives

### JSON parsing failed
- Use `JSON.stringify()` when building request bodies
- Make sure Content-Type header is set to `application/json`

---

## Workflow 3: Financial Plan Generation

**Purpose:** Generate comprehensive, personalized cross-border financial plans using real-time market data and AI

**Flow:**
```
Webhook → Extract/Validate Input → Fetch Market Data (Supabase) → Build AI Prompt → Call OpenRouter API → Parse & Format Response
```

**Configuration:**

### Node 1: Webhook
- **Path:** `/webhook-test/plan-generation`
- **Method:** POST
- **Respond:** When Last Node Finishes
- **Response Data:** First Entry JSON

**Expected Input:**
```json
{
  "countries": ["US", "CA"],
  "residenceCountry": "US",
  "retirementCountry": "CA",
  "currentAge": 35,
  "retirementAge": 55,
  "accounts": [
    {
      "type": "401k",
      "country": "US",
      "balanceUsd": 50000,
      "currency": "USD"
    },
    {
      "type": "RRSP",
      "country": "CA",
      "balanceUsd": 30000,
      "currency": "CAD"
    }
  ],
  "goals": ["tax", "retirement", "moveproof"],
  "notes": "Planning to move to Canada in 5 years"
}
```

### Node 2: Code - Extract & Validate Input
```javascript
const body = $input.first().json.body || $input.first().json;

// Calculate derived fields
const yearsToRetirement = body.retirementAge - body.currentAge;
const totalBalance = body.accounts.reduce((sum, acc) => sum + acc.balanceUsd, 0);

// Build clean user data object
const userData = {
  countries: body.countries,
  residenceCountry: body.residenceCountry,
  retirementCountry: body.retirementCountry,
  currentAge: body.currentAge,
  retirementAge: body.retirementAge,
  yearsToRetirement,
  accounts: body.accounts,
  totalBalance,
  goals: body.goals,
  notes: body.notes || ''
};

return { json: { userData } };
```

### Node 3: HTTP Request - Fetch Market Data
- **Method:** GET
- **URL:** `https://your-project.supabase.co/rest/v1/market_data`
- **Authentication:** Header Auth
  - **Name:** `apikey`
  - **Value:** `YOUR_SUPABASE_ANON_KEY`
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_SUPABASE_ANON_KEY`
- **Query Parameters:**
  - `select`: `*`
  - `order`: `date.desc`
  - `limit`: `1`

**Output:** Latest market data (S&P 500, bonds, inflation, etc.)

### Node 4: Code - Build AI Prompt
```javascript
// Get userData from webhook and market data from previous HTTP node
const webhookData = $('Webhook').first().json.body;
const marketDataArray = $input.first().json;
const marketData = marketDataArray && marketDataArray.length > 0 ? marketDataArray[0] : null;

// Calculate derived fields
const yearsToRetirement = webhookData.retirementAge - webhookData.currentAge;
const totalBalance = webhookData.accounts.reduce((sum, acc) => sum + acc.balanceUsd, 0);

const userData = {
  ...webhookData,
  yearsToRetirement,
  totalBalance
};

// Build account summary
const accountsSummary = userData.accounts.map(acc =>
  `- ${acc.type} in ${acc.country}: $${acc.balanceUsd.toLocaleString()} ${acc.currency}`
).join('\n');

// Build goals summary
const goalMap = {
  "tax": "Minimize double taxation",
  "retirement": "Maximize retirement income",
  "estate": "Estate planning",
  "currency": "Currency strategy",
  "moveproof": "Build a move-proof plan"
};
const goalsSummary = userData.goals.map(g => goalMap[g] || g).join(', ');

// Build market context
const marketContext = marketData ? `
CURRENT MARKET CONDITIONS (as of ${marketData.date}):
- S&P 500: $${marketData.sp500_close} (YTD: ${marketData.sp500_ytd_return}%)
- 10-Year Treasury Yield: ${marketData.bond_yield_10y}%
- Inflation Rate: ${marketData.inflation_rate}%
${marketData.msci_world_close ? `- MSCI World Index: $${marketData.msci_world_close} (YTD: ${marketData.msci_world_ytd_return}%)` : ''}
` : '';

// Build comprehensive prompt
const systemPrompt = `You are an expert cross-border financial planner.

USER PROFILE:
- Countries: ${userData.countries.join(', ')}
- Current residence: ${userData.residenceCountry}
- Retirement location: ${userData.retirementCountry}
- Age: ${userData.currentAge} → Target retirement: ${userData.retirementAge}
- Years to retirement: ${userData.yearsToRetirement}

FINANCIAL POSITION:
${accountsSummary}
Total: $${userData.totalBalance.toLocaleString()} USD

GOALS: ${goalsSummary}

${userData.notes ? `NOTES: ${userData.notes}` : ''}

${marketContext}

Create a financial plan as JSON (no markdown):
{
  "summary": "2-3 sentence summary",
  "metrics": {
    "netWorthUsd": ${userData.totalBalance},
    "yearsToRetirement": ${userData.yearsToRetirement},
    "projectedRetirementBalanceUsd": <7% growth projection>,
    "estimatedAnnualIncomeAtRetirement": <4% withdrawal>
  },
  "recommendations": [
    {"category": "Tax|Retirement|Currency|Estate", "priority": "high|medium|low", "text": "specific advice"}
  ],
  "disclaimer": "Standard disclaimer text"
}

Provide 4-6 actionable recommendations.`;

return {
  json: {
    messages: [{ role: "user", content: systemPrompt }],
    model: "anthropic/claude-3.5-sonnet",
    max_tokens: 2500
  }
};
```

### Node 5: Code - Call OpenRouter API
```javascript
// Get the prompt data from previous node
const requestBody = $input.first().json;

// Your OpenRouter API key
const OPENROUTER_API_KEY = "sk-or-v1-...";

// Make the API call using n8n's HTTP helper
const response = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://prestige-worldwide.com',
    'X-Title': 'Prestige Worldwide Financial Planner'
  },
  body: requestBody,
  json: true
});

// Extract the AI response
const aiResponse = response.choices[0].message.content;

// Parse the JSON response from AI
let planData;
try {
  planData = JSON.parse(aiResponse);
} catch (e) {
  // If AI didn't return pure JSON, try to extract it
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  planData = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response", raw: aiResponse };
}

return {
  json: {
    plan: planData,
    rawResponse: aiResponse,
    usage: response.usage
  }
};
```

### Node 6: Code - Format Response
```javascript
// Get the plan data
const planData = $input.first().json.plan;
const usage = $input.first().json.usage;

// Return formatted response
return {
  json: {
    success: true,
    data: planData,
    metadata: {
      generated_at: new Date().toISOString(),
      tokens_used: usage?.total_tokens || 0,
      model: "anthropic/claude-3.5-sonnet"
    }
  }
};
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Cross-border retirement strategy focusing on building tax-efficient retirement savings in both countries while preparing for a move to Canada in 5 years...",
    "metrics": {
      "netWorthUsd": 80000,
      "yearsToRetirement": 20,
      "projectedRetirementBalanceUsd": 310847,
      "estimatedAnnualIncomeAtRetirement": 12434
    },
    "recommendations": [
      {
        "category": "Tax",
        "priority": "high",
        "text": "Maximize 401k contributions before moving to Canada..."
      },
      {
        "category": "Currency",
        "priority": "high",
        "text": "Begin gradual conversion of US investments to Canadian dollar denominated assets..."
      }
    ],
    "disclaimer": "This financial plan is for informational purposes only..."
  },
  "metadata": {
    "generated_at": "2026-03-09T01:02:56.781Z",
    "tokens_used": 775,
    "model": "anthropic/claude-3.5-sonnet"
  }
}
```

---

## Next Workflows to Build

1. **Daily Insight** - Scheduled workflow to generate daily insights
2. **News Feed** - Fetch and curate personalized news
3. **Balance Refresh** - Scheduled Plaid account sync

---

## Resources

- [N8N Documentation](https://docs.n8n.io)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
