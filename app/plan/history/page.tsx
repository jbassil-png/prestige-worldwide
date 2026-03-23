import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlanHistoryClient from "./PlanHistoryClient";

export const dynamic = "force-dynamic";

export default async function PlanHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // user_plans is the live write target; plan_history is reserved for future
  // server-side enrichment (trigger context, market snapshots via cron/n8n).
  // Until that pipeline exists, read from user_plans and provide defaults.
  const { data: rows } = await supabase
    .from("user_plans")
    .select("id, plan, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const entries = (rows ?? []).map((row) => ({
    ...row,
    trigger_reason: (row.plan as { meta?: { trigger_reason?: string } })?.meta?.trigger_reason ?? "user_request",
    balance_snapshot: null,
  }));

  return <PlanHistoryClient entries={entries} />;
}
