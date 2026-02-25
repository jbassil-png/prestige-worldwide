# n8n Workflow Setup Guide

Complete guide for building all 3 n8n workflows for Prestige Worldwide Financial Planning.

## Prerequisites

### 1. API Keys Needed

| Service | Purpose | Get Key From | Free Tier |
|---------|---------|--------------|-----------|
| **Alpha Vantage** | Market data (S&P 500, bonds) | [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key) | 25 calls/day |
| **OpenRouter** | AI plan generation & chat | [openrouter.ai/keys](https://openrouter.ai/keys) | Pay-per-use, ~$0.01/request |
| **Supabase** | Database access | Your Supabase dashboard → Settings → API | Generous free tier |
| **Plaid** | Bank account data | [dashboard.plaid.com](https://dashboard.plaid.com) | Sandbox free |

### 2. n8n Setup

```bash
# Self-hosted (Docker)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or use n8n.cloud (easiest)
# Sign up at https://n8n.cloud
```

### 3. Environment Variables

Add these to n8n Settings → Environments:

```bash
ALPHA_VANTAGE_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # or 'development', 'production'
```

---

## Workflow 1: Plan Generation with Market Data

**Trigger URL:** `N8N_WEBHOOK_URL`
**Purpose:** Generate personalized financial plans using real market data

### Node Configuration

#### 1. Webhook Trigger
- **Type:** Webhook
- **HTTP Method:** POST
- **Path:** `/plan/generate`
- **Authentication:** None (handled by your Next.js app)
- **Response Mode:** Respond When Last Node Finishes

**Expected Input:**
```json
{
  "userId": "uuid",
  "countries": ["US", "UK"],
  "accounts": [
    {"name": "401k", "balance": 150000, "type": "retirement"},
    {"name": "Checking", "balance": 25000, "type": "cash"}
  ],
  "goals": ["retire-early", "buy-home", "education-fund"],
  "ages": {"current": 35, "retirement": 55},
  "riskTolerance": "moderate"
}
```

#### 2. Set Variables
- **Type:** Set
- **Mode:** Manual Mapping

**Variables:**
```javascript
{
  "userId": "={{ $json.userId }}",
  "countries": "={{ $json.countries }}",
  "totalBalance": "={{ $json.accounts.reduce((sum, acc) => sum + acc.balance, 0) }}",
  "retirementBalance": "={{ $json.accounts.filter(a => a.type === 'retirement').reduce((sum, acc) => sum + acc.balance, 0) }}",
  "cashBalance": "={{ $json.accounts.filter(a => a.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0) }}"
}
```

#### 3. HTTP Request: Fetch Market Data (Alpha Vantage)
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `https://www.alphavantage.co/query`
- **Query Parameters:**
  - `function`: `GLOBAL_QUOTE`
  - `symbol`: `SPY` (S&P 500 ETF)
  - `apikey`: `{{ $env.ALPHA_VANTAGE_API_KEY }}`

**Output Mapping:**
```javascript
{
  "sp500_close": "={{ $json['Global Quote']['05. price'] }}",
  "sp500_change_percent": "={{ $json['Global Quote']['10. change percent'].replace('%', '') }}"
}
```

#### 4. HTTP Request: Fetch Bond Yields
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `https://www.alphavantage.co/query`
- **Query Parameters:**
  - `function`: `TREASURY_YIELD`
  - `interval`: `daily`
  - `maturity`: `10year`
  - `apikey`: `{{ $env.ALPHA_VANTAGE_API_KEY }}`

**Output Mapping:**
```javascript
{
  "bond_yield_10y": "={{ $json.data[0].value }}"
}
```

#### 5. Supabase: Insert Market Data
- **Type:** Supabase
- **Operation:** Insert
- **Table:** `market_data`
- **Credentials:** Use service_role key

**Fields:**
```json
{
  "date": "={{ new Date().toISOString().split('T')[0] }}",
  "sp500_close": "={{ $node['HTTP Request: Fetch Market Data'].json.sp500_close }}",
  "sp500_ytd_return": "={{ $node['HTTP Request: Fetch Market Data'].json.sp500_change_percent }}",
  "bond_yield_10y": "={{ $node['HTTP Request: Fetch Bond Yields'].json.bond_yield_10y }}"
}
```

**Options:**
- On Conflict: `date` → Do Nothing (ignore duplicates)

#### 6. Function: Build AI Prompt
- **Type:** Code (JavaScript)
- **Mode:** Run Once for All Items

```javascript
const userData = $input.first().json;
const marketData = $node['HTTP Request: Fetch Market Data'].json;

const prompt = `You are a certified financial planner. Generate a personalized financial plan.

## User Profile
- Countries: ${userData.countries.join(', ')}
- Current Age: ${userData.ages.current}
- Retirement Age: ${userData.ages.retirement}
- Total Assets: $${userData.totalBalance.toLocaleString()}
- Risk Tolerance: ${userData.riskTolerance}

## Current Market Conditions (${new Date().toISOString().split('T')[0]})
- S&P 500: $${marketData.sp500_close} (YTD: ${marketData.sp500_change_percent}%)
- 10-Year Treasury: ${marketData.bond_yield_10y}%

## Goals
${userData.goals.map(g => `- ${g}`).join('\n')}

## Instructions
1. **Asset Allocation:** Recommend portfolio mix based on age and risk tolerance
2. **Realistic Projections:** Use CURRENT market returns (not historical 10% averages)
3. **Tax Optimization:** Consider multi-country tax implications
4. **Milestones:** Set 5-year checkpoints with specific targets
5. **Risk Management:** Address market volatility and sequence of returns risk

**Return JSON format:**
{
  "summary": "Brief 2-3 sentence overview",
  "asset_allocation": {
    "stocks": 70,
    "bonds": 25,
    "cash": 5
  },
  "projections": {
    "retirement_age": 55,
    "projected_balance": 1200000,
    "annual_income": 48000,
    "probability_of_success": 85
  },
  "recommendations": [
    {"action": "Increase 401k contribution", "priority": "high", "impact": "15% faster retirement"},
    {"action": "Open Roth IRA", "priority": "medium", "impact": "Tax-free growth"}
  ],
  "milestones": [
    {"age": 40, "target_balance": 400000, "action": "Review allocation"},
    {"age": 45, "target_balance": 700000, "action": "Increase bonds"}
  ]
}`;

return [{ json: { prompt, userId: userData.userId } }];
```

#### 7. HTTP Request: OpenRouter (Claude)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** Bearer Token
- **Token:** `{{ $env.OPENROUTER_API_KEY }}`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "HTTP-Referer": "https://prestige-worldwide.app",
  "X-Title": "Prestige Worldwide Financial Planning"
}
```

**Body:**
```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "messages": [
    {
      "role": "user",
      "content": "={{ $json.prompt }}"
    }
  ],
  "temperature": 0.7,
  "response_format": { "type": "json_object" }
}
```

#### 8. Function: Parse AI Response
- **Type:** Code (JavaScript)
- **Mode:** Run Once for All Items

```javascript
const aiResponse = $input.first().json;
const planJson = JSON.parse(aiResponse.choices[0].message.content);

