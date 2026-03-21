"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function SettingsPage() {
  const router = useRouter();

  const [residenceCountry, setResidenceCountry] = useState("US");
  const [retirementCountry, setRetirementCountry] = useState("US");
  const [retirementYear, setRetirementYear] = useState<string>("");
  const [checkinDays, setCheckinDays] = useState(182);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/checkin-schedule").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([profile, schedule]) => {
        if (profile.residence_country) setResidenceCountry(profile.residence_country);
        if (profile.retirement_country) setRetirementCountry(profile.retirement_country);
        if (profile.retirement_year) setRetirementYear(String(profile.retirement_year));
        if (schedule.frequency_days) setCheckinDays(schedule.frequency_days);
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const retirementYearNum = parseInt(retirementYear);
  const retirementYearValid =
    !retirementYear ||
    (!isNaN(retirementYearNum) &&
      retirementYearNum > CURRENT_YEAR &&
      retirementYearNum <= CURRENT_YEAR + 60);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!retirementYearValid) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

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
        const data = await res.json();
        throw new Error(data.error || `Save failed (${res.status})`);
      }

      // Save check-in schedule
      await fetch("/api/checkin-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency_days: checkinDays }),
      }).catch(() => {/* non-blocking */});

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading your profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="font-bold text-brand-700 text-base hover:text-brand-800 transition">
          Prestige Worldwide
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">Settings</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Profile Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Update your countries and preferences. Your financial plan regenerates automatically when you save.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Countries */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Countries</h2>

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

          {/* Retirement */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Retirement</h2>

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
          </div>

          {/* Check-in frequency */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Portfolio check-ins</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                How often should we prompt you to review your portfolio?
              </p>
            </div>

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
          </div>

          {/* Feedback */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              Saved! Redirecting to your dashboard…
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !retirementYearValid}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
