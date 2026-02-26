import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/balance-refresh
 *
 * Called by n8n Scheduled Balance Refresh workflow.
 * Updates user account balances in Supabase.
 *
 * Request body:
 * {
 *   userId: "uuid",
 *   accounts: [
 *     {
 *       account_id: "plaid_account_id",
 *       account_name: "Chase Checking",
 *       current_balance: 5000.00,
 *       available_balance: 4800.00,
 *       account_type: "depository",
 *       account_subtype: "checking",
 *       currency: "USD"
 *     }
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, accounts } = body;

    if (!userId || !accounts || !Array.isArray(accounts)) {
      return NextResponse.json(
        { error: "userId and accounts array are required" },
        { status: 400 }
      );
    }

    // Verify request is from n8n (optional but recommended)
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.N8N_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get old balances for comparison
    const { data: oldAccounts } = await supabase
      .from("user_accounts")
      .select("account_id, current_balance")
      .eq("user_id", userId);

    const oldBalanceMap = new Map(
      oldAccounts?.map((acc) => [acc.account_id, parseFloat(acc.current_balance)]) || []
    );

    // Calculate old and new totals
    const oldTotal = Array.from(oldBalanceMap.values()).reduce((sum, bal) => sum + bal, 0);
    const newTotal = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
    const changePercent = oldTotal > 0 ? Math.abs((newTotal - oldTotal) / oldTotal) * 100 : 0;

    // Update accounts in Supabase
    const updates = accounts.map((account) => ({
      user_id: userId,
      account_id: account.account_id,
      account_name: account.account_name,
      account_type: account.account_type,
      account_subtype: account.account_subtype,
      current_balance: account.current_balance,
      available_balance: account.available_balance,
      currency: account.currency || "USD",
      last_updated_at: new Date().toISOString(),
    }));

    // Upsert all accounts
    const { error: upsertError } = await supabase
      .from("user_accounts")
      .upsert(updates, {
        onConflict: "account_id",
      });

    if (upsertError) {
      console.error("Error upserting accounts:", upsertError);
      return NextResponse.json(
        { error: "Failed to update accounts" },
        { status: 500 }
      );
    }

    // Insert balance history records
    const historyRecords = accounts.map((account) => ({
      user_id: userId,
      account_id: account.account_id,
      account_name: account.account_name,
      balance_usd: account.current_balance,
      currency: account.currency || "USD",
    }));

    const { error: historyError } = await supabase
      .from("user_balance_history")
      .insert(historyRecords);

    if (historyError) {
      console.error("Error inserting balance history:", historyError);
      // Don't fail the request, just log the error
    }

    // Check if we should trigger plan regeneration
    const shouldRegenerate = changePercent >= 10;

    if (shouldRegenerate) {
      console.log(
        `Balance changed by ${changePercent.toFixed(2)}% for user ${userId} - triggering plan regeneration`
      );

      // Trigger plan regeneration (async, don't wait)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plan/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.N8N_API_TOKEN || ""}`,
        },
        body: JSON.stringify({
          userId,
          trigger: "balance_change",
        }),
      }).catch((err) => {
        console.error("Failed to trigger plan regeneration:", err);
      });
    }

    return NextResponse.json({
      success: true,
      accountsUpdated: accounts.length,
      oldTotal,
      newTotal,
      changePercent: parseFloat(changePercent.toFixed(2)),
      shouldRegenerate,
    });

  } catch (error) {
    console.error("Balance refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh balances" },
      { status: 500 }
    );
  }
}
