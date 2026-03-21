import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { residence_country, retirement_country, current_age, retirement_age } = body;

    // Validate input
    if (!residence_country || !retirement_country || !current_age || !retirement_age) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (current_age < 18 || retirement_age <= current_age) {
      return NextResponse.json(
        { error: "Invalid age values" },
        { status: 400 }
      );
    }

    // Upsert profile
    const { data: profile, error: upsertError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        residence_country,
        retirement_country,
        current_age,
        retirement_age,
      })
      .select()
      .single();

    if (upsertError) {
      console.error("Profile upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Auto-regenerate plan with updated profile
    // Fetch user's current accounts
    const { data: accounts } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("user_id", user.id);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ profile, planRegenerated: false });
    }

    // Get latest plan to extract goals
    const { data: latestPlanRow } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const existingMeta = (latestPlanRow?.plan as { meta?: any })?.meta || {};

    // Prepare plan payload
    const planPayload = {
      countries: [residence_country, retirement_country],
      accounts: accounts.map((a: any) => ({
        type: a.account_type || a.type,
        country: residence_country,
        balanceUsd: a.current_balance || a.balance,
        currency: a.currency,
      })),
      goals: existingMeta.goals || [],
      currentAge: current_age,
      retirementAge: retirement_age,
      residenceCountry: residence_country,
      retirementCountry: retirement_country,
      notes: existingMeta.notes || "",
    };

    // Generate new plan
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const planRes = await fetch(`${appUrl}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planPayload),
    });

    if (planRes.ok) {
      const newPlan = await planRes.json();
      await supabase.from("user_plans").insert({
        user_id: user.id,
        plan: { ...newPlan, meta: planPayload },
      });
      return NextResponse.json({ profile, planRegenerated: true });
    }

    return NextResponse.json({ profile, planRegenerated: false });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
