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

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, forceRefresh: true }),
      });
      const data = await res.json();
      setItems(data.items ?? []);
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

      {loading ? (
        <Skeleton />
      ) : (
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
      )}
    </div>
  );
}
