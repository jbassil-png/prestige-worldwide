<div align="center">

# Prestige Worldwide

**Financial planning without borders.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://prestige-worldwide-kappa.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Live Demo](https://prestige-worldwide-kappa.vercel.app) • [Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation)

</div>

---

## Overview

Prestige Worldwide is an AI-powered personal finance tool for people with assets, retirement accounts, or tax obligations spanning multiple countries — expats, dual citizens, cross-border workers, and international retirees.

### Key Highlights

- 🌍 **Multi-country support** — US, CA, GB, and more with country-specific account types
- 🏦 **Real bank connectivity** — Plaid integration for live account data
- 🤖 **AI-powered planning** — Personalized financial recommendations using Claude and Gemini
- 💱 **Multi-currency** — View balances in any currency with live exchange rates
- 📈 **Portfolio news** — Ticker-specific news for stocks and ETFs you own, powered by Alpha Vantage
- 💬 **Streaming chat** — Ask questions about your plan in real-time

---

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone and install
git clone https://github.com/yourusername/prestige-worldwide.git
cd prestige-worldwide
npm install

# 2. Set up environment
cp .env.example .env.local
# Add your Supabase credentials (required - see Prerequisites)

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring! The app works in demo mode with no additional credentials required.

> **Note:** Without API keys, the app gracefully falls back to mock data, demo accounts, and stub responses. You can explore all features without configuring external services.

### Try the Demo

Want to see the dashboard without signing up? Use the demo account:

