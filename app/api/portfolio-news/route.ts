import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PortfolioNewsItem } from "@/components/PortfolioNewsPanel";

const STUB_NEWS: PortfolioNewsItem[] = [
  {
    ticker: "AAPL",
    headline: "Apple reports record services revenue amid hardware slowdown",
    summary: "Apple's services segment grew 14% YoY to $26B, offsetting a 3% decline in iPhone sales as consumers delay upgrades.",
    source: "Reuters",
    url: "https://www.reuters.com",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment_label: "Somewhat-Bullish",
    sentiment_score: 0.25,
  },
  {
    ticker: "VOO",
    headline: "S&P 500 closes at record high as inflation data cools",
    summary: "The index gained 1.2% after CPI came in below expectations, raising hopes for an earlier Fed rate cut.",
    source: "Bloomberg",
    url: "https://www.bloomberg.com",
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sentiment_label: "Bullish",
    sentiment_score: 0.45,
  },
  {
    ticker: "VGRO.TO",
    headline: "Vanguard Canada raises growth ETF dividend for Q1 2026",
    summary: "VGRO's quarterly distribution increased 8% reflecting stronger underlying equity performance across its global holdings.",
    source: "Globe and Mail",
    url: "https://www.theglobeandmail.com",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sentiment_label: "Bullish",
    sentiment_score: 0.38,
  },
];

// Parse Alpha Vantage's "20260320T120000" date format
function parseAVDate(s: string): string {
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}`;
}

export async function POST(req: NextRequest) {
  const { forceRefresh } = await req.json().catch(() => ({}));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ items: [], error: "Not authenticated" });

  // Fetch user's holdings
  const { data: holdingsRows } = await supabase
    .from("user_holdings")
    .select("ticker")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const tickers = holdingsRows?.map((h) => h.ticker) ?? [];

  if (tickers.length === 0) {
    return NextResponse.json({ items: [], no_holdings: true });
  }

  // Check cache (30-minute TTL)
  if (!forceRefresh) {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("user_portfolio_news")
      .select("items")
      .eq("user_id", user.id)
      .gte("fetched_at", thirtyMinsAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached && cached.items?.length > 0) {
      return NextResponse.json({ items: cached.items, cached: true });
    }
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ items: STUB_NEWS, stub: true });
  }

  try {
    // Alpha Vantage accepts up to ~50 tickers in one call
    const tickerParam = tickers.slice(0, 50).join(",");
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tickerParam}&limit=50&sort=LATEST&apikey=${apiKey}`;

    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      // Rate limit hit — return stub with a note
      console.warn("[portfolio-news] Alpha Vantage rate limit:", data["Note"] ?? data["Information"]);
      return NextResponse.json({ items: STUB_NEWS, stub: true });
    }

    const feed: Record<string, unknown>[] = Array.isArray(data.feed) ? data.feed : [];

    const items: PortfolioNewsItem[] = feed
      .flatMap((article) => {
        const tickerSentiments = (article.ticker_sentiment as Record<string, string>[] | undefined) ?? [];

        // Find the most relevant ticker from this user's holdings
        const match = tickerSentiments
          .filter((ts) => tickers.includes(ts.ticker) && parseFloat(ts.relevance_score) > 0.1)
          .sort((a, b) => parseFloat(b.relevance_score) - parseFloat(a.relevance_score))[0];

        if (!match) return [];

        return [
          {
            ticker: match.ticker,
            headline: String(article.title ?? ""),
            summary: String(article.summary ?? ""),
            source: String(article.source ?? ""),
            url: String(article.url ?? ""),
            published_at: parseAVDate(String(article.time_published ?? "")),
            sentiment_label: String(article.overall_sentiment_label ?? "Neutral"),
            sentiment_score: Number(article.overall_sentiment_score ?? 0),
          },
        ];
      })
      .slice(0, 30);

    // Cache results
    await supabase
      .from("user_portfolio_news")
      .insert({ user_id: user.id, items });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[portfolio-news] fetch error:", err);
    return NextResponse.json({ items: STUB_NEWS, stub: true });
  }
}
