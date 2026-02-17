"use client";

import { useState } from "react";

export default function CTASection() {
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
    <section className="py-24 px-6 bg-brand-900 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-4">
          Ready to see the full picture?
        </h2>
        <p className="text-brand-100 text-lg mb-10">
          Join the waitlist and be among the first to access Prestige Worldwide.
        </p>

        {submitted ? (
          <div className="bg-white/10 border border-white/20 text-white rounded-xl px-6 py-5 inline-block">
            <p className="font-semibold">You&apos;re on the list.</p>
            <p className="text-sm mt-1 text-brand-100">
              We&apos;ll be in touch when your spot is ready.
            </p>
          </div>
        ) : (
          <form
            id="early-access-bottom"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white max-w-xs"
            />
            <button
              type="submit"
              className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Request early access
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
