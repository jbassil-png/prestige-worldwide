"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepCountries, { type CountrySelection, type GoalLink } from "./steps/StepCountries";
import StepConnect, { type Account } from "./steps/StepConnect";
import StepGoals, { type GoalsData, GOAL_TYPES } from "./steps/StepGoals";
import StepPersonalise, { type PersonaliseData } from "./steps/StepPersonalise";
import { createClient } from "@/lib/supabase/client";
import posthog from "posthog-js";

type WizardData = {
  goals: GoalsData;
  selections: CountrySelection[];
  goalLinks: GoalLink[];
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
const PAID_STEPS = ["Goals", "Assets", "Connect", "Personalise"] as const;

// Step positions (1-indexed) per tier
// Free:  Goals=1, Assets=2, Connect=3
// Paid:  Goals=1, Assets=2, Connect=3, Personalise=4

export default function OnboardingPage() {
  const router = useRouter();

  const [isPaid, setIsPaid] = useState<boolean | null>(null); // null = loading
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch is_paid on mount — upsert stub row so the row exists for admin to flip before onboarding
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setIsPaid(false); return; }
      // Ensure the row exists (no-op if already there)
      await supabase
        .from("user_profiles")
        .upsert(
          { user_id: user.id, residence_country: "US", retirement_country: "US" },
          { onConflict: "user_id", ignoreDuplicates: true }
        );
      const { data } = await supabase
        .from("user_profiles")
        .select("is_paid")
        .eq("user_id", user.id)
        .single();
      setIsPaid(data?.is_paid ?? false);
    });
  }, []);

  useEffect(() => {
    if (posthog.__loaded) {
      posthog.capture("onboarding_started");
    }
  }, []);

  const steps = isPaid ? PAID_STEPS : FREE_STEPS;

  const STEP_ASSETS = 2;
  const STEP_CONNECT = 3;
  const STEP_PERSONALISE = isPaid ? 4 : null;

  async function handleFinish(accounts: Account[], personalise?: PersonaliseData) {
    const { goals, selections } = wizardData as WizardData;
    const resolvedTheme = personalise?.theme ?? "swiss-alps";
    setGenerating(true);
    setError(null);

    sessionStorage.setItem("pw_theme", resolvedTheme);

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
        theme: resolvedTheme,
      });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { goalLinks = [] } = wizardData as WizardData;
      const meta = { ...payload, selections, accounts, goals, theme: resolvedTheme };

      if (user) {
        const manualAccounts = accounts.filter((a) => a.source === "manual");

        // Insert manual accounts and capture DB-generated IDs for goal linking
        const insertedAccountMeta: { dbId: string; type: string; countryCode: string }[] = [];
        await Promise.all(
          manualAccounts.map(async (a) => {
            const { data } = await supabase
              .from("user_accounts")
              .insert({
                user_id: user.id,
                account_id: `manual_${crypto.randomUUID()}`,
                account_name: a.name,
                account_type: a.type,
                current_balance: a.balanceUsd,
                currency: a.currency.toUpperCase(),
                plaid_item_id: null,
              })
              .select("id")
              .single();
            if (data?.id) {
              insertedAccountMeta.push({ dbId: data.id, type: a.type, countryCode: a.countryCode });
            }
          })
        );

        // Build goal rows — one per selected goal type, with linked account IDs
        const goalRows = goals.goalTypes.map((goalTypeId) => {
          const linkedIds = goalLinks
            .filter((gl) => gl.goalId === goalTypeId)
            .map((gl) =>
              insertedAccountMeta.find(
                (a) => a.type === gl.accountType && a.countryCode === gl.countryCode
              )?.dbId
            )
            .filter((id): id is string => !!id);

          const goalMeta = GOAL_TYPES.find((g) => g.id === goalTypeId);
          return {
            user_id: user.id,
            goal_type: goalTypeId,
            label: goalMeta?.label ?? goalTypeId,
            target_amount_usd:
              goalTypeId === "retirement" && goals.retirementGoal
                ? goals.retirementGoal.targetAmountUsd
                : null,
            target_year:
              goalTypeId === "retirement" && goals.retirementGoal
                ? goals.retirementGoal.targetYear
                : null,
            linked_account_ids: linkedIds,
          };
        });

        const saves: PromiseLike<unknown>[] = [
          supabase.from("user_plans").insert({
            user_id: user.id,
            plan: { ...plan, meta },
          }),
          supabase.from("user_preferences").upsert(
            { user_id: user.id, theme: resolvedTheme },
            { onConflict: "user_id" }
          ),
          supabase.from("user_profiles").upsert(
            {
              user_id: user.id,
              residence_country: goals.residenceCountry,
              retirement_country: goals.retirementCountry,
              retirement_year: goals.retirementYear ?? null,
            },
            { onConflict: "user_id" }
          ),
          ...(goalRows.length > 0
            ? [supabase.from("user_goals").insert(goalRows)]
            : []),
        ];

        // Save audit frequency for paid users if provided
        if (personalise?.auditFrequency) {
          saves.push(
            supabase.from("user_checkin_schedule").upsert(
              {
                user_id: user.id,
                frequency_days: personalise.auditFrequency,
                next_checkin_at: new Date(
                  Date.now() + personalise.auditFrequency * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
              { onConflict: "user_id" }
            )
          );
        }

        await Promise.all(saves);
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
        theme: resolvedTheme,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }

  // After Connect: paid users go to Personalise, free users finish directly
  function handleConnectNext(accounts: Account[]) {
    if (isPaid) {
      setPendingAccounts(accounts);
      setStep(STEP_PERSONALISE!);
    } else {
      handleFinish(accounts);
    }
  }

  function handleConnectSkip() {
    if (isPaid) {
      setPendingAccounts([]);
      setStep(STEP_PERSONALISE!);
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
              goals={wizardData.goals}
              onNext={(selections, goalLinks) => {
                setWizardData((p) => ({ ...p, selections, goalLinks }));
                setStep(STEP_CONNECT);
              }}
              onBack={() => setStep(1)}
            />
          </div>
        </div>

        {/* Step 3 — Connect (optional, all tiers) */}
        <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
          <div className="w-full max-w-lg space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <StepConnect
                selections={wizardData.selections ?? []}
                onNext={handleConnectNext}
                onBack={() => setStep(STEP_ASSETS)}
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

        {/* Step 4 — Personalise (optional, PAID ONLY) */}
        {isPaid && (
          <div style={{ width: panelWidth }} className="min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
              <StepPersonalise
                selections={wizardData.selections ?? []}
                onNext={(personalise) => handleFinish(pendingAccounts, personalise)}
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
