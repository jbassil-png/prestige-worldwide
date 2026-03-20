"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Plan } from "@/components/PlanView";

interface Account {
  id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
  currency: string;
  institution_name: string | null;
}

interface Props {
  plan: Plan;
  planDate: string | null;
  accounts: Account[];
  residenceCurrency: string;
  retirementCurrency: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-green-50 border-green-200 text-green-700",
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const CATEGORY_ICONS: Record<string, string> = {
  Retirement: "🏦",
  Tax: "📋",
  Currency: "💱",
  Estate: "📜",
  Investment: "📈",
};

export default function PlanDetailClient({
  plan,
  planDate,
  accounts,
  residenceCurrency,
  retirementCurrency,
}: Props) {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const targets = [residenceCurrency, retirementCurrency]
      .filter((c) => c !== "USD")
      .join(",");
    if (!targets) {
      setRatesLoading(false);
      return;
    }
    fetch(`/api/fx?base=USD&targets=${targets}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.rates) setRates({ USD: 1, ...d.rates });
      })
      .catch(() => {
        // Silently fall back to USD rates
      })
      .finally(() => setRatesLoading(false));
  }, [residenceCurrency, retirementCurrency]);

  function formatMoney(usd: number, currency: string) {
    const rate = rates[currency] ?? 1;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(usd * rate);
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const m = plan.metrics;

  const metricCards = [
    {
      label: "Net worth",
      usd: m.netWorthUsd,
      sub: "across all accounts",
    },
    {
      label: "Years to retirement",
      value: String(m.yearsToRetirement),
      sub: "at target age",
    },
    {
      label: "Projected balance",
      usd: m.projectedRetirementBalanceUsd,
      sub: "at retirement (7% CAGR)",
    },
    {
      label: "Annual retirement income",
      usd: m.estimatedAnnualIncomeAtRetirement,
      sub: "estimated (4% rule)",
    },
  ];

  const allCategories = Array.from(
    new Set(plan.recommendations.map((r) => r.category))
  );

  const filtered = plan.recommendations.filter(
    (r) =>
      (priorityFilter === "all" || r.priority === priorityFilter) &&
      (categoryFilter === "all" || r.category === categoryFilter)
  );

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          ← Back to Dashboard
        </Link>
        <Link
          href="/plan/history"
          className="text-sm text-gray-500 hover:text-brand-600 transition ml-4"
        >
          View history →
        </Link>
        <span className="font-bold text-brand-700 text-lg ml-auto">Prestige Worldwide</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Financial Plan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated {formatDate(planDate)}
            {plan.meta?.residenceCountry && ` · ${plan.meta.residenceCountry}`}
            {plan.meta?.retirementCountry &&
              plan.meta.retirementCountry !== plan.meta.residenceCountry &&
              ` → ${plan.meta.retirementCountry}`}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{plan.summary}</p>
        </div>

        {/* Metric cards */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Financial Snapshot</h2>
          <div className="grid grid-cols-2 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                {ratesLoading && card.usd !== undefined ? (
                  <div className="h-7 w-28 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-xl font-bold text-gray-900">
                    {card.value ?? formatMoney(card.usd!, residenceCurrency)}
                  </p>
                )}
                {!ratesLoading && card.usd !== undefined && residenceCurrency !== "USD" && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatMoney(card.usd, "USD")} USD
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations with filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Recommendations
              <span className="ml-2 text-gray-400 font-normal">
                ({filtered.length} of {plan.recommendations.length})
              </span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {/* Priority filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
              >
                <option value="all">All categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No recommendations match the selected filters.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((rec, i) => (
                <div
                  key={i}
                  className={`rounded-xl border px-4 py-3 ${
                    PRIORITY_STYLES[rec.priority] ?? "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">
                      {CATEGORY_ICONS[rec.category] ?? "💡"}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {rec.category}
                    </span>
                    <span
                      className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        PRIORITY_BADGE[rec.priority] ?? ""
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account breakdown */}
        {accounts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Account Breakdown</h2>
              <Link
                href="/accounts"
                className="text-xs text-brand-600 hover:text-brand-700 transition"
              >
                Manage accounts →
              </Link>
            </div>
            <div className="space-y-2">
              {accounts.map((account) => {
                const pct = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
                return (
                  <Link
                    key={account.id}
                    href={`/accounts/${account.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-brand-700 transition truncate">
                          {account.official_name || account.name}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 shrink-0 ml-3">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: account.currency || "USD",
                            maximumFractionDigits: 0,
                          }).format(account.balance)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-brand-500 h-1.5 rounded-full"
                            style={{ width: `${pct.toFixed(1)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 w-10 text-right">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      {account.institution_name && (
                        <p className="text-xs text-gray-400 mt-0.5">{account.institution_name}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="font-bold text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(totalBalance)}
              </span>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 leading-relaxed px-1">{plan.disclaimer}</p>
      </div>
    </div>
  );
}
