'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog if API key is present
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll capture manually for better control
        capture_pageleave: true,
      });

      // Identify any already-authenticated user (e.g. returning visitors, magic link arrivals)
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && !posthog._isIdentified()) {
          posthog.identify(session.user.id, { email: session.user.email });
        }
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Hook for page view tracking
export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog.__loaded) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
