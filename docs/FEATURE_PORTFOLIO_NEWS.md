# Feature Specification: Portfolio-Aware News Feed

**Status:** Planned
**Priority:** High (after Workflow #2)
**Target:** Q1 2026

---

## Overview

Transform the generic "What's new for your plan" news section into a Bloomberg Terminal-style portfolio news feed that shows real financial news about stocks, ETFs, and assets the user actually owns.

---

## User Story

**As a** user with cross-border investments
**I want to** see news specifically about the companies and assets I own
**So that** I can stay informed about my portfolio without checking multiple sources

---

## Current vs. New Implementation

### Current (Generic News)
```
User profile: US-Canada dual citizen with 401k and RRSP
    ↓
Perplexity Sonar Pro generates generic news:
    - "IRS releases foreign tax credit guidance"
    - "Bank of Canada holds rates steady"

Limitations:
- No connection to actual holdings
- LLM-generated (may be outdated or inaccurate)
- Same news for all US-Canada users
- Can't track specific investments
```

### New (Portfolio News)
```
User holdings: AAPL, TSLA, VGRO.TO, VOO
    ↓
Finnhub API fetches real news for each ticker:
    - [AAPL] "Apple announces Q4 earnings beat"
    - [TSLA] "Tesla recalls 2M vehicles"
    - [VGRO.TO] "Vanguard Growth ETF dividend increased"
    - [VOO] "S&P 500 reaches new all-time high"

Benefits:
✅ Ticker-specific, personalized news
✅ Real financial news from verified sources
✅ Updates when user adds/removes stocks
✅ Multi-asset support (stocks, ETFs, crypto, forex)
```

---

## Technical Architecture

### 1. Database Schema Changes

#### New Table: `user_holdings`
```sql
create table user_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  ticker varchar(20) not null,
  asset_type varchar(20) default 'stock', -- 'stock', 'etf', 'crypto', 'forex'
  quantity decimal(20,8),
  purchase_price decimal(20,2),
  purchase_date date,
  account_id uuid, -- future: link to specific 401k/RRSP account
  notes text,
  created_at timestamptz default now(),

  -- Performance optimization
  unique(user_id, ticker)
);

-- Index for fast user lookup
create index idx_holdings_user on user_holdings(user_id);
```

#### New Table: `user_portfolio_news`
```sql
create table user_portfolio_news (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  ticker varchar(20) not null,
  headline text not null,
  summary text,
  source varchar(100),
  url text,
  published_at timestamptz,
  fetched_at timestamptz default now(),

  -- Prevent duplicates
  unique(user_id, ticker, headline, published_at)
);

-- Index for efficient queries
create index idx_portfolio_news_user on user_portfolio_news(user_id, fetched_at desc);
```

---

### 2. News API Selection

#### Recommended: **Finnhub**

**Why Finnhub?**
- ✅ **Free tier:** 60 API calls/minute (3,600/hour)
- ✅ **Global coverage:** US, Canadian, UK, Asian markets
- ✅ **Multi-asset:** Stocks, ETFs, crypto, forex news
- ✅ **Company-specific:** Filtered by ticker symbol
- ✅ **Real-time:** News within minutes of publication
- ✅ **Metadata rich:** Source, category, sentiment

**Endpoint:**
```bash
GET https://finnhub.io/api/v1/company-news
?symbol=AAPL
&from=2026-02-24
&to=2026-03-03
&token=YOUR_API_KEY
```

**Response Example:**
```json
[
  {
    "category": "company news",
    "datetime": 1709481600,
    "headline": "Apple Announces Q1 Earnings Beat",
    "id": 12345,
    "image": "https://...",
    "related": "AAPL",
    "source": "Bloomberg",
    "summary": "Apple Inc. reported quarterly earnings...",
    "url": "https://bloomberg.com/..."
  }
]
```

#### Alternative APIs

| API | Free Tier | Best For | Notes |
|-----|-----------|----------|-------|
| **Alpha Vantage** | 500 req/day | US stocks | Limited news, focus on market data |
| **Polygon.io** | Limited | High-quality data | Expensive after free tier |
| **NewsAPI** | 100 req/day | General news | Keyword search, not ticker-specific |

---

### 3. N8N Workflow Design

**Workflow #3: Portfolio News Aggregator**

#### Nodes Overview:
```
1. Webhook Trigger (POST from Next.js)
2. Supabase: Fetch user holdings
3. Code: Extract ticker list
4. Split In Batches (5 tickers at a time)
5. HTTP Request: Finnhub company-news API
6. Code: Parse and normalize response
7. Merge: Combine all ticker results
8. Code: Remove duplicates, sort by date
9. (Optional) HTTP Request: LLM relevance scoring
10. Supabase: Cache results in user_portfolio_news
11. Respond to Webhook
```

#### Detailed Flow:

**Node 1: Webhook Trigger**
- **URL:** `https://jbassil.app.n8n.cloud/webhook/portfolio-news`
- **Method:** POST
- **Body:** `{ "user_id": "uuid", "force_refresh": false }`

**Node 2: Supabase - Fetch Holdings**
```javascript
SELECT ticker, asset_type
FROM user_holdings
WHERE user_id = '{{ $json.user_id }}'
```

**Node 3: Code - Extract Tickers**
```javascript
const tickers = $input.all().map(item => item.json.ticker);
return [{ json: { tickers } }];
```

**Node 4: Split In Batches**
- Batch size: 5 (respect rate limits)
- Loop enabled

**Node 5: HTTP Request - Finnhub**
```javascript
URL: https://finnhub.io/api/v1/company-news
Method: GET
Query Parameters:
  symbol: {{ $json.ticker }}
  from: {{ $now.minus({ days: 7 }).toFormat('yyyy-MM-dd') }}
  to: {{ $now.toFormat('yyyy-MM-dd') }}
  token: {{ $env.FINNHUB_API_KEY }}
```

**Node 6: Code - Normalize Response**
```javascript
const items = $input.all();
return items.map(item => ({
  json: {
    ticker: item.json.related,
    headline: item.json.headline,
    summary: item.json.summary,
    source: item.json.source,
    url: item.json.url,
    published_at: new Date(item.json.datetime * 1000).toISOString()
  }
}));
```

**Node 7: Merge**
- Combine all batches

**Node 8: Code - Deduplicate & Sort**
```javascript
const allNews = $input.all();
const unique = new Map();

allNews.forEach(item => {
  const key = `${item.json.ticker}-${item.json.headline}`;
  if (!unique.has(key)) {
    unique.set(key, item.json);
  }
});

const sorted = Array.from(unique.values())
  .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  .slice(0, 20); // Top 20 most recent

return [{ json: { items: sorted } }];
```

**Node 9 (Optional): LLM Relevance Scoring**
```javascript
// Use OpenRouter to score relevance to user's profile
// Add 'relevance_score' field (0-100)
// Filter out low-scoring news (< 50)
```

**Node 10: Supabase - Cache Results**
```sql
INSERT INTO user_portfolio_news
  (user_id, ticker, headline, summary, source, url, published_at)
VALUES
  ({{ $json.user_id }}, {{ $json.ticker }}, ...)
ON CONFLICT (user_id, ticker, headline, published_at) DO NOTHING
```

**Node 11: Respond to Webhook**
```javascript
{
  "items": [/* sorted news array */],
  "cached": false,
  "fetched_at": "2026-03-03T10:30:00Z"
}
```

---

### 4. API Endpoint Changes

#### Update: `/app/api/portfolio-news/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { forceRefresh } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [], error: "Not authenticated" });
  }

  // Check cache (refresh every 30 minutes)
  if (!forceRefresh) {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("user_portfolio_news")
      .select("*")
      .eq("user_id", user.id)
      .gte("fetched_at", thirtyMinsAgo)
      .order("published_at", { ascending: false })
      .limit(20);

    if (cached && cached.length > 0) {
      return NextResponse.json({ items: cached, cached: true });
    }
  }

  // Call N8N workflow
  const n8nUrl = process.env.N8N_PORTFOLIO_NEWS_WEBHOOK_URL;

  if (!n8nUrl) {
    // Fallback: Return empty or stub data
    return NextResponse.json({ items: [], stub: true });
  }

  try {
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, force_refresh: forceRefresh }),
    });

    const data = await res.json();
    return NextResponse.json({ items: data.items ?? [] });
  } catch (err) {
    console.error("Portfolio news fetch error:", err);
    return NextResponse.json({ items: [], error: "Failed to fetch news" });
  }
}
```

#### New: `/app/api/holdings/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch user's holdings
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ holdings: [] });
  }

  const { data, error } = await supabase
    .from("user_holdings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ holdings: [], error: error.message });
  }

  return NextResponse.json({ holdings: data });
}

