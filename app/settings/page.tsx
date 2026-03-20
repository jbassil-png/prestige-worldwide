"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function SettingsPage() {
  const router = useRouter();

  const [residenceCountry, setResidenceCountry] = useState("US");
  const [retirementCountry, setRetirementCountry] = useState("US");
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.residence_country) setResidenceCountry(data.residence_country);
        if (data.retirement_country) setRetirementCountry(data.retirement_country);
        if (data.current_age) setCurrentAge(data.current_age);
        if (data.retirement_age) setRetirementAge(data.retirement_age);
      })
      .catch(() => {/* no existing profile, use defaults */})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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
          current_age: currentAge,
          retirement_age: retirementAge,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Save failed (${res.status})`);
      }

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
          Update your countries and ages. Your financial plan will regenerate automatically when you save.
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

          {/* Ages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Ages</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Current age
                </label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Retirement age
                </label>
                <input
                  type="number"
                  min={19}
                  max={100}
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {currentAge >= retirementAge && (
              <p className="text-xs text-red-600">Retirement age must be greater than current age.</p>
            )}
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
              disabled={saving || currentAge >= retirementAge}
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
