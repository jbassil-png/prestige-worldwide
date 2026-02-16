import { NextRequest, NextResponse } from "next/server";

const STUB_INSIGHT =
  "The US-Canada tax treaty allows pension income to be taxed only in your country of residence — ensure your RRSP withdrawals are reported correctly to avoid double taxation. With markets near all-time highs, consider whether your target-date glide path matches your cross-border risk tolerance. A rebalance before year-end could save on capital gains in both jurisdictions.";

export async function POST(req: NextRequest) {
  const { plan } = await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ insight: STUB_INSIGHT });
  }

  const today = new Date().toISOString().split("T")[0];
  const systemPrompt = `You are a concise cross-border financial planning analyst. Today is ${today}.`;
  const userPrompt = `Based on this user's financial plan, write a 2-3 sentence spotlight insight that is highly specific to their countries, account types, and current date (e.g. tax-year timing, treaty opportunities, currency events). Be concrete and actionable. Do not use generic advice.

Plan:
${JSON.stringify(plan, null, 2)}`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prestigeworldwide.app",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await res.json();
    const insight = data.choices?.[0]?.message?.content ?? STUB_INSIGHT;
    return NextResponse.json({ insight });
  } catch (err) {
    console.error("Insight generation error:", err);
    return NextResponse.json({ insight: STUB_INSIGHT });
  }
}
