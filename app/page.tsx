import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemStatement from "@/components/ProblemStatement";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prestige Worldwide | Cross-Border Financial Planning for Expats",
  description:
    "AI-powered financial planning for people with assets across multiple countries. Connect retirement accounts, optimize taxes, and get personalized recommendations for US, Canada, UK, and more.",
  keywords: [
    "cross-border finance",
    "expat financial planning",
    "international retirement",
    "multi-country tax planning",
    "401k RRSP ISA",
    "dual citizen finance",
    "global financial planning",
  ],
  authors: [{ name: "Prestige Worldwide" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prestige-worldwide-kappa.vercel.app",
    siteName: "Prestige Worldwide",
    title: "Prestige Worldwide | Financial Planning Without Borders",
    description:
      "AI-powered financial planning for expats, dual citizens, and global families. Manage retirement accounts, taxes, and currencies across multiple countries.",
    images: [
      {
        url: "https://prestige-worldwide-kappa.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prestige Worldwide - Cross-Border Financial Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prestige Worldwide | Financial Planning Without Borders",
    description:
      "AI-powered financial planning for people with assets across multiple countries. Built for expats, dual citizens, and global families.",
    images: ["https://prestige-worldwide-kappa.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <Navbar />
      <main className="w-full">
        <Hero />
        <ProblemStatement />
        <Features />
        <HowItWorks />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
