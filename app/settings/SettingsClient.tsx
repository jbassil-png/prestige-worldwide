"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePlaidLink } from "react-plaid-link";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const COUNTRIES = [
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "SG", label: "Singapore", flag: "🇸🇬" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "OTHER", label: "Other", flag: "🌍" },
];

const CHECKIN_OPTIONS = [
  { label: "Monthly", days: 30 },
  { label: "Quarterly", days: 91 },
  { label: "Twice a year", days: 182 },
  { label: "Annually", days: 365 },
];

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "401k", label: "401(k)" },
  { value: "ira", label: "IRA" },
  { value: "roth_ira", label: "Roth IRA" },
  { value: "rrsp", label: "RRSP" },
  { value: "tfsa", label: "TFSA" },
  { value: "investment", label: "Investment" },
  { value: "pension", label: "Pension" },
  { value: "other", label: "Other" },
];

const CURRENCIES = ["USD", "CAD", "GBP", "EUR", "SGD", "AUD", "CHF", "JPY"];

const THEMES = [
  {
    id: "swiss-alps" as const,
    name: "Swiss Alps Retreat",
    emoji: "❄️",
    tagline: "Precision. Clarity. Quiet confidence.",
    mood: "Minimalist and editorial — like your finances are finally under control.",
    colors: { bg: "#F1F5F9", primary: "#1E293B", accent: "#38BDF8" },
    fonts: "DM Serif Display + DM Sans",
  },
  {
    id: "gaudy-miami" as const,
    name: "Gaudy Miami",
    emoji: "🌴",
    tagline: "Bold moves. Bright future.",
    mood: "Art Deco energy — your wealth, dressed for a rooftop at sunset.",
    colors: { bg: "#FFF0F6", primary: "#DB2777", accent: "#F59E0B" },
    fonts: "Syne + Inter",
  },
  {
    id: "positano" as const,
    name: "Clooney's Positano",
    emoji: "🇮🇹",
    tagline: "Effortless. Timeless. You've earned it.",
    mood: "Mediterranean warmth — wealth that feels lived-in, not performed.",
    colors: { bg: "#FEF3C7", primary: "#92400E", accent: "#D97706" },
    fonts: "Cormorant Garamond + Lato",
  },
];

type ThemeId = "swiss-alps" | "gaudy-miami" | "positano";

// ─── Account type ─────────────────────────────────────────────────────────────

interface UserAccount {
  id: string;
  account_id: string;
  account_name: string | null;
  account_type: string | null;
  current_balance: number | null;
  currency: string | null;
  plaid_item_id: string | null;
  created_at: string;
}

// ─── Section save state helper ────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function useSaveState() {
  const [state, setState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function setSaving() { setState("saving"); setErrorMsg(null); }
  function setSaved() {
    setState("saved");
    setTimeout(() => setState("idle"), 2500);
  }
  function setError(msg: string) { setState("error"); setErrorMsg(msg); }
  function reset() { setState("idle"); setErrorMsg(null); }

  return { state, errorMsg, setSaving, setSaved, setError, reset };
}

// ─── Inline Plaid connect button (paid users only) ────────────────────────────

