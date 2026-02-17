"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  // When email confirmation is required, Supabase returns a user but no session
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // Email confirmation is disabled — session is live immediately
      router.refresh();
      router.push("/onboarding");
    } else {
      // Email confirmation is required — tell the user to check their inbox
      setConfirmationSent(true);
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/onboarding`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  }

  if (confirmationSent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">📬</div>
        <h2 className="text-lg font-semibold text-gray-800">Confirm your email</h2>
        <p className="text-sm text-gray-500">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <button
          onClick={() => setConfirmationSent(false)}
          className="text-sm text-brand-600 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  if (magicSent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">📬</div>
        <h2 className="text-lg font-semibold text-gray-800">Check your inbox</h2>
        <p className="text-sm text-gray-500">
          We sent a magic link to <strong>{email}</strong>. Click it to continue.
        </p>
        <button
          onClick={() => setMagicSent(false)}
          className="text-sm text-brand-600 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Create your account</h1>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
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
        className="w-full border border-gray-300 hover:border-brand-500 text-gray-700 font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
      >
        Sign up with a magic link
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-brand-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
