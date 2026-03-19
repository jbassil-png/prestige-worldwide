import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Prestige Worldwide",
  description: "Terms of service for Prestige Worldwide financial planning platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p className="text-sm text-slate-400">
            Last updated: March 19, 2026
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Prestige Worldwide (&quot;Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              2. Description of Service
            </h2>
            <p>
              Prestige Worldwide provides AI-powered financial planning tools for individuals with
              cross-border financial accounts. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bank account connectivity via Plaid</li>
              <li>Financial plan generation and recommendations</li>
              <li>Multi-currency balance tracking</li>
              <li>Personalized news and insights</li>
              <li>AI-powered chat assistance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              3. Not Financial Advice
            </h2>
            <p className="font-semibold text-slate-900">
              IMPORTANT: Prestige Worldwide provides informational tools and AI-generated recommendations
              for educational purposes only. This is NOT professional financial advice.
            </p>
            <p>
              You should consult with qualified financial advisors, tax professionals, and legal counsel
              before making any financial decisions. We are not licensed financial advisors and do not
              provide personalized investment, tax, or legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              4. User Responsibilities
            </h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Not share your account with others</li>
              <li>Verify all AI-generated recommendations independently</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              5. Limitations of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Prestige Worldwide shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Financial losses resulting from use of the Service</li>
              <li>Inaccuracies in AI-generated recommendations</li>
              <li>Third-party service interruptions (Plaid, banking APIs, etc.)</li>
              <li>Data breaches or unauthorized access beyond our reasonable control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              6. Beta Service Notice
            </h2>
            <p>
              Prestige Worldwide is currently in beta. The Service may contain bugs, errors, or
              incomplete features. We make no warranties about:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service uptime or availability</li>
              <li>Accuracy of financial data or calculations</li>
              <li>Compatibility with all banks or financial institutions</li>
            </ul>
            <p className="mt-2">
              You use the beta Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              7. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms</li>
              <li>Suspected fraudulent activity</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <p className="mt-2">
              You may close your account at any time from your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              8. Intellectual Property
            </h2>
            <p>
              All content, features, and functionality of the Service are owned by Prestige Worldwide
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              9. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes
              via email or through the Service. Continued use after changes constitutes acceptance
              of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              10. Contact Us
            </h2>
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:legal@prestigeworldwide.com" className="text-brand-600 hover:underline">
                legal@prestigeworldwide.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
