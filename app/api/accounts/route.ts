import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ACCOUNT_TYPES = [
  "checking", "savings", "401k", "ira", "roth_ira",
  "rrsp", "tfsa", "investment", "pension", "other",
];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, account_id, account_name, account_type, account_subtype, current_balance, currency, institution, plaid_item_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accounts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { account_name, account_type, current_balance, currency } = body;

  if (!account_name || typeof account_name !== "string" || account_name.trim().length === 0) {
    return NextResponse.json({ error: "account_name is required" }, { status: 400 });
  }
  if (!account_type || !ACCOUNT_TYPES.includes(account_type)) {
    return NextResponse.json({ error: "Invalid account_type" }, { status: 400 });
  }
  if (typeof current_balance !== "number" || current_balance < 0) {
    return NextResponse.json({ error: "current_balance must be a non-negative number" }, { status: 400 });
  }
  if (!currency || typeof currency !== "string") {
    return NextResponse.json({ error: "currency is required" }, { status: 400 });
  }

  // Use a prefixed UUID so manual accounts are distinguishable from Plaid account IDs
  const { randomUUID } = await import("crypto");
  const manualAccountId = `manual_${randomUUID()}`;

  const { data, error } = await supabase
    .from("user_accounts")
    .insert({
      user_id: user.id,
      account_id: manualAccountId,
      account_name: account_name.trim(),
      account_type,
      current_balance,
      currency: currency.toUpperCase(),
      plaid_item_id: null,
    })
    .select("id, account_id, account_name, account_type, current_balance, currency, plaid_item_id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ account: data });
}
