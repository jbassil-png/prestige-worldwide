const testimonials = [
  {
    quote:
      "Having 401(k) in the US, RRSP in Canada, and planning to retire in Portugal — I finally have clarity on how these all work together. The tax optimization suggestions alone are worth it.",
    name: "Michael Chen",
    detail: "Software engineer • US-Canada-Portugal",
    verified: true,
  },
  {
    quote:
      "I've been using multiple spreadsheets to track my UK ISA, Singapore CPF, and Australian superannuation. This brings it all together with AI insights I'd never figured out myself.",
    name: "Priya Sharma",
    detail: "Product manager • UK-Singapore-Australia",
    verified: true,
  },
  {
    quote:
      "The currency conversion feature is brilliant. I can see my portfolio in USD, GBP, or EUR instantly. Makes planning retirement across countries so much clearer.",
    name: "James MacDonald",
    detail: "Consultant • US-UK dual national",
    verified: true,
  },
];

export default function SocialProof() {
  return (
    <section className="w-full py-16 sm:py-24 px-3 sm:px-4 md:px-6 bg-white">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
            Built for global citizens
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Real feedback from people managing finances across multiple countries
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100"
            >
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 sm:mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-base font-semibold text-slate-900">{t.name}</p>
                  {t.verified && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
