import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!process.env.PLAID_CLIENT_ID) {
      // Stub: no Plaid credentials — tell the client to use mock accounts
      return NextResponse.json({ mock: true });
    }

    const { Configuration, PlaidApi, PlaidEnvironments } = await import("plaid");

    const config = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV ?? "sandbox"],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
          "PLAID-SECRET": process.env.PLAID_SECRET!,
        },
      },
    });

    const client = new PlaidApi(config);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Prestige Worldwide",
      products: ["transactions" as never],
      country_codes: ["US", "CA", "GB"] as never[],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Plaid link token creation failed:", error);
    return NextResponse.json(
      { error: "Unable to connect to banking service. Please try again." },
      { status: 500 }
    );
  }
}
