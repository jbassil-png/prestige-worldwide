"use client";

import { useEffect, useState } from "react";
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

      <div className="grid grid-cols-2 gap-3">
        {metricCards.map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
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
