"use client";

import { useState } from "react";
import type { CountrySelection } from "./StepCountries";
import { COUNTRIES } from "./StepCountries";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_RETIREMENT_YEAR = CURRENT_YEAR + 29;

export const GOAL_TYPES = [
  { id: "retirement", label: "Retirement", emoji: "🏖️" },
  { id: "property", label: "Property purchase", emoji: "🏠" },
  { id: "education", label: "Children's education", emoji: "🎓" },
  { id: "emergency", label: "Emergency fund", emoji: "🛡️" },
  { id: "travel", label: "Travel / sabbatical", emoji: "✈️" },
  { id: "tax", label: "Tax optimisation", emoji: "📊" },
  { id: "wealth", label: "Grow my wealth", emoji: "📈" },
  { id: "other", label: "Something else", emoji: "💡" },
] as const;

type GoalTypeId = (typeof GOAL_TYPES)[number]["id"];

export type RetirementGoal = {
  targetYear: number;
  targetAmountUsd: number;
};

export type GoalsData = {
  goalTypes: GoalTypeId[];
  retirementYear: number | null;
  residenceCountry: string;
  retirementCountry: string;
  retirementGoal: RetirementGoal | null;
  notes: string;
};

interface Props {
  countrySelections?: CountrySelection[];
  onNext: (goals: GoalsData) => void;
  onBack?: () => void;
  loading?: boolean;
  initialValues?: GoalsData;
}

function formatAmount(val: string): string {
  const numeric = val.replace(/[^0-9]/g, "");
  if (!numeric) return "";
  return Number(numeric).toLocaleString("en-US");
}

function parseAmount(val: string): number {
  return parseInt(val.replace(/,/g, ""), 10) || 0;
}

export default function StepGoals({ countrySelections = [], onNext, onBack, loading, initialValues }: Props) {
  // Country options: prefer selections already made, fall back to the full list
  const countryOptions =
    countrySelections.length > 0
      ? countrySelections.map((s) => s.country)
      : COUNTRIES.filter((c) => c.code !== "OTHER").map((c) => c.label);

  const [goalTypes, setGoalTypes] = useState<GoalTypeId[]>(initialValues?.goalTypes ?? []);
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [residenceCountry, setResidenceCountry] = useState(
    initialValues?.residenceCountry ?? (countryOptions.length === 1 ? countryOptions[0] : "")
  );
  const [retirementCountry, setRetirementCountry] = useState(
    initialValues?.retirementCountry ?? (countryOptions.length === 1 ? countryOptions[0] : "")
  );
  const [goalEnabled, setGoalEnabled] = useState(initialValues ? initialValues.retirementGoal !== null : true);
  const [retirementYear, setRetirementYear] = useState(
    String(initialValues?.retirementYear ?? initialValues?.retirementGoal?.targetYear ?? DEFAULT_RETIREMENT_YEAR)
  );
  const [targetAmountDisplay, setTargetAmountDisplay] = useState(
    initialValues?.retirementGoal
      ? initialValues.retirementGoal.targetAmountUsd.toLocaleString("en-US")
      : "2,000,000"
  );

  const hasRetirement = goalTypes.includes("retirement");
  const yearsAway = parseInt(retirementYear) - CURRENT_YEAR;
  const targetAmountUsd = parseAmount(targetAmountDisplay);
  const retirementYearNum = parseInt(retirementYear);

  const retirementYearValid =
    !isNaN(retirementYearNum) &&
    retirementYearNum > CURRENT_YEAR &&
    retirementYearNum <= CURRENT_YEAR + 60;

  const isValid =
    goalTypes.length > 0 &&
    residenceCountry.length > 0 &&
    (!hasRetirement || !goalEnabled || (retirementYearValid && targetAmountUsd > 0));

  function toggleGoalType(id: GoalTypeId) {
    setGoalTypes((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      goalTypes,
      retirementYear: hasRetirement && goalEnabled && retirementYearValid ? retirementYearNum : null,
      residenceCountry,
      retirementCountry: retirementCountry || residenceCountry,
      retirementGoal:
        hasRetirement && goalEnabled && retirementYearValid && targetAmountUsd > 0
          ? { targetYear: retirementYearNum, targetAmountUsd }
          : null,
      notes,
    });
  }

  function handleSkip() {
    onNext({
      goalTypes: [],
      retirementYear: null,
      residenceCountry: residenceCountry || countryOptions[0] || "United States",
      retirementCountry: retirementCountry || residenceCountry || countryOptions[0] || "United States",
      retirementGoal: null,
      notes: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Let&apos;s get to know your situation</h2>
        <p className="text-sm text-gray-500 mt-1">
          A few quick questions so we can personalise your plan.
        </p>
      </div>

      {/* Country fields — lead the form */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Where do you live today?
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
            Where do you plan to retire?
          </label>
          <select
            value={retirementCountry}
            onChange={(e) => setRetirementCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Not sure yet</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Goal type chips */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are you planning for?{" "}
          <span className="text-gray-400 font-normal">Select all that apply.</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {GOAL_TYPES.map((g) => {
            const isSelected = goalTypes.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoalType(g.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                  isSelected
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:border-brand-400"
                }`}
              >
                <span>{g.emoji}</span>
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial situation — prominent text field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tell us about your financial situation
          <span className="text-gray-400 font-normal"> (optional but helpful)</span>
        </label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. I'm a US-Canadian dual citizen living in Toronto. I have a 401(k) from a previous US employer and a TFSA here. I'm thinking about retiring in Europe around 2050 and want to understand my tax position across all three countries…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          This goes directly to your planning assistant. The more context, the better the advice.
        </p>
      </div>

      {/* Retirement-specific fields — only when retirement is selected */}
      {hasRetirement && (
        <>

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
        </>
      )}

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-40"
      >
        {loading ? "Setting up your dashboard…" : "Continue"}
      </button>

      <div className="text-center space-y-1">
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
        >
          Skip for now — I just want to explore
        </button>
        <p className="text-xs text-gray-300">You can set goals any time from your dashboard.</p>
      </div>

      {onBack && (
        <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
          Back
        </button>
      )}
    </form>
  );
}