// POST: Add new holding
export async function POST(req: NextRequest) {
  const { ticker, quantity, purchase_price, asset_type } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_holdings")
    .insert({
      user_id: user.id,
      ticker: ticker.toUpperCase(),
      quantity,
      purchase_price,
      asset_type: asset_type || 'stock',
      purchase_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ holding: data });
}

// DELETE: Remove holding
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("user_holdings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns this holding

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

---

### 5. Frontend Components

#### New: `components/PortfolioNewsPanel.tsx`

**Features:**
- Display news grouped by ticker or chronologically
- Show ticker badges on each news item
- "Add Stock" button to track new holdings
- Auto-refresh when holdings change
- Empty state when no holdings exist

**Example UI:**
```
┌─────────────────────────────────────────┐
│ Portfolio News            [Refresh]     │
├─────────────────────────────────────────┤
│ [AAPL] Apple announces Q4 earnings...   │
│ Source: Bloomberg • 2h ago              │
├─────────────────────────────────────────┤
│ [TSLA] Tesla recalls 2M vehicles...     │
│ Source: Reuters • 4h ago                │
├─────────────────────────────────────────┤
│ [+ Add Stock]                           │
└─────────────────────────────────────────┘
```

#### New: `components/AddStockModal.tsx`

**Features:**
- Stock ticker autocomplete (using Finnhub symbol search)
- Quantity and purchase price (optional)
- Asset type selector (Stock, ETF, Crypto)
- Form validation

---

## Implementation Phases

### Phase 1: Database & API Foundation
**Goal:** Set up portfolio tracking infrastructure

**Tasks:**
- [ ] Create `user_holdings` table in Supabase
- [ ] Create `user_portfolio_news` table in Supabase
- [ ] Build `/api/holdings` endpoint (GET, POST, DELETE)
- [ ] Sign up for Finnhub API (free tier)
- [ ] Test Finnhub company-news endpoint

**Deliverable:** Users can add/remove stocks via API

---

### Phase 2: N8N Workflow
**Goal:** Build news aggregation workflow

**Tasks:**
- [ ] Create Workflow #3 in N8N
- [ ] Add webhook trigger
- [ ] Configure Supabase connection
- [ ] Add Finnhub HTTP requests
- [ ] Implement deduplication logic
- [ ] Test with sample tickers (AAPL, TSLA, VGRO.TO)
- [ ] Add error handling and fallbacks

**Deliverable:** N8N workflow returns ticker-specific news

---

### Phase 3: Frontend UI
**Goal:** User-facing portfolio management

**Tasks:**
- [ ] Build `AddStockModal` component
- [ ] Build `PortfolioNewsPanel` component
- [ ] Replace current NewsPanel with PortfolioNewsPanel
- [ ] Add ticker autocomplete (Finnhub symbol search)
- [ ] Implement empty state (no holdings)
- [ ] Add loading states and error handling

**Deliverable:** Users can manage portfolio and see news in UI

---

### Phase 4: Enhancements
**Goal:** Polish and optimization

**Tasks:**
- [ ] Add relevance scoring (LLM filters low-quality news)
- [ ] Implement stock price display (current value)
- [ ] Add performance tracking (gain/loss %)
- [ ] Enable grouping toggle (by ticker vs. chronological)
- [ ] Add news categories filter (earnings, M&A, product launches)
- [ ] Implement push notifications for breaking news

**Deliverable:** Production-ready portfolio news system

---

## Success Metrics

**User Engagement:**
- Users add average 5+ holdings
- News panel clicked 3x per session
- 80% of users add at least 1 stock within first week

**Technical Performance:**
- News fetch < 2 seconds for 10 holdings
- Cache hit rate > 70% (30-minute TTL)
- API rate limit never exceeded

**Content Quality:**
- 90% of news items published within 24 hours
- No duplicate headlines shown
- All URLs resolve successfully

---

## Open Questions

1. **Should we auto-import holdings from Plaid?**
   - Plaid returns positions for linked accounts
   - Could auto-populate portfolio without manual entry
   - Privacy concern: user may not want to track all holdings

2. **How to handle international tickers?**
   - Toronto Stock Exchange: `VGRO.TO`
   - London Stock Exchange: `BP.L`
   - Finnhub supports most exchanges

3. **Should we show crypto news?**
   - User holds BTC, ETH, etc.
   - Finnhub supports crypto news
   - Highly volatile, may overwhelm feed

4. **Relevance scoring: necessary?**
   - LLM scores each news item's importance
   - Filters out low-priority articles
   - Adds latency and cost

---

## Dependencies

**External Services:**
- Finnhub API (or alternative news provider)
- N8N (Workflow #3)
- Supabase (new tables)

**Internal Prerequisites:**
- Workflow #2 (Financial Plan) completed
- N8N fundamentals understood
- Portfolio tracking UI designed

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Finnhub rate limits | Can't fetch news for >60 tickers/min | Implement batching, use cache |
| News API cost | Free tier exceeded | Monitor usage, upgrade plan if needed |
| User adds 100+ stocks | Slow performance | Limit to 50 holdings, warn user |
| No news for some tickers | Empty feed | Fallback to market news or ETF news |

---

## Future Enhancements

1. **News sentiment analysis** - Show bullish/bearish indicators
2. **Alerts** - Push notifications for breaking news about holdings
3. **Summary digest** - Daily email with top 5 portfolio news items
4. **Social sentiment** - Reddit/Twitter mentions for meme stocks
5. **AI insights** - "What this means for your portfolio" summaries

---

## Conclusion

This feature transforms Prestige Worldwide from a static financial planning tool into a dynamic, personalized financial dashboard that keeps users engaged with real-time, portfolio-specific news.

**Next Steps:**
1. Complete Workflow #2 (Financial Plan)
2. Begin Phase 1 (Database setup)
3. Build N8N Workflow #3 (Portfolio News)
