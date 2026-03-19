import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
          <span className="hidden sm:inline">Prestige Worldwide</span>
          <span className="sm:hidden">Prestige</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <Link
            href="/sign-in"
            className="text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium px-2.5 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
