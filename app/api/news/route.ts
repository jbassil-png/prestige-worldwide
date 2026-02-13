import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STUB_NEWS = [
  {
    headline: "IRS releases updated foreign tax credit guidance for dual-status taxpayers",
    summary: "New guidance clarifies how US citizens living abroad can apply foreign tax credits against PFIC income — potentially reducing effective rates for those with Canadian mutual funds.",
    relevance: "Directly affects US-Canada dual taxpayers holding RRSP or non-registered investment accounts.",
    url: "https://www.irs.gov",
    date: new Date().toISOString().split("T")[0],
  },
  {
    headline: "Bank of Canada holds rates steady; CAD strengthens against USD",
    summary: "The BoC maintained its overnight rate at 3.75%, citing moderating inflation. The CAD gained 0.4% against the USD following the announcement.",
    relevance: "Affects the USD value of your Canadian accounts and cross-border transfer timing.",
    url: "https://www.bankofcanada.ca",
    date: new Date().toISOString().split("T")[0],
  },
];

export async function POST(req: NextRequest) {
  const { plan, forceRefresh } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check cache (Supabase required for caching)
  if (user && !forceRefresh) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("user_news")
      .select("items")
      .eq("user_id", user.id)
      .gte("fetched_at", oneDayAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return NextResponse.json({ items: cached.items, cached: true });
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ items: STUB_NEWS, stub: true });
  }

  const countries = plan?.meta?.countries?.join(", ") ?? "multiple countries";
  const accountTypes = plan?.meta?.accounts?.map((a: { type: string }) => a.type).join(", ") ?? "various accounts";
  const goals = plan?.meta?.goals?.join(", ") ?? "financial planning";
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Today is ${today}. The user has assets in: ${countries}. Account types: ${accountTypes}. Goals: ${goals}.

Find 3-5 financial news items from the past 7 days that are highly relevant to this user's specific situation. Focus on: tax treaty changes, currency movements, retirement account rule changes, estate planning updates, or cross-border financial regulations affecting their specific countries.

Return ONLY a JSON array with this exact shape (no markdown, no extra text):
[{"headline":"...","summary":"1-2 sentences","relevance":"1 sentence explaining why this matters for this user","url":"https://...","date":"YYYY-MM-DD"}]`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prestigeworldwide.app",
      },
      body: JSON.stringify({
        model: "perplexity/sonar-pro",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const items = jsonMatch ? JSON.parse(jsonMatch[0]) : STUB_NEWS;

    // Cache to Supabase
    if (user) {
      await supabase.from("user_news").insert({ user_id: user.id, items });
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("News generation error:", err);
    return NextResponse.json({ items: STUB_NEWS, stub: true });
  }
}
