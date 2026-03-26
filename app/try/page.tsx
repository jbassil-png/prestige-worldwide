"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const RESET_TABLES = [
  "plan_history", "user_plans", "user_accounts", "user_holdings",
  "user_balance_history", "user_portfolio_news", "plaid_items",
  "user_preferences", "user_checkin_schedule", "user_goals", "user_profiles",
] as const;

const DEMOS = [
  {
    key: "free",
    label: "Free account",
    email: "demo@prestigeworldwide.com",
    password: "demo123456",
    description: "See the core planning experience — manual accounts, AI plan, chat, and news.",
  },
  {
    key: "paid",
    label: "Paid account",
    email: "paid@prestigeworldwide.com",
    password: "demo123456",
    description: "Explore paid features — Plaid connections, custom themes, and portfolio audits.",
  },
] as const;

export default function TryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<"free" | "paid" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(demo: typeof DEMOS[number]) {
    setLoading(demo.key);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });
      if (error) throw error;

      // Reset account silently so the user always starts from a clean state
      const userId = data.user?.id;
      if (userId) {
        await Promise.all(
          RESET_TABLES.map((table) =>
            supabase.from(table).delete().eq("user_id", userId)
          )
        );
      }

      router.push("/onboarding");
    } catch {
      setError("Sign in failed. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      {/* Nav */}
      <nav className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur">
        <Link href="/" className="text-base font-bold text-slate-900 tracking-tight">
          Prestige Worldwide
        </Link>
        <Link
          href="/sign-up"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
        >
          Sign up
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Try a live demo
            </h1>
            <p className="text-slate-500 text-base sm:text-lg">
              Pick an account and we'll drop you straight into a fresh onboarding flow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {DEMOS.map((demo) => (
              <div
                key={demo.key}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1">
                    {demo.label}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {demo.description}
                  </p>
                </div>
                <button
                  onClick={() => handleSignIn(demo)}
                  disabled={loading !== null}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  {loading === demo.key ? "Setting up…" : `Try ${demo.label} →`}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-red-600 mt-4">{error}</p>
          )}

          <p className="text-center text-xs text-slate-400 mt-8">
            These are shared demo accounts — your session resets each time.{" "}
            <Link href="/sign-up" className="underline hover:text-slate-600">
              Create your own account
            </Link>{" "}
            for a private experience.
          </p>
        </div>
      </div>
    </div>
  );
}
