"use client";

import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await fetch("/api/email/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
  }

  return (
    <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block bg-brand-100 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Now in private beta
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
          Your finances don&apos;t stop at borders.
          <br />
          <span className="text-brand-600">Your plan shouldn&apos;t either.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Prestige Worldwide brings together your retirement accounts, tax
          obligations, and cash flows across every country you call home — so
          you can plan with the full picture.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-6 py-5 inline-block">
            <p className="font-semibold">You&apos;re on the list.</p>
            <p className="text-sm mt-1 text-green-700">
              We&apos;ll be in touch when your spot is ready.
            </p>
          </div>
        ) : (
          <form
            id="early-access"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Request early access
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-slate-400">
          No spam, ever. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}