- **URL:** [https://prestige-worldwide-kappa.vercel.app](https://prestige-worldwide-kappa.vercel.app)
- **Click:** "Try Demo" button on the landing page
- **Credentials:** Pre-filled automatically (or use `demo@prestigeworldwide.com` / `demo123456`)

The demo account includes sample cross-border financial data to showcase all features.

---

## Features

### Core Functionality

| Feature | Description | Status |
|---------|-------------|--------|
| **Multi-country onboarding** | Select countries and account types (401k, RRSP, TFSA, ISA, SIPP, CPF, Superannuation, etc.) | ✅ Production |
| **Bank account connectivity** | Link real accounts via Plaid (US, CA, GB) or enter balances manually | ✅ Production |
| **AI financial plan** | Personalized recommendations across retirement, tax, currency, and estate planning | ✅ Production |
| **Plan detail & history** | Expanded plan view with filters, account breakdown, and last 10 historical plans | ✅ Production |
| **Account management** | Remove accounts, view balance history, per-account recommendations | ✅ Production |
| **User settings** | Update residence/retirement countries and ages; auto-regenerates plan on change | ✅ Production |
| **Portfolio news feed** | Ticker-specific news for owned stocks/ETFs with sentiment scores (Alpha Vantage) | ✅ Production |
| **Daily AI spotlight** | Fresh insights each day based on your specific plan | ✅ Production |
| **Streaming AI chat** | Ask questions about your plan with real-time responses | ✅ Production |
| **Currency toggle** | View all balances in residence, retirement, or native currencies | ✅ Production |
| **Demo mode** | Showcase features with sample data for presentations | ✅ Production |
| **Analytics tracking** | PostHog integration for key user actions | ✅ Production |

### Developer Experience

- ✅ **Works without credentials** — Every external service has stub/mock fallbacks for local development
- ✅ **TypeScript throughout** — Full type safety across the entire codebase
- ✅ **Modern stack** — Next.js 16, React 19, Tailwind CSS
- ✅ **Mobile responsive** — Optimized for all screen sizes
- ✅ **Comprehensive error handling** — User-friendly error messages with proper fallbacks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS (custom `brand` colour scale) |
| Auth & Database | Supabase |
| Bank Connectivity | Plaid |
| AI Orchestration | n8n (webhooks) |
| LLM Provider | OpenRouter (Claude, Gemini Flash, Perplexity Sonar Pro) |
| Analytics | PostHog |
| FX Rates | exchangerate-api.com |
| Market & News Data | Alpha Vantage |
| Deployment | Vercel |

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ and npm installed
- **A Supabase account** (required) — [Sign up free](https://supabase.com)
- **Git** for version control

**Optional but recommended:**
- Plaid account for bank connectivity — [Get sandbox credentials](https://dashboard.plaid.com)
- OpenRouter API key for AI features — [Get key](https://openrouter.ai/keys)
- Alpha Vantage API key for portfolio news — [Get free key](https://www.alphavantage.co/support/#api-key)
- PostHog account for analytics — [Sign up](https://posthog.com)

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your credentials:

```bash
cp .env.example .env.local
```

**Required (Supabase):**
```env
# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Optional (but recommended):**
```env
# Plaid (bank connectivity) — Get from: https://dashboard.plaid.com
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox

# OpenRouter (AI features) — Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=anthropic/claude-3.5-haiku

# Alpha Vantage (portfolio news + market data) — Get from: https://www.alphavantage.co
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# PostHog (analytics) — Get from: https://app.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# FX rates (currency conversion) — Get from: https://www.exchangerate-api.com
FX_API_KEY=your_fx_api_key
```

See [`.env.example`](.env.example) for all available configuration options.

### 3. Set Up Supabase Database

Run these SQL commands in your Supabase SQL Editor:

**`user_plans` table:**
```sql
create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan jsonb not null,
  created_at timestamptz default now()
);
```

**`user_news` table:**
```sql
create table user_news (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  items jsonb not null,
  fetched_at timestamptz default now()
);
```

**`plaid_items` table:**
```sql
create table plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  access_token text not null,
  institution text
);
```

**`user_profiles` table** (run migration `20260320_add_user_profiles.sql`):
```sql
-- See supabase/migrations/20260320_add_user_profiles.sql
```

**`user_holdings` + `user_portfolio_news` tables** (run migration `20260320_add_portfolio_news.sql`):
```sql
-- See supabase/migrations/20260320_add_portfolio_news.sql
```

> **Tip:** All migrations in `supabase/migrations/` can be run directly in the Supabase SQL Editor. They include RLS policies and indexes.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app in action!

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run mobile tests
npm run test:mobile

# Run mobile tests with UI
npm run test:ui

# Fetch live market data (requires ALPHA_VANTAGE_API_KEY)
npm run fetch-market-data

# Seed market data to Supabase
npm run seed-market-data
```

### Project Structure

```
app/
├── page.tsx                     # Public marketing landing page
├── (auth)/                      # Sign-in and sign-up pages
├── onboarding/                  # 3-step onboarding wizard
├── dashboard/                   # Main authenticated dashboard
├── settings/                    # User profile & country management
├── accounts/
│   └── [id]/                    # Individual account detail + balance history
├── plan/
│   ├── page.tsx                 # Full plan detail view with filters
│   └── history/                 # Last 10 historical plans (expandable)
└── api/
    ├── plan/                    # Generate / regenerate financial plan
    ├── plan/chat/               # Streaming plan chat
    ├── plan/regenerate/         # Manual plan refresh
    ├── chat/                    # Streaming AI chat
    ├── holdings/                # GET/POST/DELETE user portfolio tickers
    ├── portfolio-news/          # Ticker-specific news (Alpha Vantage)
    ├── accounts/[id]/           # Account CRUD (DELETE = remove)
    ├── profile/                 # GET/PUT user profile
    ├── ai-proxy/                # Generic AI proxy (N8N → OpenRouter)
    ├── insight/                 # Daily spotlight insight
    ├── news/                    # LLM-generated plan news (demo mode)
    ├── fx/                      # Live exchange rates
    ├── balance-refresh/         # Refresh Plaid account balances
    └── plaid/                   # Plaid Link token + token exchange
components/
├── PortfolioNewsPanel.tsx       # Holdings management + ticker news feed
├── NewsPanel.tsx                # LLM news (demo mode only)
├── PlanView.tsx                 # Financial snapshot (clickable metrics)
├── ChatPanel.tsx                # Streaming chat UI
└── CurrencyToggle.tsx           # Residence / retirement / native currency
lib/supabase/                    # Supabase client helpers (browser + server)
supabase/migrations/             # SQL migrations (run in Supabase SQL Editor)
middleware.ts                    # Auth guard for /dashboard and /onboarding
```

### Key Features Implementation

**Authentication Flow:**
- Supabase Auth handles sign-up, sign-in, and password reset
- Middleware protects authenticated routes (`/dashboard`, `/onboarding`)
- Automatic redirects for authenticated users attempting to access auth pages

**Financial Plan Generation:**
- Real-time market data integration (S&P 500, Treasury yields, inflation, MSCI World)
- Cross-border financial analysis for multiple countries
- Personalized recommendations across Tax, Retirement, Currency, and Estate planning
- Powered by Claude 3.5 Sonnet via OpenRouter

**Bank Connectivity:**
- Plaid Link integration for US, CA, GB banks
- Sandbox mode for development and testing
- Fallback to manual balance entry if Plaid is unavailable

---

## AI Services

| Feature | Service | Model | Status |
|---|---|---|---|
| **Financial plan** | **n8n → Supabase (market data) → OpenRouter** | **`claude-3.5-sonnet`** | **✅ Production** |
| Chat | n8n → OpenRouter → stub | `claude-3.5-haiku` | ⚠️ Stub |
| AI Proxy (generic) | n8n → OpenRouter | configurable | ✅ Production |
| Daily insight | OpenRouter | `gemini-flash-1.5` | ⚠️ Stub |
| News feed | OpenRouter | `perplexity/sonar-pro` | ⚠️ Stub |

All AI endpoints degrade gracefully if API keys are missing, falling back to mock data.

### Testing the Plan Generation Endpoint

```bash
curl -X POST https://jbassil.app.n8n.cloud/webhook/plan-generation \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["US", "CA"],
    "residenceCountry": "US",
    "retirementCountry": "CA",
    "currentAge": 35,
    "retirementAge": 55,
    "accounts": [{"type": "401k", "country": "US", "balanceUsd": 50000, "currency": "USD"}],
    "goals": ["tax", "retirement"],
    "notes": "Planning to move"
  }'
```

---

## Plaid Integration

The Plaid integration is fully implemented for real bank account connectivity.

**Setup:**
1. Create a free account at [dashboard.plaid.com](https://dashboard.plaid.com)
2. Copy your **Client ID** and **Sandbox Secret**
3. Add them to `.env.local`:
   ```env
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_sandbox_secret
   PLAID_ENV=sandbox
   ```

**Without Plaid credentials:**
- Onboarding falls back to two hardcoded demo accounts (Chase 401k and TD RRSP)
- A visible warning banner indicates mock data mode
- All features remain functional with simulated account data

---

## Deployment

### Deploying to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables:**
   - Add all required environment variables from `.env.local`
   - Ensure `NEXT_PUBLIC_*` variables are properly prefixed

4. **Deploy:**
   - Vercel will automatically build and deploy your app
   - Production URL will be provided

**Environment Variables Required for Production:**
- All Supabase credentials
- Plaid credentials (if using real bank connectivity)
- OpenRouter API key (for AI features)
- PostHog keys (for analytics)
- FX API key (for live exchange rates)

---

## Troubleshooting

### Common Issues

**"Supabase client error" on startup:**
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`
- ✅ Ensure Supabase tables are created (see Step 3 in Getting Started)
- ✅ Check Supabase project is active in your dashboard

**Plaid Link modal doesn't open:**
- ✅ Check `PLAID_CLIENT_ID` and `PLAID_SECRET` are set
- ✅ Verify `PLAID_ENV=sandbox` is configured
- ✅ Check browser console for Plaid errors
- ✅ Ensure no ad blockers are interfering

**AI plan generation returns errors:**
- ✅ If using n8n: Verify `N8N_WEBHOOK_URL` is accessible
- ✅ If using OpenRouter fallback: Check `OPENROUTER_API_KEY` is valid
- ✅ Review API rate limits and quotas
- ✅ Check browser network tab for specific error messages

**Currency conversion shows "N/A":**
- ✅ Set `FX_API_KEY` in `.env.local` for live rates
- ✅ Without the key, hardcoded approximate rates are used
- ✅ Verify exchangerate-api.com is accessible

**Portfolio news panel shows empty (no news items):**
- ✅ Add at least one ticker via the `+ Add ticker` input in the news panel
- ✅ Set `ALPHA_VANTAGE_API_KEY` in `.env.local` for live news (stubs shown without it)
- ✅ Alpha Vantage free tier: 25 requests/day — cached for 30 min per user

**Legacy LLM news panel empty (demo mode only):**
- ✅ Add `OPENROUTER_API_KEY` to enable AI-curated news in demo mode
- ✅ Without the key, stub news items are shown automatically

### Need More Help?

- 📖 Check the [docs/](docs/) folder for detailed guides
- 🐛 [Open an issue](https://github.com/yourusername/prestige-worldwide/issues) for bug reports
- 💬 [Start a discussion](https://github.com/yourusername/prestige-worldwide/discussions) for questions

---

## Production Status

**Current Version:** Live on Vercel
**Last Updated:** March 20, 2026
**Status:** Feature-Rich MVP 🚀

### What's Working

- ✅ Complete authentication flow (sign-up, sign-in, password reset)
- ✅ 3-step onboarding wizard with Plaid integration
- ✅ AI-powered financial plan generation with market data
- ✅ Plan detail view with recommendation filters and account breakdown
- ✅ Plan history (last 10 plans, expandable, trigger reason badges)
- ✅ Account management (remove accounts, view balance history, per-account recommendations)
- ✅ User settings (update countries + ages, auto-regenerates plan)
- ✅ Portfolio news feed (ticker chips, Alpha Vantage NEWS_SENTIMENT, sentiment scores)
- ✅ Real-time streaming chat with Claude
- ✅ Multi-currency support with live FX rates
- ✅ Demo mode for presentations
- ✅ Analytics tracking with PostHog
- ✅ Mobile-responsive design
- ✅ Loading skeletons and error boundaries on all key pages

### Known Limitations

- Plaid in sandbox mode (demo accounts only)
- N8N integration optional (falls back to OpenRouter)
- Alpha Vantage free tier: 25 requests/day (30-min cache mitigates this)
- Manual market data fetching (automation planned)

### Roadmap

- 🎨 **Onboarding redesign** — 4-step wizard with theme selection (Swiss Alps Retreat, Gaudy Miami, Clooney's Positano) ← **IN PROGRESS**
- 🤖 **AI plan generation** — Replace stub recommendations with real OpenRouter/Claude calls (JSON mode, model-swappable via env var)
- 🔁 **Re-entry flows** — "Update my setup" from dashboard; same onboarding wizard pre-populated with existing data
- 🌍 **Geographic AI advisors** — Country-specific personas with localised expertise (depends on theming + AI plan gen)
- 🧪 **Testing infrastructure** — Vitest unit + integration tests
- ✅ ~~Goals, check-ins & progressive onboarding~~ **COMPLETE** (2026-03-21)
- ✅ ~~Portfolio-aware news feed~~ **COMPLETE** (2026-03-20)
- ✅ ~~Account management & detail views~~ **COMPLETE** (2026-03-20)

See [docs/BACKLOG.md](docs/BACKLOG.md) for full feature backlog.

---

## 📋 MVP Checklist - Landing Page Improvements

**Status:** ✅ Phase 1 Complete (March 19, 2026)
**Goal:** Make landing page review-ready for sharing with investors, advisors, and potential users

### Phase 1: Critical for Review-Ready ✅ COMPLETE

- ✅ **Fix footer links** - Create Privacy Policy, Terms of Service, Contact pages
- ✅ **Handle testimonials section** - Add disclaimer or remove placeholder testimonials
- ✅ **Add demo mode CTA** - "Try Demo" button in Hero for easy access without signup
- ✅ **Add SEO meta tags** - Title, description, Open Graph tags for sharing
- ✅ **Create demo account** - Demo account created and live (demo@prestigeworldwide.com)
- ✅ **Update documentation** - README with demo account instructions

### Phase 2: Pre-Launch Enhancements (Planned)

- Add trust signals (security badges, integration logos)
- Add product screenshots/visuals
- Add FAQ section
- Replace placeholder testimonials with real user feedback

### Phase 3: Post-Launch Optimizations (Future)

- A/B test headlines and CTAs
- Add video demo
- Add interactive elements
- Email capture for newsletter

**Deployment Strategy Decision:** Keeping landing page in same Next.js monorepo on Vercel for:
- Simplified deployment and maintenance
- Shared design system and components
- Seamless auth flow from landing → signup → dashboard
- Next.js automatic code-splitting already optimizes bundle size

**Note:** Current landing page is functional but requires Phase 1 improvements before widely sharing. Dashboard is production-ready and available at `/dashboard` (authentication required).

---

## Recent Improvements

### Dashboard UX Enhancements (March 2026)

**Account Management Visibility:**
- Prominent "Your Financial Snapshot" header above metrics
- Connected account count with green checkmark badge
- "Manage accounts" button with settings icon for easy access
- Clear data source attribution showing Plaid sync status

**Currency Toggle Improvements:**
- Custom CSS tooltips with dark background and high contrast
- Smooth fade-in animations for better visibility
- Tooltips positioned to avoid browser frame conflicts
- Clear explanations of what each currency mode displays

**Demo Mode for Presentations:**
- Introduction banner explaining Prestige Worldwide's value proposition
- Feature overview panel highlighting key capabilities
- Demo news items showcasing news feed functionality
- Helpful guidance for chat interactions

**Error Handling & Security:**
- Comprehensive API error handling across all endpoints
- User-friendly error messages with proper context
- Security audit: API keys, authentication protection, input validation
- Graceful degradation when services are unavailable

**Mobile Testing Infrastructure (March 2026):**
- Automated E2E testing with Playwright
- 50+ test scenarios across 8 mobile/tablet devices
- iOS (iPhone SE, 12, 13, 14 Pro Max) and Android (Pixel, Galaxy) coverage
- Performance monitoring (load times, resource optimization, page weight)
- Responsive design validation and accessibility checks
- Touch interaction and mobile UX testing
- Comprehensive documentation and CI/CD ready

---

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check [existing issues](https://github.com/yourusername/prestige-worldwide/issues) first
2. Include clear steps to reproduce
3. Add screenshots if applicable
4. Specify your environment (OS, browser, Node version)

### Suggesting Features

1. Check [BACKLOG.md](docs/BACKLOG.md) to see if it's already planned
2. Open a [discussion](https://github.com/yourusername/prestige-worldwide/discussions) to gather feedback
3. Create a detailed issue with use cases and examples

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with clear commit messages
4. Test thoroughly (manual testing checklist in `docs/MANUAL_TEST_CHECKLIST.md`)
5. Push to your fork and submit a pull request

**Code Style:**
- Follow existing TypeScript and React conventions
- Use Tailwind CSS for styling
- Add comments for complex logic
- Keep components focused and reusable

---

## Documentation

Additional documentation is available in the [`docs/`](docs/) folder:

**📋 Planning & Development:**
- [IMPLEMENTATION_ROADMAP.md](docs/IMPLEMENTATION_ROADMAP.md) — **Prioritized feature roadmap and task breakdown**
- [BACKLOG.md](docs/BACKLOG.md) — Issues, improvements, and feature requests

**🎯 Feature Specifications:**
- [FEATURE_ACCOUNT_MANAGEMENT.md](docs/FEATURE_ACCOUNT_MANAGEMENT.md) — Account management & detail views spec
- [FEATURE_PORTFOLIO_NEWS.md](docs/FEATURE_PORTFOLIO_NEWS.md) — Portfolio-aware news feed specification

**🧪 Testing:**
- [MANUAL_TEST_CHECKLIST.md](docs/MANUAL_TEST_CHECKLIST.md) — Manual testing checklist
- [MOBILE_TESTING.md](docs/MOBILE_TESTING.md) — Automated mobile testing guide with Playwright

**🔧 Setup Guides:**
- [MARKET_DATA_SETUP.md](docs/MARKET_DATA_SETUP.md) — Market data integration guide
- [n8n-setup.md](docs/n8n-setup.md) — N8N workflow configuration
- [n8n-workflows.md](docs/n8n-workflows.md) — N8N workflow documentation

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

**Questions or Issues?**
- 📖 Check the [Documentation](#documentation)
- 🐛 [Report a bug](https://github.com/yourusername/prestige-worldwide/issues)
- 💬 [Ask a question](https://github.com/yourusername/prestige-worldwide/discussions)
- 📧 Email: support@prestige-worldwide.example.com

---

<div align="center">

**Built with ❤️ for expats, dual citizens, and global citizens**

[Live Demo](https://prestige-worldwide-kappa.vercel.app) • [Documentation](docs/) • [Issues](https://github.com/yourusername/prestige-worldwide/issues)

</div>
