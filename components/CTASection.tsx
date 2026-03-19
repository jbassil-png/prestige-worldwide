import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-900 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
          Ready to see the full picture?
        </h2>
        <p className="text-brand-100 text-base sm:text-lg mb-8 sm:mb-10">
          Start planning your cross-border financial future today.
        </p>

        <Link
          href="/sign-up"
          className="inline-block bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 sm:px-8 py-3 rounded-lg transition-colors"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
