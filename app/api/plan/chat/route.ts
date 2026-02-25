import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/plan/chat
 *
 * Streams chat responses about the user's financial plan.
 * Integrates with n8n workflow that calls OpenRouter/Claude.
 *
 * Request body:
 * {
 *   messages: [{ role: "user", content: "What if I retire at 60?" }],
 *   planContext: { asset_allocation: {...}, projections: {...} }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, planContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_CHAT_WEBHOOK_URL not configured" },
        { status: 503 }
      );
    }

    // Call n8n workflow
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, planContext }),
    });

    if (!n8nRes.ok) {
      throw new Error(`n8n responded with ${n8nRes.status}`);
    }

    // Check if response is streaming
    const contentType = n8nRes.headers.get("content-type");
    if (contentType?.includes("text/event-stream") || contentType?.includes("application/stream")) {
      // Stream the response back to the client
      return new Response(n8nRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // If not streaming, return JSON
    const data = await n8nRes.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
