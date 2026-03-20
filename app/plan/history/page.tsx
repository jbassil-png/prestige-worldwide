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

  const { data: rows } = await supabase
    .from("plan_history")
    .select("id, plan, trigger_reason, balance_snapshot, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return <PlanHistoryClient entries={rows ?? []} />;
}
