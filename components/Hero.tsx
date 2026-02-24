import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
          Your finances don&apos;t stop at borders.
          <br />
          <span className="text-brand-600">Your plan shouldn&apos;t either.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Prestige Worldwide brings together your retirement accounts, tax
          obligations, and cash flows across every country you call home — so
          you can plan with the full picture.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3 rounded-lg border border-slate-300 transition-colors whitespace-nowrap"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Free to start. No credit card required.
        </p>
      </div>
    </section>
  );
}
