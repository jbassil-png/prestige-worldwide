import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/plaid/sync
 *
 * Refreshes balances for all connected Plaid items belonging to the
 * authenticated user. Called on dashboard load.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.PLAID_CLIENT_ID) {
      // Plaid not configured — nothing to sync
      return NextResponse.json({ accounts: [], synced: false });
    }

    const { data: items } = await supabase
      .from("plaid_items")
      .select("access_token, institution")
      .eq("user_id", user.id);

    if (!items || items.length === 0) {
      return NextResponse.json({ accounts: [], synced: true });
    }

    const { Configuration, PlaidApi, PlaidEnvironments } = await import("plaid");
    const config = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV ?? "sandbox"],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
          "PLAID-SECRET": process.env.PLAID_SECRET!,
        },
      },
    });
    const plaid = new PlaidApi(config);

    const allAccounts: {
      user_id: string;
      account_id: string;
      account_name: string;
      account_type: string;
      account_subtype: string | null;
      current_balance: number;
      available_balance: number | null;
      currency: string;
      institution: string | null;
      last_updated_at: string;
    }[] = [];

    for (const item of items) {
      const res = await plaid.accountsBalanceGet({ access_token: item.access_token });
      for (const a of res.data.accounts) {
        allAccounts.push({
          user_id: user.id,
          account_id: a.account_id,
          account_name: a.name,
          account_type: a.type,
          account_subtype: a.subtype ?? null,
          current_balance: a.balances.current ?? 0,
          available_balance: a.balances.available ?? null,
          currency: a.balances.iso_currency_code ?? "USD",
          institution: item.institution,
          last_updated_at: new Date().toISOString(),
        });
      }
    }

    await supabase
      .from("user_accounts")
      .upsert(allAccounts, { onConflict: "account_id" });

    await supabase.from("user_balance_history").insert(
      allAccounts.map((a) => ({
        user_id: user.id,
        account_id: a.account_id,
        account_name: a.account_name,
        balance_usd: a.current_balance,
        currency: a.currency,
      }))
    );

    return NextResponse.json({ accounts: allAccounts, synced: true });
  } catch (error) {
    console.error("Plaid sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Plaid accounts" },
      { status: 500 }
    );
  }
}
