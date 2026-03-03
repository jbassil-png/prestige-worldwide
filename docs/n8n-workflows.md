# N8N Workflows Documentation

This document describes all N8N workflows used in Prestige Worldwide.

---

## Overview

| Workflow | Purpose | Production URL | Vercel API Endpoint |
|----------|---------|----------------|---------------------|
| AI Chat | Streaming chat responses | `https://jbassil.app.n8n.cloud/webhook/ai-chat` | `/api/chat` |
| AI Proxy | Generic OpenRouter proxy | `https://jbassil.app.n8n.cloud/webhook/financial-plan` | `/api/ai-proxy` |

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

## Next Workflows to Build

1. **Plan Generation** - Complex multi-step workflow with market data fetching
2. **Daily Insight** - Scheduled workflow to generate daily insights
3. **News Feed** - Fetch and curate personalized news

---

## Resources

- [N8N Documentation](https://docs.n8n.io)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
