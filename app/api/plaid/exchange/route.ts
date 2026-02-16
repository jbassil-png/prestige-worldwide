import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MOCK_ACCOUNTS = [
  { name: "Chase Checking", type: "401(k)", balanceUsd: 85000, currency: "USD", institution: "Chase" },
  { name: "TD RRSP", type: "RRSP", balanceUsd: 62000, currency: "CAD", institution: "TD Bank" },
];

export async function POST(req: NextRequest) {
  if (!process.env.PLAID_CLIENT_ID) {
    return NextResponse.json({ accounts: MOCK_ACCOUNTS });
  }

  const { public_token } = await req.json();

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

  const plaid = new PlaidApi(config);

  const exchangeRes = await plaid.itemPublicTokenExchange({ public_token });
  const accessToken = exchangeRes.data.access_token;

  const balancesRes = await plaid.accountsBalanceGet({ access_token: accessToken });

  // Store the access token server-side
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const firstAccount = balancesRes.data.item;
    await supabase.from("plaid_items").insert({
      user_id: user.id,
      access_token: accessToken,
      institution: firstAccount?.institution_id ?? null,
    });
  }

  const accounts = balancesRes.data.accounts.map((a) => ({
    name: a.name,
    type: a.subtype ?? a.type,
    balanceUsd: a.balances.current ?? 0,
    currency: a.balances.iso_currency_code ?? "USD",
    institution: null,
  }));

  return NextResponse.json({ accounts });
}
