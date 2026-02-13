import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, planContext } = await req.json();

  // ── N8N webhook ──────────────────────────────────────────────────────────────
  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, planContext }),
      });

      if (!n8nRes.ok) throw new Error(`N8N responded with ${n8nRes.status}`);

      // Proxy the response (streaming or JSON)
      const contentType = n8nRes.headers.get("content-type") ?? "";
      if (contentType.includes("text/event-stream")) {
        return new Response(n8nRes.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      }

      const data = await n8nRes.json();
      return NextResponse.json(data);
    } catch (err) {
      console.error("N8N chat webhook error:", err);
      // Fall through to stub
    }
  }

  // ── OpenRouter fallback ───────────────────────────────────────────────────────
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
    content: `Thanks for your question about "${lastUserMessage}". To get live AI responses, connect N8N or set OPENROUTER_API_KEY in your environment.`,
  });
}
