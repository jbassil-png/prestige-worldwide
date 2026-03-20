import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/components/PlanView";
import PlanDetailClient from "./PlanDetailClient";

export const dynamic = "force-dynamic";

function resolveCurrency(country: string | undefined): string {
  if (country === "Canada") return "CAD";
  if (country === "United Kingdom") return "GBP";
  if (country === "Singapore") return "SGD";
  return "USD";
}

export default async function PlanDetailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!planRow) redirect("/onboarding");

  const plan = planRow.plan as Plan;

  const { data: accounts } = await supabase
    .from("user_accounts")
    .select("id, name, official_name, type, subtype, balance, currency, institution_name")
    .eq("user_id", user.id)
    .order("balance", { ascending: false });

  const residenceCurrency = resolveCurrency(plan.meta?.residenceCountry);
  const retirementCurrency = resolveCurrency(plan.meta?.retirementCountry);

  return (
    <PlanDetailClient
      plan={plan}
      planDate={planRow.created_at}
      accounts={accounts ?? []}
      residenceCurrency={residenceCurrency}
      retirementCurrency={retirementCurrency}
    />
  );
}
