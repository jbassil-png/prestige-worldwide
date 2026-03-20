export default function PlanHistoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-36 bg-gray-200 rounded ml-auto" />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-2 mb-6">
          <div className="h-7 w-36 bg-gray-200 rounded" />
          <div className="h-4 w-52 bg-gray-200 rounded" />
        </div>

        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-xl px-5 py-4 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-5 w-24 bg-gray-100 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
