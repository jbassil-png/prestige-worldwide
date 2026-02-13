const features = [
  {
    icon: "🏦",
    title: "Retirement across jurisdictions",
    description:
      "See all your retirement accounts in one place — 401(k), pension, ISA, superannuation, and more. Model withdrawal strategies that account for each country's rules and treaties.",
  },
  {
    icon: "📊",
    title: "Tax optimization",
    description:
      "Understand your real tax burden across countries. Identify treaty benefits, avoid double taxation, and plan around filing deadlines in every jurisdiction you touch.",
  },
  {
    icon: "💱",
    title: "Cash flow & currency",
    description:
      "Track income, expenses, and savings across currencies. Model FX risk, optimize when and where to hold assets, and project net worth in any base currency.",
  },
];

export default function Features() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything in one place
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Prestige Worldwide connects the financial dots that other tools
            leave scattered across spreadsheets and advisors.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-colors"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {f.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
