// TODO: Replace with real testimonials before launch

const testimonials = [
  {
    quote:
      "I have accounts in three countries and have never had a clear picture of where I actually stand. This is exactly what I've been waiting for.",
    name: "Sarah L.",
    detail: "UK national living in Singapore, accounts in the US",
  },
  {
    quote:
      "The tax coordination across the US and Germany alone would have saved me thousands last year. The retirement modelling is genuinely eye-opening.",
    name: "Marcus T.",
    detail: "American-German dual citizen, retired early",
  },
  {
    quote:
      "Finally a tool that doesn't assume I only have a 401(k). My superannuation and ISA are just as important.",
    name: "Emma R.",
    detail: "Australian living in London",
  },
];

export default function SocialProof() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Heard from early users
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
            >
              <p className="text-slate-700 leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
