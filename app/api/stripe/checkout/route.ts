import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID;

export async function POST() {
  // ── Not configured yet — return mock so the UI can degrade gracefully
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json({ mock: true });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Re-use existing Stripe customer if we already created one for this user
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // Persist so the webhook can look this up later
    await supabase
      .from("user_profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/settings?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
