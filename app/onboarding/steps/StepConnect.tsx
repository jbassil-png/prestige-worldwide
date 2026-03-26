"use client";

import { useState, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import type { CountrySelection } from "./StepCountries";
import posthog from "posthog-js";

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  US: "USD", CA: "CAD", GB: "GBP", SG: "SGD", AU: "AUD", DE: "EUR", FR: "EUR", OTHER: "USD",
};

export type Account = {
  name: string;
  type: string;
  balanceUsd: number;
  currency: string;
  countryCode: string;
  institution?: string;
  source: "plaid" | "manual";
};

interface Props {
  selections: CountrySelection[];
  onNext: (accounts: Account[]) => void;
  onBack: () => void;
  isPaid?: boolean;
  isDemoAccount?: boolean;
  initialValues?: Account[];
}

// Stub mock accounts used when Plaid is not configured
const MOCK_ACCOUNTS: Account[] = [
  { name: "Chase Checking", type: "401(k)", balanceUsd: 85000, currency: "USD", countryCode: "US", institution: "Chase", source: "plaid" },
  { name: "TD RRSP", type: "RRSP", balanceUsd: 62000, currency: "CAD", countryCode: "CA", institution: "TD Bank", source: "plaid" },
];

function PlaidConnect({ selections, onAccounts, isDemoAccount }: { selections: CountrySelection[]; onAccounts: (a: Account[]) => void; isDemoAccount?: boolean }) {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  async function fetchLinkToken() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plaid/link-token", { method: "POST" });
      const data = await res.json();
      if (data.mock) {
        // No Plaid credentials — show mock accounts immediately
        setIsMock(true);
        setAccounts(MOCK_ACCOUNTS);
      } else {
        setLinkToken(data.link_token);
      }
    } catch {
      setError("Failed to connect to Plaid. Use manual entry instead.");
    }
    setLoading(false);
  }

  const onSuccess = useCallback(async (publicToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: publicToken }),
      });
      const data = await res.json();
      setAccounts((data.accounts ?? []).map((a: Omit<Account, "source">) => ({ ...a, source: "plaid" as const })));
      setLinkToken(null);

      // Track successful bank connection
      posthog.capture('bank_connected', {
        accounts_count: data.accounts?.length || 0,
        source: 'plaid',
      });
    } catch {
      setError("Failed to fetch account balances.");
      // Track failed connection
      posthog.capture('bank_connection_failed', {
        source: 'plaid',
        error: 'exchange_failed',
      });
    }
    setLoading(false);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess,
  });

  if (accounts) {
    return (
      <div className="space-y-3">
        {isMock && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Plaid not configured — showing demo accounts.
          </p>
        )}
        <p className="text-sm font-medium text-gray-700">Connected accounts</p>
        <div className="space-y-2">
          {accounts.map((a, i) => (
            <div key={i} className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{a.name}</p>
                <p className="text-xs text-gray-500">{a.institution ?? "—"} · {a.type}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {a.currency} {a.balanceUsd.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => onAccounts(accounts)}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          Use these accounts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Connect your bank accounts securely via Plaid to pull live balances.
      </p>

      {/* Security trust callout */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-gray-700">How it works</p>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">✓</span>
            <span><strong>Read-only access</strong> — we never see your login credentials or move any money</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">✓</span>
            <span><strong>Bank-level encryption</strong> via Plaid, trusted by thousands of financial apps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">✓</span>
            <span><strong>Balances only</strong> — we use your account balances to build your plan, nothing else</span>
          </li>
        </ul>
      </div>

      {isDemoAccount ? (
        /* Demo mode: show sandbox credentials, let user open the Plaid Link with them */
        <div className="space-y-3">
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-brand-800">Demo — use Plaid sandbox credentials</p>
            <p className="text-xs text-brand-700 leading-relaxed">
              This is a test environment. Use the credentials below when Plaid asks you to log in to a bank:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-white rounded-lg border border-brand-100 px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Username</p>
                <p className="text-sm font-mono font-semibold text-gray-800">user_good</p>
              </div>
              <div className="bg-white rounded-lg border border-brand-100 px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Password</p>
                <p className="text-sm font-mono font-semibold text-gray-800">pass_good</p>
              </div>
            </div>
            <p className="text-xs text-brand-600">
              Select any institution (e.g. Chase) when prompted.
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!linkToken ? (
            <button
              onClick={fetchLinkToken}
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Connecting…" : "Open Plaid Link →"}
            </button>
          ) : (
            <button
              onClick={() => open()}
              disabled={!ready}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              Open Plaid Link →
            </button>
          )}
        </div>
      ) : (
        <>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!linkToken ? (
            <button
              onClick={fetchLinkToken}
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Connecting…" : "Connect via Plaid"}
            </button>
          ) : (
            <button
              onClick={() => open()}
              disabled={!ready}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              Open Plaid Link
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ManualEntry({ selections, onAccounts }: { selections: CountrySelection[]; onAccounts: (a: Account[]) => void }) {
  const [balances, setBalances] = useState<Record<string, string>>({});

  const rows = selections.flatMap((s) =>
    s.accountTypes.map((type) => ({
      key: `${s.countryCode}__${type}`,
      label: `${type}`,
      flag: s.countryCode,
      currency: CURRENCY_BY_COUNTRY[s.countryCode] ?? "USD",
      country: s.country,
    }))
  );

  function handleSubmit() {
    const accounts: Account[] = rows.map((r) => ({
      name: `${r.label} (${r.country})`,
      type: r.label,
      balanceUsd: parseFloat(balances[r.key] ?? "0") || 0,
      currency: r.currency,
      countryCode: r.flag,
      source: "manual",
    }));
    onAccounts(accounts);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter approximate balances for each account. Estimates are fine — you can update them any time from Settings.
      </p>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">{r.label}</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-300">
                  {r.currency}
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={balances[r.key] ?? ""}
                  onChange={(e) => setBalances((p) => ({ ...p, [r.key]: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
      >
        Use these balances
      </button>
    </div>
  );
}

export default function StepConnect({ selections, onNext, onBack, isPaid, isDemoAccount, initialValues }: Props) {
  const [tab, setTab] = useState<"plaid" | "manual">(isPaid ? "plaid" : "manual");
  const [accounts, setAccounts] = useState<Account[] | null>(initialValues ?? null);

  if (accounts) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Accounts confirmed</h2>
          <p className="text-sm text-gray-500 mt-1">These balances will be used to build your plan.</p>
        </div>
        <div className="space-y-2">
          {accounts.map((a, i) => (
            <div key={i} className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{a.name}</p>
                <p className="text-xs text-gray-500">{a.type}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {a.currency} {a.balanceUsd.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => onNext(accounts)}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          {isPaid ? "Next →" : "Build my plan →"}
        </button>
        <button onClick={() => setAccounts(null)} className="w-full text-sm text-gray-500 hover:underline">
          Change accounts
        </button>
      </div>
    );
  }

  // ── Free tier: no tab switcher — manual entry only, with upgrade CTA ─────
  if (!isPaid) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Add your balances</h2>
          <p className="text-sm text-gray-500 mt-1">Enter approximate balances to personalise your plan.</p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-base mt-0.5">🔒</span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-800">You&apos;re on the free plan — manual entry only</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Upgrade to sync live balances automatically via Plaid.{" "}
              <button
                type="button"
                onClick={() => {
                  fetch("/api/stripe/checkout", { method: "POST" })
                    .then((r) => r.json())
                    .then((d) => { if (d.url) window.location.href = d.url; });
                }}
                className="font-semibold underline underline-offset-2 hover:text-amber-900 transition"
              >
                Upgrade →
              </button>
            </p>
          </div>
        </div>

        <ManualEntry selections={selections} onAccounts={setAccounts} />

        <button onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
          Back
        </button>
      </div>
    );
  }

  // ── Paid tier: Plaid + manual tabs ────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Connect your accounts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Link accounts automatically via Plaid, or enter balances manually. Either way, your plan will be personalised to your real numbers.
        </p>
      </div>

      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {(["plaid", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium transition ${
              tab === t ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "plaid" ? "Connect via Plaid" : "Enter manually"}
          </button>
        ))}
      </div>

      {tab === "plaid" ? (
        <PlaidConnect selections={selections} onAccounts={setAccounts} isDemoAccount={isDemoAccount} />
      ) : (
        <ManualEntry selections={selections} onAccounts={setAccounts} />
      )}

      <button onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
        Back
      </button>
    </div>
  );
}
