import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/components/PlanView";
import type { PortfolioNewsItem } from "@/components/PortfolioNewsPanel";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

function resolveCurrency(country: string | undefined): string {
  if (country === "Canada") return "CAD";
  if (country === "United Kingdom") return "GBP";
  if (country === "Singapore") return "SGD";
  return "USD";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <DashboardClient />;

  // Fetch latest plan
  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!planRow) redirect("/onboarding");

  const plan = planRow.plan as Plan;
  const meta = (plan as Plan & { meta?: { residenceCountry?: string; retirementCountry?: string } }).meta;

  // Fetch in parallel: theme prefs, legacy LLM news, holdings, portfolio news cache
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const oneDayAgo    = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [prefsRow, newsRow, holdingsRows, portfolioNewsRow] = await Promise.all([
    supabase
      .from("user_preferences")
      .select("theme")
      .eq("user_id", user.id)
      .single()
      .then((r) => r.data),
    supabase
      .from("user_news")
      .select("items")
      .eq("user_id", user.id)
      .gte("fetched_at", oneDayAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single()
      .then((r) => r.data),
    supabase
      .from("user_holdings")
      .select("id, ticker, asset_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then((r) => r.data ?? []),
    supabase
      .from("user_portfolio_news")
      .select("items")
      .eq("user_id", user.id)
      .gte("fetched_at", thirtyMinsAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single()
      .then((r) => r.data),
  ]);

  return (
    <DashboardClient
      initialPlan={plan}
      planDate={planRow.created_at}
      initialNews={(newsRow?.items as object[]) ?? []}
      initialHoldings={holdingsRows}
      initialPortfolioNews={(portfolioNewsRow?.items as PortfolioNewsItem[]) ?? []}
      residenceCurrency={resolveCurrency(meta?.residenceCountry)}
      retirementCurrency={resolveCurrency(meta?.retirementCountry)}
      initialTheme={prefsRow?.theme ?? "swiss-alps"}
    />
  );
}
