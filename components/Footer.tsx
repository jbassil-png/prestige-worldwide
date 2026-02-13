export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-lg">Prestige Worldwide</p>
          <p className="text-sm mt-1">Financial planning without borders.</p>
        </div>
        <nav className="flex gap-6 text-sm">
          {/* TODO: Add real links once pages exist */}
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Prestige Worldwide. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
