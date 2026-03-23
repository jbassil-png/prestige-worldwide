"use client";

import { useState } from "react";

export type ThemeId = "swiss-alps" | "gaudy-miami" | "positano";

export type StyleData = {
  theme: ThemeId;
};

const THEMES: {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  mood: string;
  colors: { bg: string; primary: string; accent: string };
  fonts: string;
}[] = [
  {
    id: "swiss-alps",
    name: "Swiss Alps Retreat",
    emoji: "❄️",
    tagline: "Precision. Clarity. Quiet confidence.",
    mood: "Minimalist and editorial — like your finances are finally under control.",
    colors: { bg: "#F1F5F9", primary: "#1E293B", accent: "#38BDF8" },
    fonts: "DM Serif Display + DM Sans",
  },
  {
    id: "gaudy-miami",
    name: "Gaudy Miami",
    emoji: "🌴",
    tagline: "Bold moves. Bright future.",
    mood: "Art Deco energy — your wealth, dressed for a rooftop at sunset.",
    colors: { bg: "#FFF0F6", primary: "#DB2777", accent: "#F59E0B" },
    fonts: "Syne + DM Sans",
  },
  {
    id: "positano",
    name: "Clooney's Positano",
    emoji: "🇮🇹",
    tagline: "Effortless. Timeless. You've earned it.",
    mood: "Mediterranean warmth — wealth that feels lived-in, not performed.",
    colors: { bg: "#FEF3C7", primary: "#92400E", accent: "#D97706" },
    fonts: "Cormorant Garamond + Lato",
  },
];

interface Props {
  onNext: (data: StyleData) => void;
  onBack?: () => void;
  loading?: boolean;
  initialValues?: StyleData;
}

export default function StepStyle({ onNext, onBack, loading, initialValues }: Props) {
  const [selected, setSelected] = useState<ThemeId | null>(initialValues?.theme ?? null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    onNext({ theme: selected });
  }

  function handleSkip() {
    onNext({ theme: "swiss-alps" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Choose your style</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pick the experience that fits your vibe. You can change it any time from settings.
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
              className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                isSelected
                  ? "border-brand-500 shadow-md"
                  : "border-gray-200 hover:border-gray-300 shadow-sm"
              }`}
            >
              {/* Colour bar */}
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
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: theme.colors.accent }}
                    >
                      {theme.tagline}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{theme.mood}</p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {/* Selection indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-brand-500 bg-brand-500"
                          : "border-gray-300 bg-white"
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

                    {/* Colour swatches */}
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

      <button
        type="submit"
        disabled={!selected || loading}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-40"
      >
        {loading ? "Building your plan…" : "Continue →"}
      </button>

      <div className="text-center space-y-1">
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
        >
          Skip — use Swiss Alps Retreat
        </button>
        <p className="text-xs text-gray-300">You can change your theme any time from settings.</p>
      </div>

      {onBack && (
        <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
          Back
        </button>
      )}
    </form>
  );
}