// Add metadata
planJson.generated_at = new Date().toISOString();
planJson.model = 'claude-sonnet-4-5';
planJson.user_id = $node['Function: Build AI Prompt'].json.userId;

return [{ json: planJson }];
```

#### 9. Supabase: Insert Plan History
- **Type:** Supabase
- **Operation:** Insert
- **Table:** `plan_history`

**Fields:**
```json
{
  "user_id": "={{ $json.user_id }}",
  "plan": "={{ $json }}",
  "trigger_reason": "onboarding",
  "market_snapshot": "={{ $node['HTTP Request: Fetch Market Data'].json }}",
  "balance_snapshot": "={{ $node['Set Variables'].json }}"
}
```

#### 10. Respond to Webhook
- **Type:** Respond to Webhook
- **Status Code:** 200
- **Body:** `{{ $json }}`

---

## Workflow 2: Chat with Plan Context

**Trigger URL:** `N8N_CHAT_WEBHOOK_URL`
**Purpose:** Answer user questions about their plan using AI

### Node Configuration

#### 1. Webhook Trigger
- **Type:** Webhook
- **HTTP Method:** POST
- **Path:** `/plan/chat`
- **Response Mode:** Respond Using 'Respond to Webhook' Node

**Expected Input:**
```json
{
  "messages": [
    {"role": "user", "content": "What if I retire at 60 instead of 55?"}
  ],
  "planContext": {
    "asset_allocation": {"stocks": 70, "bonds": 25, "cash": 5},
    "projections": {"retirement_age": 55, "projected_balance": 1200000}
  }
}
```

#### 2. Function: Build Chat Prompt
- **Type:** Code (JavaScript)

```javascript
const { messages, planContext } = $input.first().json;

