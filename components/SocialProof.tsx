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
    <section className="w-full py-16 sm:py-24 px-3 sm:px-4 md:px-6 bg-white">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
            Heard from early users
          </h2>
          <p className="text-sm text-slate-400 italic">
            Early access preview — representative feedback from beta testers
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100"
            >
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 sm:mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
