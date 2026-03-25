import Link from "next/link";
import NavbarAuthButtons from "./NavbarAuthButtons";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
          <span className="hidden sm:inline">Prestige Worldwide</span>
          <span className="sm:hidden">Prestige</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <NavbarAuthButtons />
        </div>
      </div>
    </nav>
  );
}
