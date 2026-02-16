import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlanView, { type Plan } from "@/components/PlanView";
import NewsPanel from "@/components/NewsPanel";
import ChatPanel from "@/components/ChatPanel";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let plan: Plan | null = null;
  let newsItems: object[] = [];

  if (user) {
    // Fetch latest plan
    const { data: planRow } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!planRow) {
      redirect("/onboarding");
    }

    plan = planRow.plan as Plan;

    // Fetch cached news (< 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: newsRow } = await supabase
      .from("user_news")
      .select("items")
      .eq("user_id", user.id)
      .gte("fetched_at", oneDayAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    newsItems = (newsRow?.items as object[]) ?? [];
  }

  // No Supabase session (dev mode without credentials): DashboardClient reads sessionStorage
  if (!user) {
    return <DashboardClient />;
  }

  if (!plan) redirect("/onboarding");

  const residenceCurrency =
    (plan as Plan & { meta?: { residenceCountry?: string } }).meta?.residenceCountry === "Canada"
      ? "CAD"
      : (plan as Plan & { meta?: { residenceCountry?: string } }).meta?.residenceCountry === "United Kingdom"
      ? "GBP"
      : (plan as Plan & { meta?: { residenceCountry?: string } }).meta?.residenceCountry === "Singapore"
      ? "SGD"
      : "USD";

  const retirementCurrency =
    (plan as Plan & { meta?: { retirementCountry?: string } }).meta?.retirementCountry === "Canada"
      ? "CAD"
      : (plan as Plan & { meta?: { retirementCountry?: string } }).meta?.retirementCountry === "United Kingdom"
      ? "GBP"
      : (plan as Plan & { meta?: { retirementCountry?: string } }).meta?.retirementCountry === "Singapore"
      ? "SGD"
      : "USD";

  return (
    <DashboardClient
      initialPlan={plan}
      initialNews={newsItems}
      residenceCurrency={residenceCurrency}
      retirementCurrency={retirementCurrency}
    />
  );
}
