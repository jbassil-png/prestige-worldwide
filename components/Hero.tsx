import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full pt-24 sm:pt-32 pb-16 sm:pb-24 px-3 sm:px-4 md:px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4 sm:mb-6">
          Your finances don&apos;t stop at borders.
          <br />
          <span className="text-brand-600">Your plan shouldn&apos;t either.</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Prestige Worldwide brings together your retirement accounts, tax
          obligations, and cash flows across every country you call home — so
          you can plan with the full picture.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-colors text-center"
          >
            Get started
          </Link>
          <Link
            href="/sign-in?demo=true"
            className="bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg border border-brand-300 transition-colors text-center"
          >
            Try Demo
          </Link>
          <Link
            href="/sign-in"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg border border-slate-300 transition-colors text-center"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500">
          Free to start. No credit card required.{" "}
          <span className="inline-block mt-1 sm:mt-0 sm:ml-2 text-brand-600">
            Demo mode available for quick preview.
          </span>
        </p>
      </div>
    </section>
  );
}
