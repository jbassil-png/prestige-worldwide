import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

  const stub = buildStubPlan(body);
  return NextResponse.json(stub);
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "Unable to generate your plan. Please try again." },
      { status: 500 }
    );
  }
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
