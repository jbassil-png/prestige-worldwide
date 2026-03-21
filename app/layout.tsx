import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider, PostHogPageView } from "@/lib/posthog/provider";
import { Suspense } from "react";
import {
  DM_Serif_Display,
  DM_Sans,
  Syne,
  Cormorant_Garamond,
  Lato,
} from "next/font/google";

// Swiss Alps Retreat ❄️
const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});
const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Gaudy Miami 🌴
const syne = Syne({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

// Clooney's Positano 🇮🇹
const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});
const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prestige Worldwide — Financial planning without borders",
  description:
    "Retirement, taxes, and cash flow planning for people with assets in multiple countries.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

const fontVars = [
  dmSerifDisplay.variable,
  dmSans.variable,
  syne.variable,
  cormorantGaramond.variable,
  lato.variable,
].join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="swiss-alps" className={`overflow-x-hidden ${fontVars}`}>
      <body className="overflow-x-hidden w-full">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
