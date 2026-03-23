"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepCountries, { type CountrySelection } from "./steps/StepCountries";
import StepConnect, { type Account } from "./steps/StepConnect";
import StepGoals, { type GoalsData } from "./steps/StepGoals";
import StepStyle from "./steps/StepStyle";
import StepAdvisors from "./steps/StepAdvisors";
import { createClient } from "@/lib/supabase/client";
import posthog from "posthog-js";

type WizardData = {
  goals: GoalsData;
  selections: CountrySelection[];
};

// Separate component so useSearchParams is inside a Suspense boundary
function SignupTracker() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!posthog.__loaded) return;
    if (searchParams.get("new_signup") === "true" && !sessionStorage.getItem("pw_signup_tracked")) {
      posthog.capture("user_signed_up", { method: "magic_link" });
      sessionStorage.setItem("pw_signup_tracked", "1");
    }
  }, [searchParams]);
  return null;
}

// Step labels per tier
const FREE_STEPS = ["Goals", "Assets", "Connect"] as const;
const PAID_STEPS = ["Goals", "Assets", "Style", "Connect", "Advisors"] as const;

// Step positions (1-indexed) per tier
// Free:  Goals=1, Assets=2, Connect=3
// Paid:  Goals=1, Assets=2, Style=3, Connect=4, Advisors=5

export default function OnboardingPage() {
  const router = useRouter();

  const [isPaid, setIsPaid] = useState<boolean | null>(null); // null = loading
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [theme, setTheme] = useState("swiss-alps");
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch is_paid on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setIsPaid(false); return; }
      supabase
        .from("user_profiles")
        .select("is_paid")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setIsPaid(data?.is_paid ?? false));
    });
  }, []);

  useEffect(() => {
    if (posthog.__loaded) {
      posthog.capture("onboarding_started");
    }
  }, []);

  const steps = isPaid ? PAID_STEPS : FREE_STEPS;

  // Step indices for navigation
  const STEP_ASSETS = 2;
  const STEP_STYLE = isPaid ? 3 : null;
  const STEP_CONNECT = isPaid ? 4 : 3;
  const STEP_ADVISORS = isPaid ? 5 : null;

  async function handleFinish(accounts: Account[]) {
    const { goals, selections } = wizardData as WizardData;
    setGenerating(true);
    setError(null);

    sessionStorage.setItem("pw_theme", theme);

    try {
      const currentYear = new Date().getFullYear();
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

      posthog.capture("plan_generated", {
        countries_count: payload.countries.length,
        accounts_count: payload.accounts.length,
        years_to_retirement: goals.retirementYear
          ? goals.retirementYear - currentYear
          : null,
        has_retirement_goal: !!goals.retirementGoal,
        theme,
      });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const meta = { ...payload, selections, accounts, goals, theme };

      if (user) {
        const manualAccounts = accounts.filter((a) => a.source === "manual");
        await Promise.all([
          supabase.from("user_plans").insert({
            user_id: user.id,
            plan: { ...plan, meta },
          }),
          supabase.from("user_preferences").upsert(
            { user_id: user.id, theme },
            { onConflict: "user_id" }
          ),
          ...manualAccounts.map((a) =>
            supabase.from("user_accounts").insert({
              user_id: user.id,
              account_id: `manual_${crypto.randomUUID()}`,
              account_name: a.name,
              account_type: a.type,
              current_balance: a.balanceUsd,
              currency: a.currency.toUpperCase(),
              plaid_item_id: null,
            })
          ),
        ]);
      } else {
        sessionStorage.setItem("pw_plan", JSON.stringify({ ...plan, meta }));
      }

      posthog.capture("onboarding_completed", {
        countries_count: payload.countries.length,
        accounts_count: payload.accounts.length,
        has_retirement_goal: !!goals.retirementGoal,
        years_to_retirement: goals.retirementYear
          ? goals.retirementYear - currentYear
          : null,
        theme,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  // After Connect: paid users go to Advisors, free users finish directly
  function handleConnectNext(accounts: Account[]) {
    if (isPaid) {
      setPendingAccounts(accounts);
      setStep(STEP_ADVISORS!);
    } else {
      handleFinish(accounts);
    }
  }

  function handleConnectSkip() {
    if (isPaid) {
      setPendingAccounts([]);
      setStep(STEP_ADVISORS!);
    } else {
      handleFinish([]);
    }
  }

  // Loading state while fetching is_paid
  if (isPaid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
        <svg
          className="animate-spin h-8 w-8 text-brand-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const panelWidth = `${100 / steps.length}%`;

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-brand-50 to-white">
      <Suspense><SignupTracker /></Suspense>

      {/* ── Fixed progress header ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="mb-2 text-center">
            <span className="text-sm font-bold text-brand-700">Prestige Worldwide</span>
          </div>

          <div className="flex items-center gap-1.5">
            {steps.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              const isOptional = stepNum >= 3;
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
                      {isOptional && !isActive && !isDone && (
                        <span className="text-gray-300 font-normal"> opt</span>
                      )}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
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
          width: `${steps.length * 100}%`,
          transform: `translateX(calc(-${(step - 1) * (100 / steps.length)}%))`,
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Step 1 — Goals (required, all tiers) */}
        <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
            <StepGoals
              onNext={(goals) => {
                setWizardData((p) => ({ ...p, goals }));
                setStep(STEP_ASSETS);
              }}
            />
          </div>
        </div>

        {/* Step 2 — Assets (required, all tiers) */}
        <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
            <StepCountries
              onNext={(selections) => {
                setWizardData((p) => ({ ...p, selections }));
                setStep(isPaid ? STEP_STYLE! : STEP_CONNECT);
              }}
              onBack={() => setStep(1)}
            />
          </div>
        </div>

        {/* Step 3 — Style (optional, paid only) */}
        {isPaid && (
          <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
              <StepStyle
                onNext={(data) => {
                  setTheme(data.theme);
                  setStep(STEP_CONNECT);
                }}
                onBack={() => setStep(STEP_ASSETS)}
              />
            </div>
          </div>
        )}

        {/* Step 3 (free) / Step 4 (paid) — Connect */}
        <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <StepConnect
                selections={wizardData.selections ?? []}
                onNext={handleConnectNext}
                onBack={() => setStep(isPaid ? STEP_STYLE! : STEP_ASSETS)}
                isPaid={isPaid}
              />
            </div>
            <div className="text-center space-y-1">
              <button
                onClick={handleConnectSkip}
                disabled={generating}
                className="text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
              >
                Skip — I&apos;ll connect accounts later
              </button>
              <p className="text-xs text-gray-300">You can connect accounts any time from settings.</p>
            </div>
          </div>
        </div>

        {/* Step 5 — Advisors teaser (paid only) */}
        {isPaid && (
          <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
              <StepAdvisors
                onNext={() => handleFinish(pendingAccounts)}
                onBack={() => setStep(STEP_CONNECT)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Generating overlay ────────────────────────────────────────── */}
      {generating && (
        <div className="fixed inset-0 z-30 bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <svg
              className="animate-spin h-10 w-10 text-brand-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-base font-semibold text-gray-700">Building your plan…</p>
            <p className="text-sm text-gray-400">Analysing your cross-border situation</p>
          </div>
        </div>
      )}
    </div>
  );
}
