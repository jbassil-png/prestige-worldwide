"use client";

import { useState } from "react";

type NewsItem = {
  headline: string;
  summary: string;
  relevance: string;
  url: string;
  date: string;
};

interface Props {
  initialItems: NewsItem[];
  plan: object;
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function NewsPanel({ initialItems, plan }: Props) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, forceRefresh: true }),
      });
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      console.error("News refresh error:", err);
      setError("Couldn't refresh news. Showing cached items.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">What&apos;s new for your plan</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs text-brand-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-1.5 hover:border-brand-200 transition">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-800 hover:text-brand-700 leading-snug block"
              >
                {item.headline}
              </a>
              <p className="text-xs text-gray-500 leading-relaxed">{item.summary}</p>
              <p className="text-xs text-brand-600 font-medium">{item.relevance}</p>
              <p className="text-[10px] text-gray-400">{item.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No news items yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
