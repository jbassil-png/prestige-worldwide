import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("user_checkin_schedule")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json(data || { frequency_days: 182 });
  } catch (error) {
    console.error("Checkin schedule fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { frequency_days } = await request.json();
    if (!frequency_days || frequency_days < 7 || frequency_days > 730) {
      return NextResponse.json({ error: "frequency_days must be between 7 and 730" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_checkin_schedule")
      .upsert({
        user_id: user.id,
        frequency_days,
        next_checkin_at: new Date(Date.now() + frequency_days * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Checkin schedule upsert error:", error);
      return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Checkin schedule update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
