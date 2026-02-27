# Prestige Worldwide - Session Notes

## 🎯 Core Project Mission

**Democratizing sophisticated wealth management through AI-powered investment advisory**

Making institutional-grade investment strategies accessible to everyday investors through:
- Personalized multi-asset portfolio recommendations
- Real-time market data integration
- AI-powered risk assessment and rebalancing
- Educational approach to financial literacy

---

## 🎓 **FUNDAMENTAL APPROACH: Learning-First Development**

**THIS IS CRITICAL TO THE PROJECT'S SUCCESS**

The owner wants to **learn by doing** with hands-on guidance, not just have features built for them. This learning approach is fundamental to:

### **Primary Learning Objectives:**
1. **N8N (Workflow Automation):** Understanding visual workflow design, webhooks, API orchestration, data transformation, error handling
2. **OpenRouter (Model Marketplace):** Navigating model selection, cost optimization, prompt engineering, streaming vs. non-streaming responses

### **Teaching Methodology:**
- **Explain the concept** (what and why)
- **Show an example** (how it works)
- **User does it** (hands-on practice)
- **Review together** (understanding check)

### **Why This Matters:**
- Owner wants sustainable knowledge, not just working code
- Learning these tools enables independent feature development
- Understanding architecture enables better decision-making
- Hands-on experience builds confidence and ownership

**⚠️ For future sessions: Always check if user wants to learn something hands-on vs. having it built for them. Default to teaching mode when introducing new tools/concepts.**

---

## 📊 Project Status

### **Current State:**
- ✅ Next.js 14 app with TypeScript
- ✅ Supabase backend (PostgreSQL + Auth)
- ✅ Basic onboarding form UI
- ✅ Database schema designed (8 tables including users, portfolios, assets, risk_profiles)
- ✅ Next.js API routes stubbed out
- ✅ AlphaVantage API selected for market data
- ⏳ **NO TEST SUITE YET** (user wants this before shipping features)
- ⏳ **AI Features NOT implemented** (plan generation, chat, rebalancing alerts)

### **Architecture Decisions:**
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Row Level Security + Auth)
- **Market Data:** AlphaVantage API (free tier: 25 API calls/day)
- **Workflow Orchestration:** N8N (being integrated for learning)
- **AI Models:** OpenRouter (model marketplace - being integrated for learning)

### **Key Technical Constraints:**
- AlphaVantage free tier: 25 calls/day (requires careful caching strategy)
- Need to handle rate limiting gracefully
- Must maintain security with Supabase RLS policies
- AI responses should be conversational but grounded in financial data

---

## 🔄 Recent Sessions Summary

### **Session: 2026-02-27 (Current)**
**Focus:** Pivoting to N8N + OpenRouter Integration (Learning Mode)

**What Happened:**
1. Reviewed entire project history and understood current state
2. User clarified fundamental motivation: **wants to learn N8N and OpenRouter hands-on**
3. Agreed on teaching approach vs. just building
4. Updated todos to reflect learning-focused workflow integration
5. Prepared to guide user through N8N setup and OpenRouter model selection

**Key Insights:**
- User wants to participate actively in technical decisions
- Learning the tools is as important as the final features
- This session established the teaching methodology for all future work

**Next Actions:**
- Guide user through N8N account setup
- Teach N8N basics with simple workflow
- Build Workflow 1: Plan Generation (with market data + OpenRouter)
- Explore OpenRouter model marketplace together
- Build Workflow 2: AI Chat with streaming

---

### **Session: 2026-02-13 (Previous)**
**Focus:** Initial architecture setup and planning

**What Happened:**
1. Set up Next.js project structure
2. Designed Supabase database schema
3. Created onboarding form UI
4. Stubbed out API routes
5. Selected AlphaVantage for market data

**Key Decisions:**
- Chose Supabase over custom backend (faster development)
- Designed 8-table schema for portfolio management
- Identified 3 core AI features: plan generation, chat, rebalancing

---

## 🎯 Feature Priorities (In Order)

### **Phase 0: Testing Infrastructure (CURRENT PRIORITY)**
- ⏸️ **ON HOLD** while we integrate N8N/OpenRouter (learning focus)
- Will return to this after user understands workflow orchestration

