"use client";

import { useState } from "react";

const COUNTRIES: { code: string; label: string; flag: string; accountTypes: string[] }[] = [
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

interface Props {
  onNext: (selections: CountrySelection[]) => void;
}

export default function StepCountries({ onNext }: Props) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});

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

  function handleNext() {
    const selections: CountrySelection[] = COUNTRIES.filter(
      (c) => selected[c.code] && selected[c.code].length > 0
    ).map((c) => ({
      country: c.label,
      countryCode: c.code,
      accountTypes: selected[c.code],
    }));

    if (selections.length === 0) return;
    onNext(selections);
  }

  const hasValidSelection = Object.values(selected).some((types) => types.length > 0);

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
        onClick={handleNext}
        disabled={!hasValidSelection}
        className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-40"
      >
        Next: Connect accounts
      </button>
    </div>
  );
}