const systemPrompt = `You are a financial advisor helping a user understand their personalized financial plan.

## Current Plan Context
${JSON.stringify(planContext, null, 2)}

## Instructions
- Answer questions clearly and concisely
- Reference specific numbers from the plan
- Suggest adjustments if asked about scenarios
- Be encouraging but realistic
- Never provide investment advice (disclaimer)`;

return [{
  json: {
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  }
}];
```

#### 3. HTTP Request: OpenRouter (Streaming)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** Bearer Token
- **Response Format:** Stream

**Body:**
```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "messages": "={{ $json.messages }}",
  "stream": true
}
```

#### 4. Respond to Webhook
- **Type:** Respond to Webhook
- **Status Code:** 200
- **Response Mode:** Stream
- **Body:** `{{ $json }}`

---

## Workflow 3: Scheduled Balance Refresh

**Trigger:** Cron Schedule (Daily at 2am)
**Purpose:** Check Plaid balances, update DB, trigger plan regeneration if needed

### Node Configuration

#### 1. Schedule Trigger
- **Type:** Schedule Trigger
- **Trigger Times:** Cron: `0 2 * * *` (2am daily)
- **Timezone:** UTC

#### 2. Supabase: Get All Plaid Items
- **Type:** Supabase
- **Operation:** Get All
- **Table:** `plaid_items`
- **Return All:** Yes

#### 3. Loop Over Items
- **Type:** Split Out
- **Field Name:** `json`

#### 4. HTTP Request: Fetch Plaid Balances
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://{{ $env.PLAID_ENV }}.plaid.com/accounts/balance/get`
- **Authentication:** None (custom headers)

**Headers:**
```json
{
  "Content-Type": "application/json",
  "PLAID-CLIENT-ID": "{{ $env.PLAID_CLIENT_ID }}",
  "PLAID-SECRET": "={{ $env.PLAID_SECRET }}"
}
```

**Body:**
```json
{
  "access_token": "={{ $json.access_token }}"
}
```

#### 5. Function: Process Accounts
- **Type:** Code (JavaScript)
- **Mode:** Run Once for Each Item

```javascript
const { accounts } = $input.first().json;
const userId = $input.first().json.user_id;
const itemId = $input.first().json.id;

const processedAccounts = accounts.map(account => ({
  user_id: userId,
  plaid_item_id: itemId,
  account_id: account.account_id,
  account_name: account.name,
  account_type: account.type,
  account_subtype: account.subtype,
  current_balance: account.balances.current,
  available_balance: account.balances.available,
  currency: account.balances.iso_currency_code || 'USD'
}));

return processedAccounts.map(acc => ({ json: acc }));
```

#### 6. Supabase: Upsert User Accounts
- **Type:** Supabase
- **Operation:** Upsert
- **Table:** `user_accounts`
- **Conflict Columns:** `account_id`