### **Phase 1: Core Investment Features (via N8N + OpenRouter)**
1. **Plan Generation** (Workflow 1)
   - Fetch S&P 500 price (AlphaVantage)
   - Fetch Treasury yields (AlphaVantage)
   - Build enriched prompt with market data
   - Call OpenRouter (user will choose model)
   - Store in Supabase

2. **AI Chat** (Workflow 2)
   - Portfolio Q&A interface
   - Streaming responses via OpenRouter
   - Context-aware conversations

3. **Rebalancing Alerts** (Workflow 3 - Future)
   - Periodic market data checks
   - Drift detection
   - AI-generated rebalancing recommendations

### **Phase 2: Enhanced Features (Future)**
- Real-time portfolio tracking
- Performance analytics
- Tax optimization suggestions
- Educational content delivery

---

## 🔧 Development Workflow

### **For New Sessions:**
1. **Read this file first** to understand project context
2. **Check learning objectives** - is user learning something new?
3. **Review recent sessions** to understand where we left off
4. **Ask before assuming** - does user want to do it hands-on or have it built?
5. **Update this file** at the end of significant sessions

### **Branch Strategy:**
- Main development happens on `claude/start-planning-*` branches
- Commit frequently with descriptive messages
- Push when work is complete or at logical checkpoints

### **Testing Philosophy (Once we implement):**
- Write tests for critical paths first
- Unit tests for business logic
- Integration tests for API routes + Supabase
- E2E tests for core user journeys
- Run tests before pushing

---

## 📝 Important Notes

### **Financial Advisory Context:**
- This app provides **educational** portfolio suggestions, not licensed financial advice
- Always include disclaimers about consulting licensed professionals
- Risk profiles should be conservative by default
- Emphasize that past performance doesn't guarantee future results

### **Data Privacy:**
- Supabase RLS policies must restrict data access per user
- Never log sensitive financial information
- Market data can be cached and shared across users
- User portfolio data must remain isolated

### **AlphaVantage API Management:**
- Free tier: 25 calls/day
- Cache market data aggressively (Redis or Supabase table)
- Consider upgrading to paid tier if usage grows
- Implement graceful degradation if rate limited

---

## 🎓 Learning Resources for Owner

### **N8N:**
- Official docs: https://docs.n8n.io/
- Key concepts: Nodes, connections, expressions, webhooks
- Will learn: Visual workflow building, API orchestration, data transformation

### **OpenRouter:**
- Official docs: https://openrouter.ai/docs
- Key concepts: Model selection, pricing, streaming, fallbacks
- Will learn: Choosing models per use case, cost optimization, prompt engineering

### **Testing (Future):**
- Jest docs: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/

---

## ✅ Completed Milestones

- [x] Project initialization with Next.js 14 + TypeScript
- [x] Supabase setup and schema design
- [x] Onboarding form UI implementation
- [x] API routes structure created
- [x] AlphaVantage API integration planned
- [x] Learning approach established for N8N + OpenRouter

---

## 🚧 Known Issues / Technical Debt

- [ ] No test suite yet (planned after N8N integration)
- [ ] No error handling in API routes
- [ ] No caching strategy for market data
- [ ] No rate limiting protection for AlphaVantage API
- [ ] No user authentication flow implemented
- [ ] No RLS policies written for Supabase

---

## 📌 Quick Reference

### **Environment Variables Needed:**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
ALPHA_VANTAGE_API_KEY=
N8N_WEBHOOK_URL_PLAN_GENERATION=  # Will create during learning session
N8N_WEBHOOK_URL_CHAT=              # Will create during learning session
OPENROUTER_API_KEY=                # Will create during learning session
```

### **Key File Locations:**
- Database types: `lib/types/database.types.ts`
- API routes: `app/api/*`
- Onboarding form: `app/onboarding/*`
- Components: `components/*`
- Supabase client: `lib/supabase/*`

---

**Last Updated:** 2026-02-27
**Current Branch:** `claude/start-planning-gWIXp`
**Current Focus:** Teaching N8N + OpenRouter integration (learning mode)
