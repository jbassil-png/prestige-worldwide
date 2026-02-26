import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/plan/regenerate
 *
 * Triggered by n8n when balance changes significantly.
 * Fetches latest user data and regenerates the financial plan.
 *
 * Request body:
 * {
 *   userId: "uuid",
 *   trigger: "balance_change" | "scheduled" | "market_change"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, trigger } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
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

    // Fetch user's accounts and latest balances
    const { data: accounts, error: accountsError } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("user_id", userId);

    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      return NextResponse.json(
        { error: "Failed to fetch user accounts" },
        { status: 500 }
      );
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: "No accounts found for user" },
        { status: 404 }
      );
    }

    // Fetch user profile data (you'll need a user_profiles table)
    // For now, using stub data - adjust based on your schema
    const userProfile = {
      userId,
      countries: ["US"], // TODO: Fetch from user profile
      currentAge: 35,    // TODO: Fetch from user profile
      retirementAge: 55, // TODO: Fetch from user profile
      goals: ["retire-early"], // TODO: Fetch from user profile
      riskTolerance: "moderate", // TODO: Fetch from user profile
    };

    // Build payload for plan generation
    const planPayload = {
      userId,
      countries: userProfile.countries,
      accounts: accounts.map((acc) => ({
        name: acc.account_name,
        balance: parseFloat(acc.current_balance),
        type: acc.account_subtype || acc.account_type,
        country: acc.currency === "USD" ? "US" : "Unknown",
      })),
      goals: userProfile.goals,
      ages: {
        current: userProfile.currentAge,
        retirement: userProfile.retirementAge,
      },
      riskTolerance: userProfile.riskTolerance,
    };

    // Call the plan generation endpoint
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL not configured" },
        { status: 503 }
      );
    }

    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planPayload),
    });

    if (!n8nRes.ok) {
      throw new Error(`n8n responded with ${n8nRes.status}`);
    }

    const newPlan = await n8nRes.json();

    // Store the regenerated plan (n8n already does this, but we could update locally too)
    console.log(`Plan regenerated for user ${userId} (trigger: ${trigger})`);

    return NextResponse.json({
      success: true,
      trigger,
      plan: newPlan,
    });

  } catch (error) {
    console.error("Plan regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate plan" },
      { status: 500 }
    );
  }
}
