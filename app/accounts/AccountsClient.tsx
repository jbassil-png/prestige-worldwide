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

interface Props {
  accounts: Account[];
}

export default function AccountsClient({ accounts: initial }: Props) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initial);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [showRegenBanner, setShowRegenBanner] = useState(false);

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
    if (!confirmId) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      const res = await fetch(`/api/accounts/${confirmId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove account");
      }
      setAccounts((prev) => prev.filter((a) => a.id !== confirmId));
      setConfirmId(null);
      setShowRegenBanner(true);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove account");
    } finally {
      setRemoving(false);
    }
  }

  const confirmAccount = accounts.find((a) => a.id === confirmId);

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
        <span className="font-bold text-brand-700 text-lg ml-auto">Prestige Worldwide</span>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Regen banner */}
        {showRegenBanner && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800">
              Account removed. Regenerate your plan to reflect the updated accounts.
            </p>
            <button
              onClick={() => { setShowRegenBanner(false); router.push("/dashboard"); }}
              className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition whitespace-nowrap"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your connected bank and investment accounts
              </p>
            </div>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
            >
              + Add Account
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No accounts connected yet</p>
              <button
                onClick={() => router.push("/onboarding")}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
              >
                Connect Your First Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/accounts/${account.id}`}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition">
                          {account.official_name || account.name}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {account.type}
                          {account.subtype && ` • ${account.subtype}`}
                        </span>
                      </div>
                      {account.institution_name && (
                        <p className="text-sm text-gray-500">{account.institution_name}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Connected on {formatDate(account.created_at)}
                      </p>
                    </Link>
                    <div className="flex items-start gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                        <p className="text-xs text-gray-500">{account.currency}</p>
                      </div>
                      <button
                        onClick={() => { setConfirmId(account.id); setRemoveError(null); }}
                        className="text-xs text-gray-400 hover:text-red-600 transition mt-1"
                        title="Remove account"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Total Accounts</p>
                    <p className="text-xs text-gray-500">Data synced via Plaid</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Note:</strong> Account balances are automatically refreshed from your financial institutions.
              To update your financial plan with the latest data, visit the dashboard and click "Refresh plan".
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmId && confirmAccount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove account?</h2>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{confirmAccount.official_name || confirmAccount.name}</strong>
              {confirmAccount.institution_name && ` — ${confirmAccount.institution_name}`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This account will be permanently removed from Prestige Worldwide. This action cannot be undone.
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
                onClick={() => setConfirmId(null)}
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
