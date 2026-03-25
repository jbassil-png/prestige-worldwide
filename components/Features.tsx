const features = [
  {
    icon: "🤖",
    title: "AI-powered financial plan",
    description:
      "Tell us your countries, accounts, and retirement goals. Get a personalized plan with cross-border tax insights, currency strategy, and on-track status — generated in seconds.",
  },
  {
    icon: "🏦",
    title: "All your accounts, unified",
    description:
      "Add accounts manually or connect via Plaid. See your net worth across 401(k)s, RRSPs, ISAs, and more — all in one place, converted to your preferred currency.",
  },
  {
    icon: "📈",
    title: "Plans that evolve with you",
    description:
      "Refresh your plan any time. Track how your outlook changes across every generation. Scheduled portfolio check-ins keep you informed between sessions.",
  },
];

export default function Features() {
  return (
    <section className="w-full py-16 sm:py-24 px-3 sm:px-4 md:px-6 bg-white">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
            Everything in one place
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto">
            Prestige Worldwide connects the financial dots that other tools
            leave scattered across spreadsheets and advisors.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-colors"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{f.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                {f.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
