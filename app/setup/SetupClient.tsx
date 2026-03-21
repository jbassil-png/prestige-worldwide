"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepCountries, { type CountrySelection } from "@/app/onboarding/steps/StepCountries";
import StepConnect, { type Account } from "@/app/onboarding/steps/StepConnect";
import StepGoals, { type GoalsData } from "@/app/onboarding/steps/StepGoals";
import StepStyle, { type StyleData, type ThemeId } from "@/app/onboarding/steps/StepStyle";
import { createClient } from "@/lib/supabase/client";

export type SetupMeta = {
  selections?: CountrySelection[];
  accounts?: Account[];
  goals?: GoalsData;
  theme?: ThemeId;
  // Legacy fields from plans generated before the enriched meta format
  residenceCountry?: string;
  retirementCountry?: string;
  retirementYear?: number | null;
  retirementGoal?: { targetYear: number; targetAmountUsd: number } | null;
  notes?: string;
};

interface Props {
  initialData: SetupMeta;
}

type WizardData = {
  selections: CountrySelection[];
  accounts: Account[];
  goals: GoalsData;
};

const STEPS = ["Countries", "Connect", "Goals", "Style"] as const;
type StepNum = 1 | 2 | 3 | 4;

export default function SetupClient({ initialData }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<StepNum>(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStyle(data: StyleData) {
    const { goals, selections, accounts } = wizardData as WizardData;
    setGenerating(true);
    setError(null);

    sessionStorage.setItem("pw_theme", data.theme);

    try {
      const payload = {
        countries: selections.map((s) => s.country),
        accounts: accounts.map((a) => ({
          type: a.type,
          country: a.countryCode,
          balanceUsd: a.balanceUsd,
          currency: a.currency,
        })),
        retirementYear: goals.retirementYear,
        retirementGoal: goals.retirementGoal,
        residenceCountry: goals.residenceCountry,
        retirementCountry: goals.retirementCountry,
        notes: goals.notes,
      };

      const planRes = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!planRes.ok) throw new Error("Plan generation failed");
      const plan = await planRes.json();

      const meta = { ...payload, selections, accounts, goals, theme: data.theme };

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await Promise.all([
          supabase.from("user_plans").insert({
            user_id: user.id,
            plan: { ...plan, meta },
          }),
          supabase.from("user_preferences").upsert(
            { user_id: user.id, theme: data.theme },
            { onConflict: "user_id" }
          ),
        ]);
      } else {
        sessionStorage.setItem("pw_plan", JSON.stringify({ ...plan, meta }));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-brand-50 to-white">
      {/* ── Fixed progress header ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-brand-700">Update your setup</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {STEPS.map((label, i) => {
              const stepNum = (i + 1) as StepNum;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-1.5 flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isDone
                          ? "bg-brand-600 text-white"
                          : isActive
                          ? "bg-brand-600 text-white ring-2 ring-brand-200"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone ? "✓" : stepNum}
                    </div>
                    <span
                      className={`text-xs mt-0.5 font-medium transition-colors ${
                        isActive
                          ? "text-brand-700"
                          : isDone
                          ? "text-brand-500"
                          : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mb-4 transition-colors ${
                        isDone ? "bg-brand-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {error && (
        <div className="fixed top-28 inset-x-0 z-20 flex justify-center px-4">
          <div className="w-full max-w-lg text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        </div>
      )}

      {/* ── Horizontal slide track ────────────────────────────────────── */}
      <div
        className="flex will-change-transform"
        style={{
          width: `${STEPS.length * 100}%`,
          transform: `translateX(calc(-${(step - 1) * (100 / STEPS.length)}%))`,
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Step 1 — Countries */}
        <div className="w-1/4 min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
            <StepCountries
              initialValues={initialData.selections}
              onNext={(selections) => {
                setWizardData((p) => ({ ...p, selections }));
                setStep(2);
              }}
            />
          </div>
        </div>

        {/* Step 2 — Connect */}
        <div className="w-1/4 min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
            <StepConnect
              selections={wizardData.selections ?? initialData.selections ?? []}
              initialValues={initialData.accounts}
              onNext={(accounts) => {
                setWizardData((p) => ({ ...p, accounts }));
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          </div>
        </div>

        {/* Step 3 — Goals */}
        <div className="w-1/4 min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
            <StepGoals
              countrySelections={wizardData.selections ?? initialData.selections}
              initialValues={initialData.goals}
              onNext={(goals) => {
                setWizardData((p) => ({ ...p, goals }));
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          </div>
        </div>

        {/* Step 4 — Style */}
        <div className="w-1/4 min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
            <StepStyle
              initialValues={initialData.theme ? { theme: initialData.theme } : undefined}
              onNext={handleStyle}
              onBack={() => setStep(3)}
              loading={generating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
