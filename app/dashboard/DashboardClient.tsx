"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CurrencyToggle, { type CurrencyMode } from "@/components/CurrencyToggle";
import PlanView, { type Plan } from "@/components/PlanView";
import NewsPanel from "@/components/NewsPanel";
import PortfolioNewsPanel from "@/components/PortfolioNewsPanel";
import ChatPanel from "@/components/ChatPanel";
import AllocationCharts from "@/components/AllocationCharts";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioNewsItem } from "@/components/PortfolioNewsPanel";
import posthog from "posthog-js";

interface Holding {
  id: string;
  ticker: string;
  asset_type: string;
}

interface Props {
  initialPlan?: Plan;
  planDate?: string;
  initialNews?: object[];
  initialHoldings?: Holding[];
  initialPortfolioNews?: PortfolioNewsItem[];
  residenceCurrency?: string;
  retirementCurrency?: string;
  initialTheme?: string;
  userEmail?: string;
  isPaid?: boolean;
}

export default function DashboardClient({
  initialPlan,
  planDate,
  initialNews = [],
  initialHoldings = [],
  initialPortfolioNews = [],
  residenceCurrency = "USD",
  retirementCurrency = "USD",
  initialTheme,
  userEmail,
  isPaid = false,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [plan, setPlan] = useState<Plan | null>(initialPlan ?? null);
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("residence");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Apply theme — server prop takes precedence; fall back to sessionStorage
  useEffect(() => {
    const theme = initialTheme ?? sessionStorage.getItem("pw_theme") ?? "swiss-alps";
    document.documentElement.setAttribute("data-theme", theme);
  }, [initialTheme]);

  // Dev mode: load plan from sessionStorage if no server-side plan was passed
  useEffect(() => {
    if (!plan) {
      const stored = sessionStorage.getItem("pw_plan");
      if (stored) {
        setPlan(JSON.parse(stored));
      } else {
        router.push("/onboarding");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      // Use replace to avoid adding to browser history
      router.replace("/sign-in");
      // Force a hard refresh to ensure cookies are cleared
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect anyway
      window.location.href = "/sign-in";
    }
  }

  async function handleRefreshPlan() {
    if (!plan) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      const meta = (plan as Plan & { meta?: object }).meta ?? {};
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      });
      if (!res.ok) throw new Error(`Plan refresh failed (${res.status})`);
      const updated = await res.json();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_plans").insert({ user_id: user.id, plan: { ...updated, meta } });
      }
      setPlan({ ...updated, meta });

      // Track successful plan refresh
      if (posthog.__loaded) {
        posthog.capture('plan_refreshed', {
          has_meta: !!meta && Object.keys(meta).length > 0,
        });
      }
    } catch (err) {
      console.error("handleRefreshPlan:", err);
      setRefreshError("Couldn't refresh your plan. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading your plan…</div>
      </div>
    );
  }

  // Demo plan for users without connected accounts
  const isDemoMode = !initialPlan;
  const demoNewsItems = [
    {
      headline: "New tax treaty between US and Canada impacts cross-border retirement accounts",
      summary: "Recent changes may affect how RRSP and 401(k) withdrawals are taxed in both countries.",
      relevance: "Relevant to your US-Canada portfolio",
      url: "#",
      date: "2026-03-19",
    },
    {
      headline: "Singapore increases CPF contribution rates for 2026",
      summary: "Higher mandatory savings rates may accelerate retirement goals but reduce take-home pay.",
      relevance: "Impacts Singapore-based accounts",
      url: "#",
      date: "2026-03-18",
    },
    {
      headline: "Currency volatility: USD strengthens against CAD and GBP",
      summary: "Exchange rate movements could affect the real value of your multi-currency portfolio.",
      relevance: "Monitor conversion timing for rebalancing",
      url: "#",
      date: "2026-03-17",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* Top bar — brand + user identity + sign out */}
      <header className="w-full bg-white border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 flex items-center">
        <span className="font-bold text-brand-700 text-sm sm:text-base md:text-lg">
          <span className="hidden sm:inline">Prestige Worldwide</span>
          <span className="sm:hidden">Prestige</span>
        </span>
        {userEmail && (
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[180px]">
              {userEmail}
            </span>
            {userEmail === "demo@prestigeworldwide.com" ? (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Free demo</span>
            ) : userEmail === "paid@prestigeworldwide.com" ? (
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Paid demo</span>
            ) : isPaid ? (
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Pro</span>
            ) : null}
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-red-600 transition"
            >
              Sign out
            </button>
          </div>
        )}
        {!userEmail && (
          <button
            onClick={handleSignOut}
            className="ml-auto text-xs text-gray-400 hover:text-red-600 transition"
          >
            Sign out
          </button>
        )}
      </header>

      {/* Demo mode: marketing banner */}
      {isDemoMode && (
        <div className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Financial Planning Without Borders</h1>
            <p className="text-brand-50 text-xs sm:text-sm leading-relaxed max-w-3xl">
              Prestige Worldwide helps people with assets in multiple countries navigate complex cross-border retirement,
              tax, and cash flow planning. Get personalized recommendations that account for multi-currency portfolios,
              international tax treaties, and retirement timing strategies.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="bg-white/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
                📊 Demo Mode
              </span>
              <button
                onClick={() => router.push("/onboarding")}
                className="bg-white text-brand-700 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-brand-50 transition"
              >
                Connect Your Accounts to Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated users: personalised plan control bar */}
      {!isDemoMode && (
        <div className="w-full bg-white border-b border-gray-100">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            {/* Plan identity */}
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Your financial plan</p>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {plan.meta?.residenceCountry ?? "Your portfolio"}
                {plan.meta?.retirementCountry &&
                  plan.meta.retirementCountry !== plan.meta.residenceCountry && (
                    <>
                      {" "}
                      <span className="text-gray-400">→</span>{" "}
                      {plan.meta.retirementCountry}
                    </>
                  )}
              </h1>
            </div>

            {/* Controls — flush right on desktop */}
            <div className="sm:ml-auto flex flex-wrap items-center gap-3">
              <CurrencyToggle
                residenceCurrency={residenceCurrency}
                retirementCurrency={retirementCurrency}
                onChange={setCurrencyMode}
              />
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {planDate && (
                  <span>
                    Updated{" "}
                    {new Date(planDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <button
                  onClick={handleRefreshPlan}
                  disabled={refreshing}
                  className="hover:text-brand-600 transition disabled:opacity-50"
                >
                  {refreshing ? "Refreshing…" : "Refresh plan"}
                </button>
                <Link href="/settings" className="hover:text-brand-600 transition">
                  Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Refresh error — shown below the control bar */}
          {refreshError && (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-3">
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {refreshError}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Features overview for demo mode */}
          {isDemoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">What You'll Get:</h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-1.5">
                <li>✓ <strong>AI-Powered Analysis:</strong> Personalized financial plan based on your real account balances</li>
                <li>✓ <strong>Cross-Border Insights:</strong> Tax optimization and currency strategy recommendations</li>
                <li>✓ <strong>Live News Feed:</strong> Relevant financial news tailored to your countries and accounts</li>
                <li>✓ <strong>Interactive Chat:</strong> Ask questions about your plan anytime</li>
                <li>✓ <strong>Secure Connections:</strong> Bank integration via Plaid (bank-level encryption)</li>
              </ul>
            </div>
          )}

          {/* News — shown first so returning users see what's changed */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {isDemoMode ? (
              <>
                <NewsPanel
                  initialItems={demoNewsItems as never[]}
                  plan={plan}
                />
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  💡 <strong>Note:</strong> Connect your accounts to track holdings and get ticker-specific news.
                </p>
              </>
            ) : (
              <PortfolioNewsPanel
                initialHoldings={initialHoldings}
                initialNews={initialPortfolioNews}
              />
            )}
          </div>

          {/* Plan */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <PlanView
              plan={plan}
              currencyMode={currencyMode}
              residenceCurrency={residenceCurrency}
              retirementCurrency={retirementCurrency}
            />
          </div>

          {/* Portfolio allocation breakdown */}
          {!isDemoMode && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Portfolio breakdown</h3>
              <AllocationCharts />
            </div>
          )}
        </div>

        {/* Right column — chat */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col lg:h-[calc(100vh-7rem)] lg:sticky lg:top-6">
          <ChatPanel planContext={plan} />
          {isDemoMode && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              💬 Try asking: &quot;What tax considerations should I know?&quot; or &quot;When should I retire?&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
