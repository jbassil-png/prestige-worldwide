import { NextRequest, NextResponse } from "next/server";

// Approximate fallback rates relative to USD (updated periodically)
const STUB_RATES: Record<string, number> = {
  USD: 1,
  CAD: 1.36,
  GBP: 0.79,
  EUR: 0.92,
  SGD: 1.34,
  AUD: 1.53,
  CHF: 0.88,
  JPY: 149.5,
  HKD: 7.82,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get("base") ?? "USD";
  const targetsParam = searchParams.get("targets") ?? "";
  const targets = targetsParam ? targetsParam.split(",") : Object.keys(STUB_RATES);

  const apiKey = process.env.FX_API_KEY;

  if (apiKey) {
    try {
      const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const rates: Record<string, number> = {};
        for (const t of targets) {
          if (data.conversion_rates[t]) rates[t] = data.conversion_rates[t];
        }
        return NextResponse.json({ base, rates });
      }
    } catch (err) {
      console.error("FX API error:", err);
    }
  }

  // Stub: convert stub rates to the requested base
  const baseRate = STUB_RATES[base] ?? 1;
  const rates: Record<string, number> = {};
  for (const t of targets) {
    if (STUB_RATES[t]) rates[t] = STUB_RATES[t] / baseRate;
  }

  return NextResponse.json({ base, rates, stub: true });
}
