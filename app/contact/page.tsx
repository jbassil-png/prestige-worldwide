import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Prestige Worldwide",
  description: "Get in touch with the Prestige Worldwide team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="text-sm sm:text-base font-bold text-slate-900 hover:text-brand-600 transition-colors"
          >
            ← Back to Prestige Worldwide
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
          Contact Us
        </h1>

        <div className="space-y-8">
          <p className="text-lg text-slate-600">
            We&apos;re here to help! Reach out to us for support, questions, or feedback.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-3xl mb-3">📧</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Email Support</h2>
              <p className="text-sm text-slate-600 mb-3">
                For general inquiries and support questions
              </p>
              <a
                href="mailto:support@prestigeworldwide.com"
                className="text-brand-600 hover:underline font-medium text-sm"
              >
                support@prestigeworldwide.com
              </a>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-3xl mb-3">🐛</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Bug Reports</h2>
              <p className="text-sm text-slate-600 mb-3">
                Found a bug? Let us know so we can fix it
              </p>
              <a
                href="mailto:bugs@prestigeworldwide.com"
                className="text-brand-600 hover:underline font-medium text-sm"
              >
                bugs@prestigeworldwide.com
              </a>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-3xl mb-3">🔒</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Security & Privacy</h2>
              <p className="text-sm text-slate-600 mb-3">
                Security concerns or privacy questions
              </p>
              <a
                href="mailto:security@prestigeworldwide.com"
                className="text-brand-600 hover:underline font-medium text-sm"
              >
                security@prestigeworldwide.com
              </a>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-3xl mb-3">💼</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Business & Partnerships</h2>
              <p className="text-sm text-slate-600 mb-3">
                Interested in partnering with us?
              </p>
              <a
                href="mailto:business@prestigeworldwide.com"
                className="text-brand-600 hover:underline font-medium text-sm"
              >
                business@prestigeworldwide.com
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">How do I reset my password?</h3>
                <p className="text-sm text-slate-600">
                  Visit the{" "}
                  <Link href="/sign-in" className="text-brand-600 hover:underline">
                    sign-in page
                  </Link>{" "}
                  and click &quot;Email me a magic link&quot; to receive a passwordless login link.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Is my financial data secure?</h3>
                <p className="text-sm text-slate-600">
                  Yes! We use bank-level encryption and industry-standard security practices. Your data
                  is encrypted in transit and at rest. See our{" "}
                  <Link href="/privacy" className="text-brand-600 hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Which countries do you support?</h3>
                <p className="text-sm text-slate-600">
                  We currently support US, Canada, UK, Australia, Singapore, Germany, France, Spain,
                  Italy, Netherlands, and more. See the onboarding flow for the complete list of
                  supported countries and account types.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">How do I delete my account?</h3>
                <p className="text-sm text-slate-600">
                  Contact us at{" "}
                  <a href="mailto:support@prestigeworldwide.com" className="text-brand-600 hover:underline">
                    support@prestigeworldwide.com
                  </a>{" "}
                  with your account email, and we&apos;ll process your deletion request within 48 hours.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Do you offer financial advice?</h3>
                <p className="text-sm text-slate-600">
                  No. Prestige Worldwide provides informational tools and AI-generated recommendations
                  for educational purposes only. Always consult with licensed financial advisors for
                  personalized advice. See our{" "}
                  <Link href="/terms" className="text-brand-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
