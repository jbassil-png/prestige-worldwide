const steps = [
  {
    number: "01",
    title: "Connect your accounts",
    description:
      "Link bank accounts, brokerage accounts, pension providers, and property holdings — no matter which country they're in.",
  },
  {
    number: "02",
    title: "See your full picture",
    description:
      "Your net worth, tax exposure, retirement runway, and cash flow — all unified, in your preferred currency.",
  },
  {
    number: "03",
    title: "Get a personalized plan",
    description:
      "Receive actionable recommendations tailored to your countries, accounts, and goals. No generic advice.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
            How it works
          </h2>
          <p className="text-base sm:text-lg text-slate-500">
            From scattered accounts to a coherent strategy in three steps.
          </p>
        </div>
        <div className="space-y-6 sm:space-y-10">
          {steps.map((step, i) => (
            <div key={step.number} className="flex gap-4 sm:gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-brand-600 text-white flex items-center justify-center text-base sm:text-xl font-bold">
                {step.number}
              </div>
              <div className="pt-1 sm:pt-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1 sm:mb-2">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
