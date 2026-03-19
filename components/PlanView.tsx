"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CurrencyMode } from "./CurrencyToggle";

type Metrics = {
  netWorthUsd: number;
  yearsToRetirement: number;
  projectedRetirementBalanceUsd: number;
  estimatedAnnualIncomeAtRetirement: number;
};

type Recommendation = {
  category: string;
  priority: "high" | "medium" | "low";
  text: string;
};

export type Plan = {
  summary: string;
  metrics: Metrics;
  recommendations: Recommendation[];
  disclaimer: string;
  meta?: {
    residenceCountry?: string;
    retirementCountry?: string;
  };
};

interface Props {
  plan: Plan;
  currencyMode: CurrencyMode;
  residenceCurrency: string;
  retirementCurrency: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-green-50 border-green-200 text-green-700",
};

const CATEGORY_ICONS: Record<string, string> = {
  Retirement: "🏦",
  Tax: "📋",
  Currency: "💱",
  Estate: "📜",
  Investment: "📈",
};

function formatMoney(usd: number, mode: CurrencyMode, rates: Record<string, number>, residenceCur: string, retirementCur: string) {
  if (mode === "native") {
    return `~$${(usd / 1000).toFixed(0)}k USD equiv.`;
  }
  const currency = mode === "residence" ? residenceCur : retirementCur;
  const rate = rates[currency] ?? 1;
  const converted = usd * rate;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}

export default function PlanView({ plan, currencyMode, residenceCurrency, retirementCurrency }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [accountCount, setAccountCount] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    // Fetch FX rates once
    fetch(`/api/fx?base=USD&targets=${residenceCurrency},${retirementCurrency}`)
      .then((r) => r.json())
      .then((d) => setRates({ USD: 1, ...d.rates }));
  }, [residenceCurrency, retirementCurrency]);

  useEffect(() => {
    // Fetch insight
    fetch("/api/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
      .then((r) => r.json())
      .then((d) => setInsight(d.insight));
  }, [plan]);

  useEffect(() => {
    // Fetch connected account count
    async function fetchAccountCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from("user_accounts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        setAccountCount(count ?? 0);
      }
    }
    fetchAccountCount();
  }, [supabase]);

  const fmt = (usd: number) =>
    formatMoney(usd, currencyMode, rates, residenceCurrency, retirementCurrency);

  const metricCards = [
    { label: "Net worth", value: fmt(plan.metrics.netWorthUsd) },
    { label: "Years to retirement", value: String(plan.metrics.yearsToRetirement) },
    { label: "Projected balance", value: fmt(plan.metrics.projectedRetirementBalanceUsd) },
    { label: "Annual income at retirement", value: fmt(plan.metrics.estimatedAnnualIncomeAtRetirement) },
  ];

  const byPriority = ["high", "medium", "low"];
  const grouped = byPriority
    .map((p) => ({
      priority: p,
      items: plan.recommendations.filter((r) => r.priority === p),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {insight && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-brand-700 mb-1">Today&apos;s spotlight</p>
          <p className="text-sm text-brand-900 leading-relaxed">{insight}</p>
        </div>
      )}

      <p className="text-sm text-gray-700 leading-relaxed">{plan.summary}</p>

      {/* Account metrics header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Your Financial Snapshot</h3>
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {accountCount > 0 ? `${accountCount} account${accountCount !== 1 ? 's' : ''} synced` : 'Accounts connected'}
            </span>
          </div>
          <a
            href="/accounts"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage accounts
          </a>
        </div>

        <p className="text-xs text-gray-600">
          💡 Numbers below are automatically synced from your connected bank and investment accounts via Plaid
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricCards.map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className="text-lg font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Recommendations</h3>
        {grouped.map(({ priority, items }) => (
          <div key={priority} className="space-y-2">
            {items.map((rec, i) => (
              <div
                key={i}
                className={`rounded-xl border px-4 py-3 ${PRIORITY_STYLES[priority] ?? ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{CATEGORY_ICONS[rec.category] ?? "💡"}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide">{rec.category}</span>
                  <span
                    className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      priority === "high"
                        ? "bg-red-100 text-red-700"
                        : priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {priority}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 leading-relaxed">
        {plan.disclaimer}
      </p>
    </div>
  );
}
