"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Account {
  id: string;
  account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
  currency: string;
  institution_name: string | null;
  created_at: string;
}

interface HistoryPoint {
  balance_usd: number;
  currency: string;
  recorded_at: string;
}

interface Recommendation {
  category: string;
  priority: string;
  text: string;
}

interface Props {
  account: Account;
  history: HistoryPoint[];
  recommendations: Recommendation[];
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-blue-50 border-blue-200 text-blue-700",
};

function BalanceChart({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        Not enough history to display a chart yet.
      </p>
    );
  }

  const values = history.map((h) => h.balance_usd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 600;
  const H = 120;
  const PAD = 8;

  const points = history.map((h, i) => {
    const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - h.balance_usd) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const first = points[0].split(",");
  const last = points[points.length - 1].split(",");

  // Fill area under the line
  const fillPath = `M${first[0]},${H} L${polyline.replace(/ /g, " L")} L${last[0]},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-28"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#chartFill)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* First and last dots */}
      <circle cx={first[0]} cy={first[1]} r="3" fill="#2563eb" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#2563eb" />
    </svg>
  );
}

export default function AccountDetailClient({
  account,
  history,
  recommendations,
}: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  async function handleRemove() {
    setRemoving(true);
    setRemoveError(null);
    try {
      const res = await fetch(`/api/accounts/${account.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove account");
      }
      router.push("/accounts");
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove account");
      setRemoving(false);
    }
  }

  const latestHistory = history[history.length - 1];
  const earliestHistory = history[0];
  const balanceChange =
    history.length >= 2
      ? latestHistory.balance_usd - earliestHistory.balance_usd
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link
          href="/accounts"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          ← Back to Accounts
        </Link>
        <span className="font-bold text-brand-700 text-lg ml-auto">Prestige Worldwide</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Account overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {account.official_name || account.name}
              </h1>
              {account.institution_name && (
                <p className="text-sm text-gray-500 mt-0.5">{account.institution_name}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {account.type}
                  {account.subtype && ` • ${account.subtype}`}
                </span>
                <span className="text-xs text-gray-400">
                  Connected {formatDate(account.created_at)}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <p className="text-xs text-gray-500">{account.currency}</p>
              {balanceChange !== null && (
                <p
                  className={`text-xs mt-1 font-medium ${
                    balanceChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {balanceChange >= 0 ? "▲" : "▼"}{" "}
                  {formatCurrency(Math.abs(balanceChange), account.currency)} since first sync
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Balance history chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Balance History</h2>
          <BalanceChart history={history} />
          {history.length >= 2 && (
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{formatDate(earliestHistory.recorded_at)}</span>
              <span>{formatDate(latestHistory.recorded_at)}</span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Plan Recommendations
            </h2>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div
                  key={i}
                  className={`border rounded-lg px-4 py-3 text-sm ${
                    PRIORITY_STYLES[r.priority] ?? "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <span className="font-medium capitalize">{r.category}:</span> {r.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link
            href="/accounts"
            className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition"
          >
            ← All accounts
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg text-sm transition"
          >
            Remove this account
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove account?</h2>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{account.official_name || account.name}</strong>
              {account.institution_name && ` — ${account.institution_name}`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This account will be permanently removed. This action cannot be undone.
            </p>

            {removeError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {removeError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
              >
                {removing ? "Removing…" : "Yes, remove"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={removing}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