function PlaidConnectButton({ onAccountsAdded }: { onAccountsAdded: (accounts: UserAccount[]) => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: useCallback(async (publicToken: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });
        const data = await res.json();
        if (data.accounts) onAccountsAdded(data.accounts);
      } catch {
        setError("Failed to fetch account balances.");
      } finally {
        setLoading(false);
        setLinkToken(null);
      }
    }, [onAccountsAdded]),
  });

  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plaid/link-token", { method: "POST" });
      const data = await res.json();
      if (data.mock) {
        // No Plaid credentials — notify user
        setError("Plaid is not configured in this environment.");
      } else {
        setLinkToken(data.link_token);
      }
    } catch {
      setError("Failed to start Plaid connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-40"
      >
        {loading ? "Connecting…" : "Connect bank account via Plaid"}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const supabase = createClient();

  // ── Loading state
  const [pageLoading, setPageLoading] = useState(true);

  // ── Upgrade state — read from URL client-side only (avoids SSR/Suspense issues)
  const [justUpgraded, setJustUpgraded] = useState(false);
  useEffect(() => {
    setJustUpgraded(new URLSearchParams(window.location.search).get("upgraded") === "true");
  }, []);
  const [upgrading, setUpgrading] = useState(false);

  // ── Countries section
  const [residenceCountry, setResidenceCountry] = useState("US");
  const [retirementCountry, setRetirementCountry] = useState("US");
  const countriesSave = useSaveState();

  // ── Goals section
  const [retirementYear, setRetirementYear] = useState("");
  const goalsSave = useSaveState();

  // ── Accounts section
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Manual add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("checking");
  const [newBalance, setNewBalance] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const accountsSave = useSaveState();

  // ── Style section
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("swiss-alps");
  const styleSave = useSaveState();

  // ── Check-ins section
  const [checkinDays, setCheckinDays] = useState(182);
  const checkinSave = useSaveState();

  // ─ Load all data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()).catch(() => ({})),
      fetch("/api/checkin-schedule").then((r) => r.json()).catch(() => ({})),
      fetch("/api/accounts").then((r) => r.json()).catch(() => ({ accounts: [] })),
      supabase.from("user_preferences").select("theme").single().then(({ data }) => data, () => null),
    ]).then(([profile, schedule, accountsData, prefs]) => {
      if (profile.residence_country) setResidenceCountry(profile.residence_country);
      if (profile.retirement_country) setRetirementCountry(profile.retirement_country);
      if (profile.retirement_year) setRetirementYear(String(profile.retirement_year));
      if (typeof profile.is_paid === "boolean") setIsPaid(profile.is_paid);
      if (schedule.frequency_days) setCheckinDays(schedule.frequency_days);
      if (accountsData.accounts) setAccounts(accountsData.accounts);
      if (prefs?.theme) setSelectedTheme(prefs.theme as ThemeId);
    }).finally(() => setPageLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─ Derived
  const retirementYearNum = parseInt(retirementYear);
  const retirementYearValid =
    !retirementYear ||
    (!isNaN(retirementYearNum) &&
      retirementYearNum > CURRENT_YEAR &&
      retirementYearNum <= CURRENT_YEAR + 60);

  // ─ Save countries
  async function saveCountries() {
    countriesSave.setSaving();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residence_country: residenceCountry,
          retirement_country: retirementCountry,
          retirement_year: retirementYear ? retirementYearNum : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      countriesSave.setSaved();
    } catch (err) {
      countriesSave.setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  // ─ Save goals
  async function saveGoals() {
    if (!retirementYearValid) return;
    goalsSave.setSaving();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residence_country: residenceCountry,
          retirement_country: retirementCountry,
          retirement_year: retirementYear ? retirementYearNum : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      goalsSave.setSaved();
    } catch (err) {
      goalsSave.setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  // ─ Delete account
  async function handleDeleteAccount(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteId(null);
    } catch {
      // silent — confirm button resets
    } finally {
      setDeletingId(null);
    }
  }

  // ─ Add manual account
  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    const balanceNum = parseFloat(newBalance);
    if (!newName.trim() || isNaN(balanceNum) || balanceNum < 0) return;
    accountsSave.setSaving();
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name: newName.trim(),
          account_type: newType,
          current_balance: balanceNum,
          currency: newCurrency,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add account");
      }
      const { account } = await res.json();
      setAccounts((prev) => [...prev, account]);
      setNewName("");
      setNewBalance("");
      setNewType("checking");
      setNewCurrency("USD");
      setShowAddForm(false);
      accountsSave.setSaved();
    } catch (err) {
      accountsSave.setError(err instanceof Error ? err.message : "Failed to add account");
    }
  }

  // ─ Save theme
  async function saveTheme(themeId: ThemeId) {
    setSelectedTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    sessionStorage.setItem("pw_theme", themeId);
    styleSave.setSaving();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({ user_id: user.id, theme: themeId }, { onConflict: "user_id" });
        if (error) throw error;
      }
      styleSave.setSaved();
    } catch {
      styleSave.setError("Failed to save theme");
    }
  }

  // ─ Stripe checkout
  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.mock) {
        // Stripe not configured yet — show coming soon alert
        alert("Paid plan coming soon. Stay tuned!");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setUpgrading(false);
    }
  }

  // ─ Save check-ins
  async function saveCheckins() {
    checkinSave.setSaving();
    try {
      const res = await fetch("/api/checkin-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency_days: checkinDays }),
      });
      if (!res.ok) throw new Error("Save failed");
      checkinSave.setSaved();
    } catch (err) {
      checkinSave.setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  // ─ Loading screen
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading your settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="font-bold text-brand-700 text-base hover:text-brand-800 transition">
          Prestige Worldwide
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">Settings</span>
        <Link
          href="/dashboard"
          className="ml-auto text-sm font-medium text-brand-600 hover:text-brand-700 transition"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Each section saves independently — change what you need without touching anything else.
          </p>
        </div>

        {justUpgraded && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
            You're now on the paid plan. Plaid bank connection is unlocked — connect your accounts below.
          </div>
        )}

        {/* ── Countries ──────────────────────────────────────────────────── */}
        <SectionCard
          title="Countries"
          subtitle="Where you live and where you plan to retire"
          saveState={countriesSave.state}
          errorMsg={countriesSave.errorMsg}
          onSave={saveCountries}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Residence country
              </label>
              <select
                value={residenceCountry}
                onChange={(e) => setResidenceCountry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Retirement country
              </label>
              <select
                value={retirementCountry}
                onChange={(e) => setRetirementCountry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── Accounts ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Accounts</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your connected and manually-entered accounts</p>
          </div>

          {/* Account list */}
          {accounts.length === 0 ? (
            <p className="text-xs text-gray-400">No accounts yet. Add one below.</p>
          ) : (
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-2.5 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {a.account_name ?? "Unnamed account"}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {a.account_type?.replace("_", " ") ?? "—"}
                      {a.current_balance != null && (
                        <> &middot; {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: a.currency ?? "USD",
                          maximumFractionDigits: 0,
                        }).format(a.current_balance)}</>
                      )}
                      {a.plaid_item_id ? " · via Plaid" : " · manual"}
                    </p>
                  </div>
                  {confirmDeleteId === a.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteAccount(a.id)}
                        disabled={deletingId === a.id}
                        className="text-xs text-red-600 hover:text-red-700 font-medium transition disabled:opacity-40"
                      >
                        {deletingId === a.id ? "Removing…" : "Confirm"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(a.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Manual add form */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full text-sm text-brand-600 hover:text-brand-700 border border-dashed border-brand-300 hover:border-brand-400 rounded-lg py-2.5 transition"
            >
              + Add account manually
            </button>
          ) : (
            <form onSubmit={handleAddAccount} className="space-y-3 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600">New account</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Account name</label>
                  <input
                    type="text"
                    placeholder="e.g. TD RRSP"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Balance</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={accountsSave.state === "saving"}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-40"
                >
                  {accountsSave.state === "saving" ? "Adding…" : "Add account"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); accountsSave.reset(); }}
                  className="px-4 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              </div>
              {accountsSave.state === "error" && (
                <p className="text-xs text-red-600">{accountsSave.errorMsg}</p>
              )}
            </form>
          )}

          {/* Plaid section */}
          <div className={`rounded-xl border p-4 space-y-3 ${isPaid ? "border-gray-200" : "border-dashed border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Connect via Plaid</span>
              {!isPaid && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  Paid plan
                </span>
              )}
            </div>
            {isPaid ? (
              <PlaidConnectButton
                onAccountsAdded={(newAccounts) =>
                  setAccounts((prev) => [...prev, ...(newAccounts as UserAccount[])])
                }
              />
            ) : (
              <>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Automatically sync balances from your bank accounts, brokerages, and retirement accounts — in any country.
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-40"
                >
                  {upgrading ? "Redirecting…" : "Upgrade to connect via Plaid"}
                </button>
                <p className="text-xs text-center text-gray-400">
                  Automatically sync balances from banks and brokerages in any country.
                </p>
              </>
            )}
          </div>

          {accountsSave.state === "saved" && (
            <p className="text-xs text-green-600">Account added.</p>
          )}
        </div>

        {/* ── Goals ──────────────────────────────────────────────────────── */}
        <SectionCard
          title="Goals"
          subtitle="Your retirement target year"
          saveState={goalsSave.state}
          errorMsg={goalsSave.errorMsg}
          onSave={saveGoals}
          saveDisabled={!retirementYearValid}
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Target retirement year{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              min={CURRENT_YEAR + 1}
              max={CURRENT_YEAR + 60}
              value={retirementYear}
              onChange={(e) => setRetirementYear(e.target.value)}
              placeholder={`e.g. ${CURRENT_YEAR + 30}`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {retirementYear && !retirementYearValid && (
              <p className="text-xs text-red-600 mt-1">
                Enter a year between {CURRENT_YEAR + 1} and {CURRENT_YEAR + 60}.
              </p>
            )}
            {retirementYear && retirementYearValid && retirementYearNum > CURRENT_YEAR && (
              <p className="text-xs text-gray-400 mt-1">
                {retirementYearNum - CURRENT_YEAR} years away
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Style ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Style</h2>
              <p className="text-xs text-gray-400 mt-0.5">Your app theme — saves instantly on selection</p>
            </div>
            {styleSave.state === "saved" && (
              <span className="text-xs text-green-600">Saved</span>
            )}
            {styleSave.state === "error" && (
              <span className="text-xs text-red-600">{styleSave.errorMsg}</span>
            )}
          </div>

          <div className="space-y-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => saveTheme(theme.id)}
                  className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                    isSelected
                      ? "border-brand-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  <div
                    className="h-1.5 w-full"
                    style={{
                      background: `linear-gradient(to right, ${theme.colors.bg} 0%, ${theme.colors.primary} 50%, ${theme.colors.accent} 100%)`,
                    }}
                  />
                  <div className="p-3.5" style={{ backgroundColor: theme.colors.bg }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm leading-none">{theme.emoji}</span>
                          <span className="text-sm font-bold truncate" style={{ color: theme.colors.primary }}>
                            {theme.name}
                          </span>
                        </div>
                        <p className="text-xs font-medium" style={{ color: theme.colors.accent }}>
                          {theme.tagline}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                          isSelected ? "border-brand-500 bg-brand-500" : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-2">{theme.fonts}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Check-ins ──────────────────────────────────────────────────── */}
        <SectionCard
          title="Portfolio check-ins"
          subtitle="How often should we prompt you to review your portfolio?"
          saveState={checkinSave.state}
          errorMsg={checkinSave.errorMsg}
          onSave={saveCheckins}
        >
          <div className="grid grid-cols-2 gap-2">
            {CHECKIN_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setCheckinDays(opt.days)}
                className={`text-sm px-3 py-2 rounded-lg border transition ${
                  checkinDays === opt.days
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Reusable section card ────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  saveState,
  errorMsg,
  onSave,
  saveDisabled,
  children,
}: {
  title: string;
  subtitle?: string;
  saveState: SaveState;
  errorMsg: string | null;
  onSave: () => void;
  saveDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {saveState === "saved" && <span className="text-xs text-green-600">Saved</span>}
          {saveState === "error" && <span className="text-xs text-red-600">{errorMsg}</span>}
          <button
            onClick={onSave}
            disabled={saveState === "saving" || saveDisabled}
            className="text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40"
          >
            {saveState === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
