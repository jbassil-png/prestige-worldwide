"use client";

import { useState } from "react";
import StepCountries from "../steps/StepCountries";
import StepConnect from "../steps/StepConnect";
import StepGoals from "../steps/StepGoals";
import { MOCK_SELECTIONS, MOCK_GOALS } from "./mock";

// ─── Theme placeholder ────────────────────────────────────────────────────────

const THEMES = [
  {
    id: "swiss-alps",
    name: "Swiss Alps Retreat",
    emoji: "❄️",
    mood: "Minimalist luxury. Clean lines, serene whites and slate.",
    colors: ["#F8FAFC", "#CBD5E1", "#475569"],
  },
  {
    id: "gaudy-miami",
    name: "Gaudy Miami",
    emoji: "🌴",
    mood: "Bold & energetic. Art Deco glamour, electric accents.",
    colors: ["#FFF0F6", "#F9A8D4", "#DB2777"],
  },
  {
    id: "positano",
    name: "Clooney's Positano",
    emoji: "🇮🇹",
    mood: "Effortless elegance. Mediterranean warmth and terracotta.",
    colors: ["#FFFBEB", "#FCD34D", "#B45309"],
  },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

function ThemePlaceholder() {
  const [selected, setSelected] = useState<ThemeId | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Choose your style</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pick the experience that fits your vibe. You can change it any time.
        </p>
      </div>

      <div className="space-y-3">
        {THEMES.map((theme) => {
          const isSelected = selected === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelected(theme.id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition ${
                isSelected
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Colour swatch */}
                <div className="flex gap-1 shrink-0">
                  {theme.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{theme.emoji}</span>
                    <span className="text-sm font-semibold text-gray-800">{theme.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs font-medium text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{theme.mood}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-1 space-y-2">
        <button
          disabled={!selected}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-40"
        >
          Build my plan →
        </button>
        <p className="text-center text-xs text-gray-400">
          Defaults to Swiss Alps Retreat if you skip.
        </p>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
        Placeholder — full theme previews coming once palette is finalised.
      </div>
    </div>
  );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────

function StepSection({
  number,
  label,
  children,
}: {
  number: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-lg mx-auto mb-10">
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {number}
        </div>
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* Banner */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">🔍</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Onboarding preview</p>
            <p className="text-xs text-gray-500 mt-0.5">
              All steps are live and interactive. Navigation is disabled — nothing is saved.
              Use <strong>Enter manually</strong> in Step 2 to avoid Plaid API calls.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 — Countries */}
      <StepSection number={1} label="Countries">
        <StepCountries onNext={() => {}} />
      </StepSection>

      {/* Step 2 — Connect */}
      <StepSection number={2} label="Connect">
        <StepConnect
          selections={MOCK_SELECTIONS}
          onNext={() => {}}
          onBack={() => {}}
        />
      </StepSection>

      {/* Step 3 — Goals */}
      <StepSection number={3} label="Goals">
        <StepGoals
          countrySelections={MOCK_SELECTIONS}
          onNext={() => {}}
          onBack={() => {}}
          loading={false}
        />
      </StepSection>

      {/* Step 4 — Style (placeholder) */}
      <StepSection number={4} label="Style">
        <ThemePlaceholder />
      </StepSection>
    </div>
  );
}
