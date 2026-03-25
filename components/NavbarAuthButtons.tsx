"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NavbarAuthButtons() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Render nothing until we know auth state — avoids flash
  if (loggedIn === null) return null;

  if (loggedIn) {
    return (
      <Link
        href="/dashboard"
        className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium px-2.5 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Dashboard →
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium px-2.5 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Sign up
      </Link>
    </>
  );
}
