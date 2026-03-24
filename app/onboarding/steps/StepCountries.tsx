"use client";

import { useState } from "react";
import { GOAL_TYPES, type GoalsData } from "./StepGoals";

export const COUNTRIES: { code: string; label: string; flag: string; accountTypes: string[] }[] = [
  { code: "US", label: "United States", flag: "🇺🇸", accountTypes: ["401(k)", "IRA / Roth IRA", "Brokerage", "529 (Education)"] },
  { code: "CA", label: "Canada", flag: "🇨🇦", accountTypes: ["RRSP", "TFSA", "RESP", "Non-registered"] },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧", accountTypes: ["ISA", "SIPP (Pension)", "General Investment"] },
  { code: "SG", label: "Singapore", flag: "🇸🇬", accountTypes: ["CPF (OA/SA/MA)", "SRS", "Brokerage"] },
  { code: "AU", label: "Australia", flag: "🇦🇺", accountTypes: ["Superannuation", "Brokerage"] },
  { code: "DE", label: "Germany", flag: "🇩🇪", accountTypes: ["Riester", "Rürup", "Depot (Brokerage)"] },
  { code: "FR", label: "France", flag: "🇫🇷", accountTypes: ["PEA", "Assurance-vie", "PER"] },
  { code: "OTHER", label: "Other", flag: "🌍", accountTypes: ["Bank / Savings", "Investment account"] },
];

export type CountrySelection = {
  country: string;
  countryCode: string;
  accountTypes: string[];
};

export type GoalLink = {
  countryCode: string;
  accountType: string;
  goalId: string; // goal type ID (e.g. "retirement") or "unallocated"
};

interface Props {
  onNext: (selections: CountrySelection[], goalLinks: GoalLink[]) => void;
  onBack?: () => void;
  initialValues?: CountrySelection[];
  goals?: GoalsData;
}

export default function StepCountries({ onNext, onBack, initialValues, goals }: Props) {
  const [selected, setSelected] = useState<Record<string, string[]>>(
    () => Object.fromEntries((initialValues ?? []).map((s) => [s.countryCode, s.accountTypes]))
  );
  const [phase, setPhase] = useState<"selection" | "linking">("selection");
  const [goalLinks, setGoalLinks] = useState<GoalLink[]>([]);

  const goalTypes = goals?.goalTypes ?? [];
  const hasGoals = goalTypes.length > 0;

  function toggleCountry(code: string) {
    setSelected((prev) => {
      if (prev[code]) {
        const next = { ...prev };
        delete next[code];
        return next;
      }
      return { ...prev, [code]: [] };
    });
  }

  function toggleAccountType(code: string, type: string) {
    setSelected((prev) => {
      const types = prev[code] ?? [];
      if (types.includes(type)) {
        return { ...prev, [code]: types.filter((t) => t !== type) };
      }
      return { ...prev, [code]: [...types, type] };
    });
  }

  function buildSelections(): CountrySelection[] {
    return COUNTRIES.filter(
      (c) => selected[c.code] && selected[c.code].length > 0
    ).map((c) => ({
      country: c.label,
      countryCode: c.code,
      accountTypes: selected[c.code],
    }));
  }

  // All selected account type rows (countryCode + accountType pairs)
  function buildAccountRows() {
    return COUNTRIES.flatMap((c) =>
      (selected[c.code] ?? []).map((type) => ({
        key: `${c.code}__${type}`,
        countryCode: c.code,
        flag: c.flag,
        accountType: type,
      }))
    );
  }

  function handleSelectionNext() {
    const selections = buildSelections();
    if (selections.length === 0) return;

    if (!hasGoals) {
      // No goals selected — skip linking, mark everything unallocated
      const links = buildAccountRows().map((r) => ({
        countryCode: r.countryCode,
        accountType: r.accountType,
        goalId: "unallocated",
      }));
      onNext(selections, links);
      return;
    }

    // Initialise goalLinks with all accounts set to "unallocated"
    setGoalLinks(
      buildAccountRows().map((r) => ({
        countryCode: r.countryCode,
        accountType: r.accountType,
        goalId: "unallocated",
      }))
    );
    setPhase("linking");
  }

  function setLink(countryCode: string, accountType: string, goalId: string) {
    setGoalLinks((prev) =>
      prev.map((l) =>
        l.countryCode === countryCode && l.accountType === accountType
          ? { ...l, goalId }
          : l
      )
    );
  }

  function handleLinkingNext() {
    onNext(buildSelections(), goalLinks);
  }

  const hasValidSelection = Object.values(selected).some((types) => types.length > 0);
  const accountRows = buildAccountRows();

  // ── Phase 2: Goal linking ───────────────────────────────────────────────────
  if (phase === "linking") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Assign accounts to your goals</h2>
          <p className="text-sm text-gray-500 mt-1">
            Which goal does each account support? Anything left unassigned goes into your{" "}
            <span className="font-medium text-gray-700">Unallocated</span> bucket.
          </p>
        </div>

        <div className="space-y-2">
          {accountRows.map((row) => {
            const link = goalLinks.find(
              (l) => l.countryCode === row.countryCode && l.accountType === row.accountType
            );
            return (
              <div
                key={row.key}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 bg-white"
              >
                <span className="text-base shrink-0">{row.flag}</span>
                <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{row.accountType}</span>
                <select
                  value={link?.goalId ?? "unallocated"}
                  onChange={(e) => setLink(row.countryCode, row.accountType, e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shrink-0"
                >
                  <option value="unallocated">Unallocated</option>
                  {goalTypes.map((id) => {
                    const meta = GOAL_TYPES.find((g) => g.id === id);
                    return (
                      <option key={id} value={id}>
                        {meta ? `${meta.emoji} ${meta.label}` : id}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400">
          You can update these assignments any time from Settings.
        </p>

        <button
          onClick={handleLinkingNext}
          className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          Continue →
        </button>

        <button
          type="button"
          onClick={() => setPhase("selection")}
          className="w-full text-sm text-gray-500 hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  // ── Phase 1: Country + account type selection ───────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Where are your assets?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select each country and tick the account types you hold there.
        </p>
      </div>

      <div className="space-y-3">
        {COUNTRIES.map((c) => {
          const isSelected = !!selected[c.code];
          return (
            <div
              key={c.code}
              className={`rounded-xl border transition ${
                isSelected ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCountry(c.code)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="text-xl">{c.flag}</span>
                <span className="font-medium text-gray-800 text-sm">{c.label}</span>
                <span
                  className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-brand-600 bg-brand-600" : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 10 8" className="w-3 h-3 text-white fill-current">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>

              {isSelected && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {c.accountTypes.map((type) => {
                    const checked = selected[c.code]?.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleAccountType(c.code, type)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${
                          checked
                            ? "bg-brand-600 text-white border-brand-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSelectionNext}
        disabled={!hasValidSelection}
        className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-40"
      >
        {hasGoals ? "Continue →" : "Continue →"}
      </button>

      {onBack && (
        <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
          Back
        </button>
      )}
    </div>
  );
}
