import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemStatement from "@/components/ProblemStatement";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

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
