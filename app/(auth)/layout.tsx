export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <span className="text-xl sm:text-2xl font-bold text-brand-700">Prestige Worldwide</span>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Financial planning without borders</p>
        </div>
        {children}
      </div>
    </div>
  );
}
