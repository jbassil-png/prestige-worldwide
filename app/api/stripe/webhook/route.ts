import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Stripe requires the raw request body for signature verification — disable
// Next.js body parsing for this route.
export const config = { api: { bodyParser: false } };

const STRIPE_CONFIGURED =
  !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // ── Not configured yet — accept silently so Stripe retries don't pile up
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json({ received: true, mock: true });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    // Subscription activated — flip is_paid on
    case "customer.subscription.created":
    case "invoice.paid": {
      const customerId =
        event.type === "invoice.paid"
          ? (event.data.object as import("stripe").Stripe.Invoice).customer as string
          : (event.data.object as import("stripe").Stripe.Subscription).customer as string;

      await supabase
        .from("user_profiles")
        .update({ is_paid: true })
        .eq("stripe_customer_id", customerId);
      break;
    }

    // Subscription cancelled or expired — flip is_paid off
    case "customer.subscription.deleted": {
      const sub = event.data.object as import("stripe").Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase
        .from("user_profiles")
        .update({ is_paid: false })
        .eq("stripe_customer_id", customerId);
      break;
    }

    // Subscription updated — check if it moved to a cancelled/past_due state
    case "customer.subscription.updated": {
      const sub = event.data.object as import("stripe").Stripe.Subscription;
      const customerId = sub.customer as string;
      const isPaid = sub.status === "active" || sub.status === "trialing";

      await supabase
        .from("user_profiles")
        .update({ is_paid: isPaid })
        .eq("stripe_customer_id", customerId);
      break;
    }

    default:
      // Ignore all other event types
      break;
  }

  return NextResponse.json({ received: true });
}
