"use client";

import { useState } from "react";
import type { CountrySelection } from "./StepCountries";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_RETIREMENT_YEAR = CURRENT_YEAR + 29; // ~29 years out

export type RetirementGoal = {
  targetYear: number;
  targetAmountUsd: number;
};

export type GoalsData = {
  retirementYear: number | null;
  residenceCountry: string;
  retirementCountry: string;
  retirementGoal: RetirementGoal | null;
  notes: string;
};

interface Props {
  countrySelections: CountrySelection[];
  onNext: (goals: GoalsData) => void;
  onBack: () => void;
  loading?: boolean;
}

function formatAmount(val: string): string {
  const numeric = val.replace(/[^0-9]/g, "");
  if (!numeric) return "";
  return Number(numeric).toLocaleString("en-US");
}

function parseAmount(val: string): number {
  return parseInt(val.replace(/,/g, ""), 10) || 0;
}

export default function StepGoals({ countrySelections, onNext, onBack, loading }: Props) {
  const countryOptions = countrySelections.map((s) => s.country);

  const [residenceCountry, setResidenceCountry] = useState(
    countryOptions.length === 1 ? countryOptions[0] : ""
  );
  const [retirementCountry, setRetirementCountry] = useState(
    countryOptions.length === 1 ? countryOptions[0] : ""
  );

  // Default retirement goal — pre-populated, user can edit or remove
  const [goalEnabled, setGoalEnabled] = useState(true);
  const [retirementYear, setRetirementYear] = useState(String(DEFAULT_RETIREMENT_YEAR));
  const [targetAmountDisplay, setTargetAmountDisplay] = useState("2,000,000");
  const [notes, setNotes] = useState("");

  const yearsAway = parseInt(retirementYear) - CURRENT_YEAR;
  const targetAmountUsd = parseAmount(targetAmountDisplay);
  const retirementYearNum = parseInt(retirementYear);

  const retirementYearValid =
    !isNaN(retirementYearNum) &&
    retirementYearNum > CURRENT_YEAR &&
    retirementYearNum <= CURRENT_YEAR + 60;

  const isValid =
    residenceCountry.length > 0 &&
    (!goalEnabled || (retirementYearValid && targetAmountUsd > 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      retirementYear: goalEnabled && retirementYearValid ? retirementYearNum : null,
      residenceCountry,
      retirementCountry: retirementCountry || residenceCountry,
      retirementGoal: goalEnabled && retirementYearValid && targetAmountUsd > 0
        ? { targetYear: retirementYearNum, targetAmountUsd }
        : null,
      notes,
    });
  }

  function handleSkip() {
    onNext({
      retirementYear: null,
      residenceCountry: residenceCountry || countryOptions[0] || "United States",
      retirementCountry: retirementCountry || residenceCountry || countryOptions[0] || "United States",
      retirementGoal: null,
      notes: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Where are you headed?</h2>
        <p className="text-sm text-gray-500 mt-1">
          We&apos;ve suggested a starting point — edit anything that doesn&apos;t fit.
        </p>
      </div>

      {/* Residence / retirement country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current country of residence
        </label>
        <select
          required
          value={residenceCountry}
          onChange={(e) => {
            setResidenceCountry(e.target.value);
            if (!retirementCountry) setRetirementCountry(e.target.value);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Select country</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Projected retirement country{" "}
          <span className="text-gray-400">(optional)</span>
        </label>
        <select
          value={retirementCountry}
          onChange={(e) => setRetirementCountry(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Same as residence</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Default retirement goal card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-base">🏦</span>
            <span className="text-sm font-semibold text-gray-800">Retirement goal</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">suggested</span>
          </div>
          <button
            type="button"
            onClick={() => setGoalEnabled((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            {goalEnabled ? "Remove" : "Add back"}
          </button>
        </div>

        {goalEnabled ? (
          <div className="px-4 py-4 space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Target year
                </label>
                <input
                  type="number"
                  min={CURRENT_YEAR + 1}
                  max={CURRENT_YEAR + 60}
                  value={retirementYear}
                  onChange={(e) => setRetirementYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {retirementYearValid && (
                  <p className="text-xs text-gray-400 mt-1">{yearsAway} years away</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Target amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetAmountDisplay}
                    onChange={(e) => setTargetAmountDisplay(formatAmount(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Not sure what target to set?{" "}
              <button
                type="button"
                className="text-brand-600 hover:underline font-medium"
                onClick={() => {
                  // Opens chat panel — handled by parent via global event
                  window.dispatchEvent(new CustomEvent("pw:open-chat", {
                    detail: { prompt: "Help me figure out how much I need for retirement" }
                  }));
                }}
              >
                Ask our planning assistant →
              </button>
            </p>
          </div>
        ) : (
          <div className="px-4 py-3 bg-white">
            <p className="text-xs text-gray-400">
              No retirement goal set — you can add one any time from your dashboard.
            </p>
          </div>
        )}
      </div>

      {/* Optional notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anything else?{" "}
          <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. I'm planning to move to Portugal in 5 years…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-40"
      >
        {loading ? "Setting up your dashboard…" : "Continue"}
      </button>

      {/* Skip option — no guilt messaging */}
      <div className="text-center space-y-1">
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
        >
          Skip for now — I just want to track my accounts
        </button>
        <p className="text-xs text-gray-300">You can set goals any time from your dashboard.</p>
      </div>

      <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
        Back
      </button>
    </form>
  );
}
