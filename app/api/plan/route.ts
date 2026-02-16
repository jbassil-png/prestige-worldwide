import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── n8n webhook ─────────────────────────────────────────────────────────────
  // When you have n8n running, set N8N_WEBHOOK_URL in your .env.local file.
  // Your n8n workflow should accept this payload, call OpenRouter (or any model),
  // and return a JSON object with the shape below.
  // ─────────────────────────────────────────────────────────────────────────────
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!n8nRes.ok) {
        throw new Error(`n8n responded with ${n8nRes.status}`);
      }

      const plan = await n8nRes.json();
      return NextResponse.json(plan);
    } catch (err) {
      console.error("n8n webhook error:", err);
      // Fall through to stub so the UI still works during development
    }
  }

  // ── Stub plan (used when N8N_WEBHOOK_URL is not set) ────────────────────────
  // Replace this with real n8n + OpenRouter output once you've wired it up.
  // ─────────────────────────────────────────────────────────────────────────────
  const stub = buildStubPlan(body);
  return NextResponse.json(stub);
}

function buildStubPlan(input: {
  countries: string[];
  accounts: { type: string; country: string; balanceUsd: number }[];
  goals: string[];
  retirementAge: number;
  currentAge: number;
}) {
  const totalBalance = input.accounts.reduce((s, a) => s + a.balanceUsd, 0);
  const yearsToRetirement = input.retirementAge - input.currentAge;

  return {
    summary: `Based on your accounts across ${input.countries.join(", ")}, you have an estimated net worth of $${totalBalance.toLocaleString()} USD. With ${yearsToRetirement} years until your target retirement age of ${input.retirementAge}, here is a high-level plan.`,
    metrics: {
      netWorthUsd: totalBalance,
      yearsToRetirement,
      projectedRetirementBalanceUsd: Math.round(totalBalance * Math.pow(1.07, yearsToRetirement)),
      estimatedAnnualIncomeAtRetirement: Math.round(totalBalance * Math.pow(1.07, yearsToRetirement) * 0.04),
    },
    recommendations: [
      {
        category: "Retirement",
        priority: "high",
        text: `Maximise contributions to your tax-advantaged accounts in each jurisdiction. With ${yearsToRetirement} years of growth, compounding has a significant impact.`,
      },
      {
        category: "Tax",
        priority: "high",
        text: `Review applicable tax treaties between ${input.countries.join(" and ")}. Double-taxation agreements may significantly reduce your overall tax burden.`,
      },
      {
        category: "Currency",
        priority: "medium",
        text: "Consider your base currency for retirement. Holding assets across multiple currencies provides a natural hedge but introduces FX risk on drawdown.",
      },
      {
        category: "Estate",
        priority: "medium",
        text: "Cross-border assets often fall under multiple inheritance regimes. A cross-border estate plan is advisable once assets exceed $500k.",
      },
    ],
    disclaimer:
      "This is an AI-generated summary for informational purposes only and does not constitute financial, legal, or tax advice. Please consult qualified professionals in each jurisdiction.",
  };
}
