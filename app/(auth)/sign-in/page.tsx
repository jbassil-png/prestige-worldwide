"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";

  const [email, setEmail] = useState(isDemoMode ? "demo@prestigeworldwide.com" : "");
  const [password, setPassword] = useState(isDemoMode ? "demo123456" : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_callback_error"
      ? "The sign-in link was invalid or has expired. Please try again."
      : null
  );
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Refresh server components so the new session is visible, then navigate
    router.refresh();
    router.push("/dashboard");
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  }

  if (magicSent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-3xl sm:text-4xl">📬</div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Check your inbox</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
        <button
          onClick={() => setMagicSent(false)}
          className="text-xs sm:text-sm text-brand-600 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Sign in to your account</h1>

      {isDemoMode && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-brand-50 border border-brand-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg sm:text-xl">👋</span>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-brand-900 mb-1">
                Demo Mode
              </p>
              <p className="text-xs text-brand-700">
                Demo credentials pre-filled. Click "Sign in" to explore the dashboard with sample data.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handlePasswordSignIn} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 sm:py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 uppercase">
          <span className="bg-white px-2">or</span>
        </div>
      </div>

      <button
        onClick={handleMagicLink}
        disabled={loading}
        className="w-full border border-gray-300 hover:border-brand-500 text-gray-700 font-medium py-2.5 sm:py-2 rounded-lg text-sm transition disabled:opacity-50"
      >
        Email me a magic link
      </button>

      <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
        No account?{" "}
        <Link href="/sign-up" className="text-brand-600 hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
