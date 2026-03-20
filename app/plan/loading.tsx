export default function PlanDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded ml-4" />
        <div className="h-5 w-36 bg-gray-200 rounded ml-auto" />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-7 w-52 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-4/5 bg-gray-100 rounded" />
          <div className="h-3 w-3/5 bg-gray-100 rounded" />
        </div>

        {/* Metrics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="h-4 w-36 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 px-4 py-3 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
