"use client";

import { useState, useRef } from "react";
import type { PortfolioNewsItem } from "@/app/api/portfolio-news/route";

interface Holding {
  id: string;
  ticker: string;
  asset_type: string;
}

interface Props {
  initialHoldings: Holding[];
  initialNews: PortfolioNewsItem[];
}

const SENTIMENT_STYLES: Record<string, { dot: string; label: string }> = {
  Bullish:           { dot: "bg-green-500",  label: "text-green-700" },
  "Somewhat-Bullish":{ dot: "bg-green-400",  label: "text-green-600" },
  Neutral:           { dot: "bg-gray-400",   label: "text-gray-500"  },
  "Somewhat-Bearish":{ dot: "bg-red-400",    label: "text-red-600"   },
  Bearish:           { dot: "bg-red-600",    label: "text-red-700"   },
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

function NewsItemCard({ item }: { item: PortfolioNewsItem }) {
  const sentiment = SENTIMENT_STYLES[item.sentiment_label] ?? SENTIMENT_STYLES["Neutral"];
  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-1.5 hover:border-brand-200 transition">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
          {item.ticker}
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${sentiment.dot}`} />
          <span className={`text-[10px] font-medium ${sentiment.label}`}>
            {item.sentiment_label.replace("-", " ")}
          </span>
        </span>
        <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(item.published_at)}</span>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-gray-800 hover:text-brand-700 leading-snug block"
      >
        {item.headline}
      </a>
      <p className="text-xs text-gray-500 leading-relaxed">{item.summary}</p>
      <p className="text-[10px] text-gray-400">{item.source}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2 animate-pulse">
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function PortfolioNewsPanel({ initialHoldings, initialNews }: Props) {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [news, setNews] = useState<PortfolioNewsItem[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [tickerInput, setTickerInput] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchNews(forceRefresh = false) {
    setLoading(true);
    setNewsError(null);
    try {
      const res = await fetch("/api/portfolio-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh }),
      });
      const data = await res.json();
      setNews(data.items ?? []);
    } catch {
      setNewsError("Couldn't load news. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addHolding() {
    const ticker = tickerInput.trim().toUpperCase();
    if (!ticker) return;

    setAddError(null);
    try {
      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Failed to add ticker");
        return;
      }
      const updated = [...holdings, data.holding];
      setHoldings(updated);
      setTickerInput("");
      setAdding(false);
      // Refresh news for the updated ticker list
      fetchNews(true);
    } catch {
      setAddError("Failed to add ticker");
    }
  }

  async function removeHolding(ticker: string) {
    try {
      await fetch("/api/holdings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const updated = holdings.filter((h) => h.ticker !== ticker);
      setHoldings(updated);
      if (updated.length === 0) {
        setNews([]);
      } else {
        fetchNews(true);
      }
    } catch {
      // Silently ignore — UI already optimistically removed it
    }
  }

  const noHoldings = holdings.length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Portfolio News</h2>
        {!noHoldings && (
          <button
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="text-xs text-brand-600 hover:underline disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>

      {/* Holdings chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {holdings.map((h) => (
          <span
            key={h.ticker}
            className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
          >
            {h.ticker}
            <button
              onClick={() => removeHolding(h.ticker)}
              className="text-gray-400 hover:text-red-500 transition leading-none ml-0.5"
              aria-label={`Remove ${h.ticker}`}
            >
              ×
            </button>
          </span>
        ))}

        {/* Add ticker */}
        {adding ? (
          <span className="inline-flex items-center gap-1">
            <input
              ref={inputRef}
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") addHolding();
                if (e.key === "Escape") { setAdding(false); setTickerInput(""); setAddError(null); }
              }}
              placeholder="e.g. AAPL"
              maxLength={12}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase"
              autoFocus
            />
            <button
              onClick={addHolding}
              className="text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 px-2 py-1 rounded-lg transition"
            >
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setTickerInput(""); setAddError(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium transition"
          >
            + Add ticker
          </button>
        )}
      </div>

      {addError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {addError}
        </p>
      )}

      {/* News */}
      {noHoldings ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm font-medium text-gray-600 mb-1">No holdings yet</p>
          <p className="text-xs text-gray-400">
            Add tickers above to see news for the stocks and ETFs you own.
          </p>
        </div>
      ) : newsError ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {newsError}
        </p>
      ) : loading ? (
        <Skeleton />
      ) : news.length > 0 ? (
        <div className="space-y-3">
          {news.map((item, i) => (
            <NewsItemCard key={i} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            No recent news found for your holdings.
          </p>
        </div>
      )}
    </div>
  );
}