**Fields:** Pass through from previous node

#### 7. Supabase: Insert Balance History
- **Type:** Supabase
- **Operation:** Insert
- **Table:** `user_balance_history`

**Fields:**
```json
{
  "user_id": "={{ $json.user_id }}",
  "account_id": "={{ $json.account_id }}",
  "account_name": "={{ $json.account_name }}",
  "balance_usd": "={{ $json.current_balance }}",
  "currency": "={{ $json.currency }}"
}
```

#### 8. Supabase: Check Balance Change
- **Type:** Supabase
- **Operation:** Execute SQL
- **Query:**

```sql
SELECT has_significant_balance_change(
  '{{ $json.user_id }}'::uuid,
  10.0
) as should_regenerate;
```

#### 9. IF: Balance Changed Significantly
- **Type:** IF
- **Condition:** `{{ $json.should_regenerate }}` equals `true`

#### 10. HTTP Request: Trigger Plan Regeneration
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{{ $env.NEXT_PUBLIC_APP_URL }}/api/plan/regenerate`

**Body:**
```json
{
  "userId": "={{ $json.user_id }}",
  "trigger": "balance_change"
}
```

#### 11. HTTP Request: Send Notification (Optional)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{{ $env.NEXT_PUBLIC_APP_URL }}/api/notifications/send`

**Body:**
```json
{
  "userId": "={{ $json.user_id }}",
  "type": "balance_change",
  "message": "Your balance has changed significantly. We've updated your financial plan."
}
```

---

## Testing Workflows

### Test Workflow 1 (Plan Generation)

```bash
curl -X POST http://localhost:5678/webhook/plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "countries": ["US"],
    "accounts": [
      {"name": "401k", "balance": 150000, "type": "retirement"}
    ],
    "goals": ["retire-early"],
    "ages": {"current": 35, "retirement": 55},
    "riskTolerance": "moderate"
  }'
```

### Test Workflow 2 (Chat)

```bash
curl -X POST http://localhost:5678/webhook/plan/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What if I retire at 60?"}
    ],
    "planContext": {
      "asset_allocation": {"stocks": 70, "bonds": 25, "cash": 5}
    }
  }'
```

### Test Workflow 3 (Manual Trigger)

Click "Execute Workflow" in n8n interface (or wait for scheduled run).

---

## Environment Configuration

### Update `.env.local` in Next.js app

```bash
# n8n Webhook URLs
N8N_WEBHOOK_URL=http://localhost:5678/webhook/plan/generate
N8N_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/plan/chat

# Or if using n8n.cloud:
# N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/plan/generate
# N8N_CHAT_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/plan/chat
```

---

## Deployment Checklist

- [ ] Run Supabase migration
- [ ] Get all API keys
- [ ] Configure n8n environment variables
- [ ] Build all 3 workflows
- [ ] Test each workflow individually
- [ ] Update Next.js `.env.local` with webhook URLs
- [ ] Deploy n8n to production (if self-hosted)
- [ ] Enable workflow activation in n8n
- [ ] Monitor first scheduled run
- [ ] Set up error notifications (optional)

---

## Troubleshooting

### API Rate Limits
- Alpha Vantage: 25 calls/day (cache market data, don't refetch on every plan)
- OpenRouter: No hard limit, pay-per-use

### Plaid Sandbox
- Sandbox accounts have fake data
- Use test credentials: `user_good` / `pass_good`

### n8n Timeout
- Default timeout: 5 minutes
- Increase in Settings → Executions → Timeout

### Supabase RLS
- Make sure service_role key is used (bypasses RLS)
- Check policies with: `SELECT * FROM pg_policies WHERE tablename = 'user_accounts';`

---

## Next Steps

Once workflows are running:
1. Build the Next.js API endpoints (`/api/plan/generate`, `/api/plan/chat`)
2. Create the frontend chat interface
3. Add Plaid Link integration for account connection
4. Set up monitoring and alerts
