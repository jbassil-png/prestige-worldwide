import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
          Prestige Worldwide
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
