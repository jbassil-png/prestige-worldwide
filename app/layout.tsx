import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider, PostHogPageView } from "@/lib/posthog/provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Prestige Worldwide — Financial planning without borders",
  description:
    "Retirement, taxes, and cash flow planning for people with assets in multiple countries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
