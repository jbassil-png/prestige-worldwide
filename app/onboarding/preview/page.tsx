"use client";

import StepGoals from "../steps/StepGoals";
import StepCountries from "../steps/StepCountries";
import StepConnect from "../steps/StepConnect";
import StepStyle from "../steps/StepStyle";
import { MOCK_SELECTIONS, MOCK_ACCOUNTS } from "./mock";

// ─── Step wrapper ─────────────────────────────────────────────────────────────

function StepSection({
  number,
  label,
  required,
  children,
}: {
  number: number;
  label: string;
  required: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-lg mx-auto mb-10">
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {number}
        </div>
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
        {required ? (
          <span className="text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
            Required
          </span>
        ) : (
          <span className="text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
            Optional — do later
          </span>
        )}
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
      {/* Hero */}
      <div className="max-w-lg mx-auto mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">
          Prestige Worldwide
        </p>
        <h1 className="text-3xl font-bold text-gray-900 leading-snug">
          Your money doesn&apos;t stop<br />at borders.
        </h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">
          Built for expats, dual citizens, and global citizens with assets in more than one country —
          so you can finally see your full financial picture in one place.
        </p>
      </div>

      {/* Preview notice */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">🔍</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Onboarding preview</p>
            <p className="text-xs text-gray-500 mt-0.5">
              All steps are live and interactive. Navigation is disabled — nothing is saved.
              Use <strong>Enter manually</strong> in Step 4 to avoid Plaid API calls.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 — Goals */}
      <StepSection number={1} label="Goals" required={true}>
        <StepGoals
          countrySelections={MOCK_SELECTIONS}
          onNext={() => {}}
          loading={false}
        />
      </StepSection>

      {/* Step 2 — Countries */}
      <StepSection number={2} label="Assets" required={true}>
        <StepCountries onNext={() => {}} />
      </StepSection>

      {/* Step 3 — Style */}
      <StepSection number={3} label="Style" required={false}>
        <StepStyle onNext={() => {}} />
      </StepSection>

      {/* Step 4 — Connect */}
      <StepSection number={4} label="Connect" required={false}>
        <StepConnect
          selections={MOCK_SELECTIONS}
          onNext={() => {}}
          onBack={() => {}}
        />
      </StepSection>
    </div>
  );
}
