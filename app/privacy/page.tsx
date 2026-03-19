import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Prestige Worldwide",
  description: "Privacy policy for Prestige Worldwide financial planning platform.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p className="text-sm text-slate-400">
            Last updated: March 19, 2026
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              1. Information We Collect
            </h2>
            <p>
              Prestige Worldwide (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects information you provide
              directly when you create an account, connect financial accounts, or use our services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, password)</li>
              <li>Financial account data via Plaid integration</li>
              <li>Personal preferences and goals</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide personalized financial planning recommendations</li>
              <li>Generate AI-powered insights and analysis</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              3. Data Security
            </h2>
            <p>
              We take data security seriously. Your financial data is encrypted in transit and at rest.
              We use industry-standard security practices including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Plaid for secure bank account connectivity</li>
              <li>Supabase for encrypted data storage</li>
              <li>HTTPS for all data transmission</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              4. Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Plaid:</strong> Bank account connectivity and financial data</li>
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>Vercel:</strong> Application hosting</li>
              <li><strong>OpenRouter:</strong> AI model access for financial recommendations</li>
              <li><strong>PostHog:</strong> Analytics and usage tracking</li>
            </ul>
            <p className="mt-2">
              Each service has its own privacy policy governing their use of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              5. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Opt out of analytics tracking</li>
              <li>Export your financial data</li>
              <li>Close your account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              6. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@prestigeworldwide.com" className="text-brand-600 hover:underline">
                privacy@prestigeworldwide.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-8 mb-4">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
