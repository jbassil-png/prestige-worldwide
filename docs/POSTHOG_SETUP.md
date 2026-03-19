# PostHog Analytics Setup Guide

**Status:** Configured ✅
**Free Tier:** 1 million events/month
**Dashboard:** https://app.posthog.com

---

## Quick Setup (5 minutes)

### 1. Create PostHog Account

1. Go to https://app.posthog.com/signup
2. Sign up with email or GitHub
3. Create a project called "Prestige Worldwide"
4. Select region: **US** (for best performance with Vercel US deployments)

### 2. Get Your API Key

1. In PostHog dashboard → **Project Settings** → **Project API Key**
2. Copy your **Project API Key** (starts with `phc_...`)

### 3. Add to Environment Variables

**Local development** (`.env.local`):
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Vercel production:**
```bash
# Go to: https://vercel.com/your-project/settings/environment-variables
# Add:
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 4. Deploy

Push to main branch → Vercel auto-deploys → PostHog starts tracking! 🎉

---

## What's Being Tracked

### Automatic Tracking
- ✅ Page views (all routes)
- ✅ Page performance metrics
- ✅ Session duration
- ✅ User paths through the app

### Custom Events Tracked

| Event | Location | Properties |
|-------|----------|-----------|
| `user_signed_up` | Sign-up page | `method` (email_password / magic_link) |
| `onboarding_completed` | Onboarding wizard | `countries_count`, `accounts_count`, `goals_count`, `years_to_retirement` |
| `chat_message_sent` | Chat panel | `message_length`, `has_plan_context` |
| `bank_connected` | Plaid integration | `accounts_count`, `source` (plaid) |
| `bank_connection_failed` | Plaid integration | `source`, `error` |

### User Identification

Users are identified by their Supabase user ID when they sign up:
```typescript
posthog.identify(userId, { email: userEmail });
```

This allows you to:
- Track user journeys across sessions
- See which users are most engaged
- Build cohorts and funnels

---

## Key Metrics to Monitor

### Conversion Funnel
1. **Sign-up** → `user_signed_up`
2. **Onboarding** → `onboarding_completed`
3. **Plan Generation** → (tracked in onboarding_completed)
4. **Engagement** → `chat_message_sent`
5. **Banking** → `bank_connected`

**Expected Drop-off:**
- Sign-up → Onboarding: ~70-80%
- Onboarding → Plan: ~90%+
- Plan → Chat: ~30-50%
- Plan → Bank: ~20-40%

### Engagement Metrics
- **Chat Usage:** Track `chat_message_sent` events
- **Return Rate:** Users who come back after day 1
- **Session Duration:** Time spent in dashboard

---

## PostHog Dashboard Views

### 1. Insights (Trends)
- Total sign-ups over time
- Onboarding completion rate
- Chat message volume
- Bank connection success rate

### 2. Funnels
**Key Funnel:** Sign-up → Onboarding → Bank Connected
- Shows drop-off at each step
- Helps identify where users get stuck

### 3. User Paths
- See actual user journeys through your app
- Identify unexpected behavior patterns

### 4. Recordings (Premium)
- Watch actual user sessions (optional)
- See where users struggle
- Identify UX issues

---

## Useful PostHog Features

### Feature Flags (Free)
Test new features with a subset of users:
```typescript
if (posthog.isFeatureEnabled('new-theme-selector')) {
  // Show new UI
}
```

### Cohorts
Group users by behavior:
- "Power Users" (sent 10+ chat messages)
- "Completed Onboarding" (finished wizard)
- "Connected Bank" (integrated Plaid)

### A/B Testing
Test different messaging, UI, or flows:
```typescript
const variant = posthog.getFeatureFlag('landing-page-test');
if (variant === 'control') {
  // Show current landing page
} else if (variant === 'test') {
  // Show new landing page
}
```

---

## Privacy & GDPR

PostHog is **GDPR compliant** and privacy-friendly:

- ✅ Self-hosted option available (not required)
- ✅ User data stays in your selected region (US/EU)
- ✅ No third-party cookies
- ✅ Users can opt-out

**Opt-out implementation (optional):**
```typescript
posthog.opt_out_capturing();
```

---

## Testing Analytics

### 1. Local Testing

Run the app locally with PostHog key:
```bash
# Add to .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here

# Start app
npm run dev
```

Sign up, complete onboarding, send chat messages → Check PostHog dashboard for events!

### 2. Production Testing

After deploying to Vercel:
1. Visit your production URL
2. Sign up with a test email
3. Complete full flow
4. Check PostHog dashboard (events appear within ~30 seconds)

---

## Troubleshooting

### Events not showing up?

**Check 1:** API key is set correctly
```bash
# In browser console:
console.log(process.env.NEXT_PUBLIC_POSTHOG_KEY)
# Should show: phc_...
```

**Check 2:** PostHog initialized
```bash
# In browser console:
posthog.__loaded
# Should show: true
```

**Check 3:** Manual event test
```bash
# In browser console:
posthog.capture('test_event')
# Check PostHog dashboard for "test_event"
```

### Common Issues

**Issue:** "posthog is not defined"
**Fix:** Make sure you're using the hook in a client component (`'use client'`)

**Issue:** Events showing as "anonymous"
**Fix:** `posthog.identify(userId)` must be called after sign-up

**Issue:** Too many events / cost concern
**Fix:** PostHog free tier is 1M events/month. Average MVP uses ~10-50k/month.

---

## Next Steps

Once analytics is working:

1. **Week 1:** Monitor sign-up flow completion rate
2. **Week 2:** Analyze drop-off points in onboarding
3. **Week 3:** Track chat engagement and popular questions
4. **Month 1:** Build user cohorts and identify power users
5. **Month 2:** Set up feature flags for A/B testing

---

## Cost Estimate

**Free Tier:** 1,000,000 events/month (plenty for MVP!)

**Typical MVP Usage:**
- 100 users/month
- ~500 events/user (page views + custom events)
- **Total:** ~50,000 events/month (well within free tier)

**When you'll need to upgrade:**
- 2,000+ monthly active users
- OR you want session recordings (premium feature)

**Paid tiers:** Start at $0 (truly free for small projects)

---

## Resources

- **PostHog Docs:** https://posthog.com/docs
- **Next.js Integration:** https://posthog.com/docs/libraries/next-js
- **Event Tracking Guide:** https://posthog.com/docs/product-analytics/capture-events
- **Dashboard:** https://app.posthog.com

---

**Questions?** Check PostHog docs or community Slack!
