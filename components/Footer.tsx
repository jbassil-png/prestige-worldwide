export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-8 sm:py-12 px-3 sm:px-4 md:px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="text-center md:text-left">
          <p className="text-white font-bold text-base sm:text-lg">Prestige Worldwide</p>
          <p className="text-xs sm:text-sm mt-1">Financial planning without borders.</p>
        </div>
        <nav className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
          {/* TODO: Add real links once pages exist */}
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>
        <p className="text-xs sm:text-sm text-center md:text-right">
          &copy; {new Date().getFullYear()} Prestige Worldwide. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
