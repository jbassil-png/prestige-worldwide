import Link from "next/link";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full pt-24 sm:pt-32 pb-16 sm:pb-24 px-3 sm:px-4 md:px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-5xl mx-auto">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4 sm:mb-6">
          <span className="text-brand-600">Financial planning</span> without borders
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
          AI-powered insights for expats, dual citizens, and global families.
          Connect your retirement accounts across countries and get personalized
          recommendations for taxes, retirement timing, and currency strategy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-in?demo=true"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-colors text-center shadow-lg shadow-brand-600/30"
          >
            Try Demo — No Signup Required
          </Link>
          <Link
            href="/sign-up"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg border border-slate-300 transition-colors text-center"
          >
            Get started free
          </Link>
        </div>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500">
          No credit card required. See live demo in 30 seconds.
        </p>
      </div>

      {/* Product Screenshot */}
      <div className="w-full max-w-5xl mx-auto mt-12 sm:mt-16">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
          <div className="aspect-[16/10] relative bg-gradient-to-br from-brand-50 via-white to-slate-50">
            {/* Browser chrome mockup */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-1.5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-3 flex-1 bg-white rounded text-xs text-slate-400 px-3 py-0.5 text-left">
                prestige-worldwide.app/dashboard
              </div>
            </div>
            {/* Screenshot goes here - using Image component for optimization */}
            <div className="absolute top-8 left-0 right-0 bottom-0">
              <Image
                src="/dashboard-screenshot.svg"
                alt="Prestige Worldwide Dashboard showing cross-border financial plan with retirement accounts, AI recommendations, and personalized news feed"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3 sm:mt-4">
          Live view of your personalized cross-border financial plan
        </p>
      </div>
      </div>
    </section>
  );
}
