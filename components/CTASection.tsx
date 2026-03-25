import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "£0",
    description: "Everything you need to get started.",
    features: [
      "AI-generated financial plan",
      "Dashboard, chat & news feed",
      "Manual account entry",
      "Goal-account linking",
      "Plan history",
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "£9 / mo",
    description: "For serious cross-border planners.",
    features: [
      "Everything in Free",
      "Plaid bank connections",
      "Custom themes",
      "Country-specific AI advisors",
      "Scheduled portfolio audits",
    ],
    cta: "Start Pro trial",
    href: "/sign-up",
    highlight: true,
  },
];

export default function CTASection() {
  return (
    <section className="w-full py-16 sm:py-24 px-3 sm:px-4 md:px-6 bg-brand-900 text-white">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
          Ready to see the full picture?
        </h2>
        <p className="text-brand-100 text-base sm:text-lg mb-10 sm:mb-14">
          Start free. Upgrade when you need more.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-left">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col gap-4 ${
                tier.highlight
                  ? "bg-white text-slate-900"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`text-lg font-bold ${tier.highlight ? "text-brand-700" : "text-white"}`}>
                    {tier.name}
                  </span>
                  <span className={`text-2xl font-extrabold ${tier.highlight ? "text-slate-900" : "text-white"}`}>
                    {tier.price}
                  </span>
                </div>
                <p className={`text-sm ${tier.highlight ? "text-slate-500" : "text-brand-200"}`}>
                  {tier.description}
                </p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className={`text-sm flex gap-2 ${tier.highlight ? "text-slate-700" : "text-brand-100"}`}>
                    <span className={tier.highlight ? "text-brand-600" : "text-brand-300"}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-2 text-center font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm ${
                  tier.highlight
                    ? "bg-brand-600 hover:bg-brand-700 text-white"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
