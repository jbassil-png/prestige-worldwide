# Market Data Integration - Alpha Vantage

## Overview

Prestige Worldwide now integrates with **Alpha Vantage** to fetch real-time market data for financial planning. This provides realistic projections based on current S&P 500, bond yields, inflation rates, and global market indices.

---

## ✅ What's Configured

1. **Alpha Vantage API Key**: `SW2REBLWPLDHLVN5` (added to `.env.local`)
2. **Database Schema**: `market_data` table ready in Supabase
3. **Fetcher Scripts**: Two scripts created for data population
4. **NPM Scripts**: Easy commands to fetch/seed data

---

## 📊 Database Schema

The `market_data` table stores daily market snapshots:

| Column | Type | Description |
|--------|------|-------------|
| `date` | date | Trading day (unique) |
| `sp500_close` | decimal | S&P 500 closing price (SPY ETF) |
| `sp500_ytd_return` | decimal | Year-to-date return percentage |
| `bond_yield_10y` | decimal | 10-year Treasury yield |
| `inflation_rate` | decimal | Current inflation rate |
| `msci_world_close` | decimal | MSCI World Index (VT ETF) |
| `msci_world_ytd_return` | decimal | MSCI World YTD return |
| `fetched_at` | timestamptz | When data was fetched |

---

## 🚀 Usage

### Option 1: Fetch Live Data from Alpha Vantage

```bash
npm run fetch-market-data
```

**What it does:**
- Fetches real-time quotes for SPY (S&P 500), VT (MSCI World)
- Retrieves 10-year Treasury yield
- Respects API rate limits (5 calls/minute for free tier)
- Stores data in Supabase `market_data` table

**Alpha Vantage API Endpoints Used:**
- `GLOBAL_QUOTE` - Stock/ETF prices
- `TREASURY_YIELD` - 10-year Treasury data

**Expected Output:**
```
📊 Fetching market data from Alpha Vantage...

🔍 Fetching S&P 500 (SPY)...
✅ SPY: $580.25 (+0.45%)
⏳ Waiting 12 seconds (API rate limit)...

🔍 Fetching 10-Year Treasury Yield...
✅ 10-Year Treasury: 4.25%
⏳ Waiting 12 seconds (API rate limit)...

🔍 Fetching MSCI World (VT ETF)...
✅ VT: $125.50 (+0.32%)

📥 Storing data in Supabase...
✅ Market data stored successfully!
```

---

### Option 2: Seed with Sample Data (Development)

```bash
npm run seed-market-data
```

**What it does:**
- Generates 30 days of realistic market data
- Perfect for development and testing
- No API calls needed
- Immediate results

**Use this when:**
- You want to test the system without API calls
- You're developing offline
- You've hit API rate limits
- You need historical data for testing

---

## 🔧 How It Works

### 1. Alpha Vantage API

**Free Tier Limits:**
- 5 API calls per minute
- 25 calls per day (adjustable with premium)

**Our Script Behavior:**
- Waits 12 seconds between calls (safe buffer)
- Handles rate limit errors gracefully
- Provides fallback values if APIs fail

### 2. Data Flow

```
Alpha Vantage API
      ↓
fetch-market-data.ts
      ↓
Supabase market_data table
      ↓
Financial Planning AI
      ↓
Personalized Recommendations
```

### 3. Automation (Optional)

Set up a cron job or GitHub Action to fetch data daily:

```yaml
# .github/workflows/fetch-market-data.yml
name: Fetch Market Data
on:
  schedule:
    - cron: '0 16 * * 1-5' # 4 PM UTC, Mon-Fri (after US market close)
  workflow_dispatch: # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run fetch-market-data
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ALPHA_VANTAGE_API_KEY: ${{ secrets.ALPHA_VANTAGE_KEY }}
```

---

## 📈 Using Market Data in Your App

### Read Latest Market Data

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get latest market data
const { data, error } = await supabase
  .from('market_data')
  .select('*')
  .order('date', { ascending: false })
  .limit(1)
  .single();

if (data) {
  console.log(`S&P 500: $${data.sp500_close}`);
  console.log(`YTD Return: ${data.sp500_ytd_return}%`);
  console.log(`10Y Bond: ${data.bond_yield_10y}%`);
}
```

### Use in Financial Planning

The AI plan generator can now reference real market data:

```typescript
// In your plan generation logic
const marketData = await supabase
  .from('market_data')
  .select('*')
  .order('date', { ascending: false })
  .limit(1)
  .single();

const prompt = `
Generate a financial plan with this context:
- Current S&P 500: ${marketData.data.sp500_close}
- YTD Return: ${marketData.data.sp500_ytd_return}%
- Bond Yield: ${marketData.data.bond_yield_10y}%
- Inflation: ${marketData.data.inflation_rate}%

User portfolio: ${userBalances}
...
`;
```

---

## 🛠️ Troubleshooting

### Rate Limit Errors

```
⚠️  API rate limit reached for SPY
```

**Solution:** Wait 1 minute or use `npm run seed-market-data` for testing

### Network Errors

```
❌ Failed to fetch SPY: TypeError: fetch failed
```

**Solution:** Check internet connection and API key

### Database Errors

```
❌ Failed to store market data: <error>
```

**Solution:** Verify Supabase credentials in `.env.local`

---

## 🔐 Security Notes

- ✅ API key is in `.env.local` (gitignored)
- ✅ Service role key never exposed to browser
- ✅ Market data table has RLS enabled
- ✅ Read-only access for authenticated users

---

## 📚 Additional Resources

- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Alpha Vantage API Key Management](https://www.alphavantage.co/support/#api-key)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)

---

## 🎯 Next Steps

1. **Run the seeder** to populate your database:
   ```bash
   npm run seed-market-data
   ```

2. **Test in your app** by viewing market data in the dashboard

3. **Set up daily fetching** with a cron job or GitHub Action

4. **Enhance the AI prompts** to reference market conditions

5. **Add market insights** to the daily spotlight feature

---

## 💡 Ideas for Enhancement

- **Historical Analysis**: Store 1+ year of data for trend analysis
- **Market Alerts**: Notify users of significant market moves
- **Custom Indices**: Track specific sectors relevant to user portfolio
- **Correlation Analysis**: Compare portfolio performance vs. market
- **Volatility Metrics**: Calculate VIX or standard deviation
- **International Markets**: Add FTSE, DAX, Nikkei for global users

---

**Status:** ✅ Fully configured and ready to use!
