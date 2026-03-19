"use client";

import { useRouter } from "next/navigation";

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

export default function AccountsClient({ accounts }: Props) {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          ← Back to Dashboard
        </button>
        <span className="font-bold text-brand-700 text-lg ml-auto">Prestige Worldwide</span>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
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
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-xs text-gray-500">{account.currency}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Total Accounts</p>
                    <p className="text-xs text-gray-500">
                      Data synced via Plaid
                    </p>
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
    </div>
  );
}
