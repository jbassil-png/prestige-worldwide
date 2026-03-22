import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Dev-only endpoint — requires ALLOW_DEV_RESET=true env var
export async function POST() {
  if (process.env.ALLOW_DEV_RESET !== "true") {
    return NextResponse.json({ error: "Not enabled. Set ALLOW_DEV_RESET=true." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tables = [
    "plan_history",
    "user_plans",
    "user_accounts",
    "user_holdings",
    "user_balance_history",
    "user_portfolio_news",
    "plaid_items",
    "user_preferences",
    "user_checkin_schedule",
    "user_profiles",
  ];

  const errors: string[] = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) errors.push(`${table}: ${error.message}`);
  }

  return NextResponse.json({
    ok: errors.length === 0,
    message: errors.length === 0
      ? "User data cleared. You can run through onboarding again."
      : "Partial reset — some tables failed.",
    errors: errors.length ? errors : undefined,
  });
}
