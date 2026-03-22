import type { Metadata } from "next";
import "./globals.css";
// Self-hosted fonts via @fontsource — no build-time network fetch required
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/syne/400.css";
import "@fontsource/syne/500.css";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import { PostHogProvider, PostHogPageView } from "@/lib/posthog/provider";
import { Suspense } from "react";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="swiss-alps" className="overflow-x-hidden">
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
