import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── N8N webhook ──────────────────────────────────────────────────────────────
  const webhookUrl = process.env.N8N_AI_PROXY_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_AI_PROXY_WEBHOOK_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!n8nRes.ok) {
      throw new Error(`N8N responded with ${n8nRes.status}`);
    }

    // Proxy the response (streaming or JSON)
    const contentType = n8nRes.headers.get("content-type") ?? "";
    if (contentType.includes("text/event-stream")) {
      return new Response(n8nRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = await n8nRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("N8N AI proxy webhook error:", err);
    return NextResponse.json(
      { error: "Failed to proxy request to N8N" },
      { status: 500 }
    );
  }
}
