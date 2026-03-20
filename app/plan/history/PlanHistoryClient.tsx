"use client";

import { useState } from "react";
import Link from "next/link";
import type { Plan } from "@/components/PlanView";

interface BalanceSnapshot {
  [accountName: string]: number;
}

interface HistoryEntry {
  id: string;
  plan: Plan;
  trigger_reason: string;
  balance_snapshot: BalanceSnapshot | null;
  created_at: string;
}

interface Props {
  entries: HistoryEntry[];
}

const TRIGGER_LABELS: Record<string, { label: string; style: string }> = {
  onboarding: { label: "Onboarding", style: "bg-blue-50 text-blue-700 border-blue-200" },
  balance_change: { label: "Balance change", style: "bg-amber-50 text-amber-700 border-amber-200" },
  market_change: { label: "Market change", style: "bg-purple-50 text-purple-700 border-purple-200" },
  scheduled: { label: "Scheduled", style: "bg-gray-50 text-gray-600 border-gray-200" },
  user_request: { label: "Manual refresh", style: "bg-green-50 text-green-700 border-green-200" },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-green-50 border-green-200 text-green-700",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(usd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

function PlanEntryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const trigger = TRIGGER_LABELS[entry.trigger_reason] ?? {
    label: entry.trigger_reason,
    style: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const m = entry.plan.metrics;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Summary row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(entry.created_at)}
              </span>
              <span
                className={`text-xs border px-2 py-0.5 rounded-full font-medium ${trigger.style}`}
              >
                {trigger.label}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-400">Net worth</p>
                <p className="text-sm font-bold text-gray-900">{formatMoney(m.netWorthUsd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Yrs to retirement</p>
                <p className="text-sm font-bold text-gray-900">{m.yearsToRetirement}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Projected balance</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatMoney(m.projectedRetirementBalanceUsd)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Annual income</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatMoney(m.estimatedAnnualIncomeAtRetirement)}
                </p>
              </div>
            </div>
          </div>
          <span className="text-gray-400 text-sm shrink-0 mt-0.5">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
          {/* Summary */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Summary
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{entry.plan.summary}</p>
          </div>

          {/* Balance snapshot */}
          {entry.balance_snapshot &&
            Object.keys(entry.balance_snapshot).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Account balances at generation
                </p>
                <div className="space-y-1">
                  {Object.entries(entry.balance_snapshot).map(([name, bal]) => (
                    <div key={name} className="flex justify-between text-xs text-gray-600">
                      <span>{name}</span>
                      <span className="font-medium">{formatMoney(bal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Recommendations */}
          {entry.plan.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Recommendations
              </p>
              <div className="space-y-2">
                {entry.plan.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      PRIORITY_STYLES[rec.priority] ?? "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="font-semibold capitalize">{rec.category}:</span>{" "}
                    {rec.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlanHistoryClient({ entries }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link
          href="/plan"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          ← Current plan
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          Dashboard
        </Link>
        <span className="font-bold text-brand-700 text-lg ml-auto">Prestige Worldwide</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Plan History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your last {entries.length} generated plan{entries.length !== 1 ? "s" : ""}, newest first
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No plan history yet.</p>
            <Link
              href="/dashboard"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <PlanEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
