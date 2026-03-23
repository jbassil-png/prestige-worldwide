import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets the OTP caller specify where to land after auth.
  // Only allow same-origin relative paths (no protocol-relative or external URLs).
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If this looks like a new sign-up (user created within the last 60 seconds),
      // pass a flag so the destination page can fire the user_signed_up analytics event.
      const user = data.session?.user;
      const isNewUser =
        user?.created_at &&
        Date.now() - new Date(user.created_at).getTime() < 60_000;
      const destination = isNewUser
        ? `${origin}${next}${next.includes("?") ? "&" : "?"}new_signup=true`
        : `${origin}${next}`;
      return NextResponse.redirect(destination);
    }
  }

  // Something went wrong — send back to sign-in with an error hint
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`);
}
