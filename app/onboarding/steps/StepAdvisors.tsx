"use client";

interface Props {
  onNext: () => void;
  onBack?: () => void;
}

const ADVISORS = [
  {
    name: "Gordon",
    country: "Canada",
    flag: "🇨🇦",
    expertise: "RRSP/TFSA optimisation, OAS + CPP strategy, cross-border withholding tax",
  },
  {
    name: "Brad",
    country: "United States",
    flag: "🇺🇸",
    expertise: "401(k)/IRA planning, FATCA compliance, US-Canada treaty elections",
  },
  {
    name: "Sophie",
    country: "United Kingdom",
    flag: "🇬🇧",
    expertise: "ISA/SIPP planning, UK pension transfers, non-dom status, double tax treaties",
  },
];

export default function StepAdvisors({ onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Meet your AI advisors</h2>
        <p className="text-sm text-gray-500 mt-1">
          Country-specific planning specialists — coming soon.
        </p>
      </div>

      <div className="space-y-3">
        {ADVISORS.map((advisor) => (
          <div
            key={advisor.name}
            className="relative rounded-xl border border-gray-200 p-4 overflow-hidden"
          >
            {/* Coming soon overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                Coming soon
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{advisor.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {advisor.name} · {advisor.country}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {advisor.expertise}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Once launched, each advisor brings country-specific expertise to your plan — tax
        treaties, account structures, and retirement strategies tailored to where you actually
        live and invest.
      </p>

      <button
        onClick={onNext}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition"
      >
        Build my plan →
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-gray-500 hover:underline"
        >
          Back
        </button>
      )}
    </div>
  );
}
