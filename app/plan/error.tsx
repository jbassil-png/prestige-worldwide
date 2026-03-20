"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/plan] error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center space-y-4">
        <p className="text-3xl">⚠️</p>
        <h1 className="text-lg font-semibold text-gray-900">
          Could not load your plan
        </h1>
        <p className="text-sm text-gray-500">
          Something went wrong fetching your financial plan. This is usually
          temporary — please try again.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
