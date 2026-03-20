import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountsClient from "./AccountsClient";

export const dynamic = 'force-dynamic'; // Skip during static export

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch user's connected accounts
  const { data: accounts } = await supabase
    .from("user_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <AccountsClient accounts={accounts ?? []} />;
}
