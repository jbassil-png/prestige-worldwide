import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountDetailClient from "./AccountDetailClient";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Fetch the account
  const { data: account } = await supabase
    .from("user_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!account) notFound();

  // Fetch balance history for this account (last 30 entries)
  const { data: history } = await supabase
    .from("user_balance_history")
    .select("balance_usd, currency, recorded_at")
    .eq("account_id", account.account_id)
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: true })
    .limit(30);

  // Fetch latest plan for account-specific recommendations
  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const recommendations: { category: string; priority: string; text: string }[] =
    (planRow?.plan as any)?.recommendations ?? [];

  return (
    <AccountDetailClient
      account={account}
      history={history ?? []}
      recommendations={recommendations}
    />
  );
}
