import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, planContext } = await req.json();

  // ── OpenRouter ────────────────────────────────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-haiku";

  if (apiKey) {
    const systemPrompt = planContext
      ? `You are a helpful cross-border financial planning assistant for Prestige Worldwide.
The user's current financial plan context:\n\n${JSON.stringify(planContext, null, 2)}\n\nAnswer questions about their plan, explain recommendations, and provide general guidance. Always note you are not a licensed financial adviser.`
      : "You are a helpful cross-border financial planning assistant.";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prestigeworldwide.app",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    return new Response(res.body, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  // ── Stub fallback ─────────────────────────────────────────────────────────────
  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content ?? "your question";
  return NextResponse.json({
    role: "assistant",
    content: `Thanks for your question about "${lastUserMessage}". Set OPENROUTER_API_KEY in your environment to get live AI responses.`,
  });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      role: "assistant",
      content: "I'm having trouble responding right now. Please try again in a moment.",
    });
  }
}
