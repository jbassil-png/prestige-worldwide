"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DevResetPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleReset() {
    setStatus("loading");
    try {
      const res = await fetch("/api/dev/reset", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("done");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.errors?.join("\n") ?? data.error ?? "Unknown error");
      }
    } catch {
      setStatus("error");
      setMessage("Request failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-3xl">🛠️</div>
        <h1 className="text-lg font-bold text-gray-900">Dev Reset</h1>
        <p className="text-sm text-gray-500">
          Wipes all your user data so you can run through the full onboarding flow again with the same account.
        </p>

        {status === "done" ? (
          <div className="space-y-3">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {message}
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg text-sm transition"
            >
              Start onboarding →
            </button>
          </div>
        ) : status === "error" ? (
          <div className="space-y-3">
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 whitespace-pre-wrap">
              {message}
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-gray-500 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <button
            onClick={handleReset}
            disabled={status === "loading"}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {status === "loading" ? "Resetting…" : "Reset my data"}
          </button>
        )}

        <p className="text-xs text-gray-400">Requires <code>ALLOW_DEV_RESET=true</code> env var.</p>
      </div>
    </div>
  );
}
