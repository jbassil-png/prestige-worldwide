import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Prestige Worldwide <onboarding@resend.dev>",
    to: email,
    subject: "You're on the list — Prestige Worldwide",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
          You're on the list.
        </h1>
        <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
          Thanks for your interest in Prestige Worldwide. We'll reach out as soon as your spot is ready.
        </p>
        <p style="font-size: 14px; color: #94a3b8;">
          — The Prestige Worldwide team
        </p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
