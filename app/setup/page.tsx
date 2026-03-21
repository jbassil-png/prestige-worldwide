import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetupClient from "./SetupClient";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!planRow) redirect("/onboarding");

  const meta = (planRow.plan as { meta?: object }).meta ?? {};

  return <SetupClient initialData={meta} />;
}
