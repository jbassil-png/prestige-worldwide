"use client";

import { useState } from "react";
import type { CountrySelection } from "./StepCountries";

const GOAL_OPTIONS = [
  { id: "tax", label: "Minimize double taxation" },
  { id: "retirement", label: "Maximize retirement income" },
  { id: "estate", label: "Estate planning" },
  { id: "currency", label: "Currency strategy" },
  { id: "moveproof", label: "Build a move-proof plan" },
];

export type GoalsData = {
  currentAge: number;
  retirementAge: number;
  residenceCountry: string;
  retirementCountry: string;
  goals: string[];
  notes: string;
};

interface Props {
  countrySelections: CountrySelection[];
  onNext: (goals: GoalsData) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function StepGoals({ countrySelections, onNext, onBack, loading }: Props) {
  const countryOptions = countrySelections.map((s) => s.country);

  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("65");
  const [residenceCountry, setResidenceCountry] = useState(
    countryOptions.length === 1 ? countryOptions[0] : ""
  );
  const [retirementCountry, setRetirementCountry] = useState(
    countryOptions.length === 1 ? countryOptions[0] : ""
  );
  const [goals, setGoals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function toggleGoal(id: string) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      currentAge: parseInt(currentAge),
      retirementAge: parseInt(retirementAge),
      residenceCountry,
      retirementCountry: retirementCountry || residenceCountry,
      goals,
      notes,
    });
  }

  const isValid =
    parseInt(currentAge) > 0 &&
    parseInt(retirementAge) > parseInt(currentAge) &&
    residenceCountry.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Your goals</h2>
        <p className="text-sm text-gray-500 mt-1">Help us personalise your plan.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current age</label>
          <input
            type="number"
            min="18"
            max="85"
            required
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
            placeholder="e.g. 38"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target retirement age</label>
          <input
            type="number"
            min="40"
            max="90"
            required
            value={retirementAge}
            onChange={(e) => setRetirementAge(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current country of residence</label>
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
          Projected retirement country <span className="text-gray-400">(optional)</span>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => {
            const active = goals.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  active
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anything else? <span className="text-gray-400">(optional)</span>
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
        {loading ? "Generating your plan…" : "Generate my plan"}
      </button>

      <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
        Back
      </button>
    </form>
  );
}
