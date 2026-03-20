import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ holdings: [] });

  const { data, error } = await supabase
    .from("user_holdings")
    .select("id, ticker, asset_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ holdings: [], error: error.message });
  return NextResponse.json({ holdings: data });
}

export async function POST(req: NextRequest) {
  const { ticker, asset_type } = await req.json();

  if (!ticker || typeof ticker !== "string") {
    return NextResponse.json({ error: "ticker is required" }, { status: 400 });
  }

  const normalized = ticker.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,12}$/.test(normalized)) {
    return NextResponse.json({ error: "Invalid ticker format" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_holdings")
    .insert({
      user_id: user.id,
      ticker: normalized,
      asset_type: asset_type ?? "stock",
    })
    .select("id, ticker, asset_type, created_at")
    .single();

  if (error) {
    // Unique constraint → already tracked
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already tracking this ticker" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ holding: data });
}

export async function DELETE(req: NextRequest) {
  const { ticker } = await req.json();

  if (!ticker) return NextResponse.json({ error: "ticker is required" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { error } = await supabase
    .from("user_holdings")
    .delete()
    .eq("user_id", user.id)
    .eq("ticker", ticker.toUpperCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
