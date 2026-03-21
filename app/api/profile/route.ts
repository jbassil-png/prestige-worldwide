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
    const { residence_country, retirement_country, retirement_year } = body;

    if (!residence_country || !retirement_country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    if (retirement_year !== null && retirement_year !== undefined) {
      if (retirement_year <= currentYear || retirement_year > currentYear + 60) {
        return NextResponse.json(
          { error: "Invalid retirement year" },
          { status: 400 }
        );
      }
    }

    // Upsert profile
    const { data: profile, error: upsertError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        residence_country,
        retirement_country,
        retirement_year: retirement_year ?? null,
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
    const { data: accounts } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("user_id", user.id);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ profile, planRegenerated: false });
    }

    // Get latest plan to carry forward retirement goal
    const { data: latestPlanRow } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const existingMeta = (latestPlanRow?.plan as { meta?: Record<string, unknown> })?.meta || {};

    const planPayload = {
      countries: [residence_country, retirement_country],
      accounts: accounts.map((a: Record<string, unknown>) => ({
        type: a.account_type || a.type,
        country: residence_country,
        balanceUsd: a.current_balance || a.balance,
        currency: a.currency,
      })),
      retirementYear: retirement_year ?? null,
      retirementGoal: (existingMeta.retirementGoal as Record<string, unknown>) ?? null,
      residenceCountry: residence_country,
      retirementCountry: retirement_country,
      notes: (existingMeta.notes as string) || "",
    };

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
