"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CurrencyToggle, { type CurrencyMode } from "@/components/CurrencyToggle";
import PlanView, { type Plan } from "@/components/PlanView";
import NewsPanel from "@/components/NewsPanel";
import ChatPanel from "@/components/ChatPanel";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initialPlan?: Plan;
  initialNews?: object[];
  residenceCurrency?: string;
  retirementCurrency?: string;
}

export default function DashboardClient({
  initialPlan,
  initialNews = [],
  residenceCurrency = "USD",
  retirementCurrency = "USD",
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [plan, setPlan] = useState<Plan | null>(initialPlan ?? null);
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("residence");
  const [refreshing, setRefreshing] = useState(false);

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
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  async function handleRefreshPlan() {
    if (!plan) return;
    setRefreshing(true);
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
    } catch (err) {
      console.error("handleRefreshPlan:", err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <span className="font-bold text-brand-700 text-lg">Prestige Worldwide</span>
        <div className="ml-auto flex items-center gap-4">
          <CurrencyToggle
            residenceCurrency={residenceCurrency}
            retirementCurrency={retirementCurrency}
            onChange={setCurrencyMode}
          />
          <button
            onClick={handleRefreshPlan}
            disabled={refreshing}
            className="text-xs text-gray-500 hover:text-brand-600 transition disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh plan"}
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-500 hover:text-red-600 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <PlanView
              plan={plan}
              currencyMode={currencyMode}
              residenceCurrency={residenceCurrency}
              retirementCurrency={retirementCurrency}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <NewsPanel initialItems={initialNews as never[]} plan={plan} />
          </div>
        </div>

        {/* Right column — chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col lg:h-[calc(100vh-7rem)] sticky top-6">
          <ChatPanel planContext={plan} />
        </div>
      </div>
    </div>
  );
}
