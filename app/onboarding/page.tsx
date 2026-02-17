"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepCountries, { type CountrySelection } from "./steps/StepCountries";
import StepConnect, { type Account } from "./steps/StepConnect";
import StepGoals, { type GoalsData } from "./steps/StepGoals";
import { createClient } from "@/lib/supabase/client";

type WizardData = {
  selections: CountrySelection[];
  accounts: Account[];
};

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoals(goals: GoalsData) {
    setGenerating(true);
    setError(null);

    try {
      const payload = {
        countries: wizardData.selections!.map((s) => s.country),
        accounts: wizardData.accounts!.map((a) => ({
          type: a.type,
          country: a.name,
          balanceUsd: a.balanceUsd,
          currency: a.currency,
        })),
        goals: goals.goals,
        currentAge: goals.currentAge,
        retirementAge: goals.retirementAge,
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

      // Persist plan to Supabase (best-effort — works with or without Supabase configured)
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_plans").insert({
          user_id: user.id,
          plan: { ...plan, meta: payload },
        });
      } else {
        // No Supabase session — store in sessionStorage so dashboard can read it
        sessionStorage.setItem("pw_plan", JSON.stringify({ ...plan, meta: payload }));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  const steps = ["Countries", "Connect", "Goals"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-xl font-bold text-brand-700">Prestige Worldwide</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
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
                    className={`text-xs mt-1 font-medium ${
                      isActive ? "text-brand-700" : isDone ? "text-brand-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition ${
                      isDone ? "bg-brand-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {step === 1 && (
          <StepCountries
            onNext={(selections) => {
              setWizardData((p) => ({ ...p, selections }));
              setStep(2);
            }}
          />
        )}

        {step === 2 && wizardData.selections && (
          <StepConnect
            selections={wizardData.selections}
            onNext={(accounts) => {
              setWizardData((p) => ({ ...p, accounts }));
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && wizardData.selections && (
          <StepGoals
            countrySelections={wizardData.selections}
            onNext={handleGoals}
            onBack={() => setStep(2)}
            loading={generating}
          />
        )}
      </div>
    </div>
  );
}
