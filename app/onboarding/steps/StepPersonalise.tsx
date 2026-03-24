"use client";

import { useState } from "react";
import { THEMES } from "./StepStyle";
import type { CountrySelection } from "./StepCountries";

export type PersonaliseData = {
  theme: string;
  auditFrequency: number; // frequency_days: 30, 91, 182, 365
};

const ADVISORS_BY_CODE: Record<string, { name: string; expertise: string }> = {
  US: { name: "Brad", expertise: "401(k)/IRA planning, FATCA compliance, US-Canada treaty elections" },
  CA: { name: "Gordon", expertise: "RRSP/TFSA optimisation, OAS + CPP strategy, cross-border withholding tax" },
  GB: { name: "Sophie", expertise: "ISA/SIPP planning, UK pension transfers, non-dom status, double tax treaties" },
  SG: { name: "Mei", expertise: "CPF planning, Singapore-based investments, FBAR reporting for US persons" },
  AU: { name: "Liam", expertise: "Super fund strategy, SMSF options, CGT planning, expat tax" },
  DE: { name: "Klaus", expertise: "Riester/Rürup pensions, German tax treaties, expat allowances" },
  FR: { name: "Isabelle", expertise: "PEA/assurance vie, French retirement system, expat tax treaties" },
};

const FLAGS_BY_CODE: Record<string, string> = {
  US: "🇺🇸", CA: "🇨🇦", GB: "🇬🇧", SG: "🇸🇬", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷", OTHER: "🌍",
};

const AUDIT_FREQUENCIES = [
  { label: "Monthly", days: 30 },
  { label: "Quarterly", days: 91 },
  { label: "Twice yearly", days: 182 },
  { label: "Annually", days: 365 },
];

interface Props {
  selections: CountrySelection[];
  onNext: (data: PersonaliseData) => void;
  onBack?: () => void;
  initialValues?: PersonaliseData;
}

export default function StepPersonalise({ selections, onNext, onBack, initialValues }: Props) {
  const [selectedTheme, setSelectedTheme] = useState<string>(initialValues?.theme ?? "swiss-alps");
  const [auditFrequency, setAuditFrequency] = useState<number>(initialValues?.auditFrequency ?? 182);

  // Derive advisors from country selections (skip OTHER and countries without an advisor)
  const advisors = selections
    .filter((s) => s.countryCode !== "OTHER" && ADVISORS_BY_CODE[s.countryCode])
    .map((s) => ({
      code: s.countryCode,
      country: s.country,
      flag: FLAGS_BY_CODE[s.countryCode] ?? "🌍",
      ...ADVISORS_BY_CODE[s.countryCode],
    }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Personalise your experience</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose your visual theme, meet your advisors, and set your audit schedule.
        </p>
      </div>

      {/* ── Panel 1: Theme ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your theme</h3>
        <div className="space-y-2">
          {THEMES.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                  isSelected
                    ? "border-brand-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div
                  className="h-2 w-full"
                  style={{
                    background: `linear-gradient(to right, ${theme.colors.bg} 0%, ${theme.colors.primary} 50%, ${theme.colors.accent} 100%)`,
                  }}
                />
                <div className="p-4" style={{ backgroundColor: theme.colors.bg }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base leading-none">{theme.emoji}</span>
                        <span
                          className="text-sm font-bold truncate"
                          style={{ color: theme.colors.primary }}
                        >
                          {theme.name}
                        </span>
                      </div>
                      <p className="text-xs font-medium mb-1" style={{ color: theme.colors.accent }}>
                        {theme.tagline}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">{theme.mood}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-brand-500 bg-brand-500" : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {[theme.colors.primary, theme.colors.accent, theme.colors.bg].map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 font-mono">{theme.fonts}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* ── Panel 2: Advisors ──────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your advisors</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Auto-assigned from your selected countries. Full functionality coming soon.
          </p>
        </div>

        {advisors.length > 0 ? (
          <div className="space-y-2">
            {advisors.map((a) => (
              <div key={a.code} className="relative rounded-xl border border-gray-200 p-4 overflow-hidden">
                {/* Coming soon overlay */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                    Coming soon
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{a.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {a.name} · {a.country}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.expertise}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No country-specific advisors available for your selections yet.
          </p>
        )}
      </section>

      <hr className="border-gray-100" />

      {/* ── Panel 3: Audit frequency ───────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Portfolio audit frequency</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            How often would you like a thorough AI portfolio review delivered to your inbox?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AUDIT_FREQUENCIES.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => setAuditFrequency(opt.days)}
              className={`rounded-lg border-2 py-2.5 px-3 text-sm font-medium transition-all ${
                auditFrequency === opt.days
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => onNext({ theme: selectedTheme, auditFrequency })}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition"
      >
        Build my plan →
      </button>

      <div className="text-center space-y-1">
        <button
          type="button"
          onClick={() => onNext({ theme: "swiss-alps", auditFrequency: 182 })}
          className="text-sm text-gray-400 hover:text-gray-600 transition"
        >
          Skip — I&apos;ll set this up later in Settings
        </button>
        <p className="text-xs text-gray-300">Theme, advisors, and audit frequency are all editable from Settings.</p>
      </div>

      {onBack && (
        <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
          Back
        </button>
      )}
    </div>
  );
}
