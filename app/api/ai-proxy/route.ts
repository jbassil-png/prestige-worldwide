import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { stream = false, ...rest } = body;
    const model = rest.model ?? process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-haiku";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prestigeworldwide.app",
      },
      body: JSON.stringify({ ...rest, model, stream }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter responded with ${res.status}`);
    }

    if (stream) {
      return new Response(res.body, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI proxy error:", error);
    return NextResponse.json(
      { error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
