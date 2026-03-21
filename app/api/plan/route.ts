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

type RetirementGoal = {
  targetYear: number;
  targetAmountUsd: number;
};

function buildStubPlan(input: {
  countries: string[];
  accounts: { type: string; country: string; balanceUsd: number }[];
  retirementYear?: number | null;
  retirementGoal?: RetirementGoal | null;
  residenceCountry?: string;
  retirementCountry?: string;
  notes?: string;
}) {
  const totalBalance = input.accounts.reduce((s, a) => s + a.balanceUsd, 0);
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = input.retirementYear
    ? input.retirementYear - currentYear
    : null;

  const projectedRetirementBalance = yearsToRetirement && yearsToRetirement > 0
    ? Math.round(totalBalance * Math.pow(1.07, yearsToRetirement))
    : null;

  const estimatedAnnualIncome = projectedRetirementBalance
    ? Math.round(projectedRetirementBalance * 0.04)
    : null;

  // On-track: projected balance vs goal target (with 80% threshold for "at risk")
  let onTrackStatus: "on_track" | "at_risk" | "off_track" | null = null;
  if (projectedRetirementBalance !== null && input.retirementGoal) {
    const target = input.retirementGoal.targetAmountUsd;
    if (projectedRetirementBalance >= target) {
      onTrackStatus = "on_track";
    } else if (projectedRetirementBalance >= target * 0.8) {
      onTrackStatus = "at_risk";
    } else {
      onTrackStatus = "off_track";
    }
  }

  const retirementDesc = yearsToRetirement
    ? `With ${yearsToRetirement} years until your target retirement in ${input.retirementYear}`
    : "With your current portfolio";

  const countryList = input.countries.join(", ");

  return {
    summary: `Based on your accounts across ${countryList}, you have an estimated net worth of $${totalBalance.toLocaleString()} USD. ${retirementDesc}, here is a high-level plan.`,
    metrics: {
      netWorthUsd: totalBalance,
      yearsToRetirement,
      retirementYear: input.retirementYear ?? null,
      projectedRetirementBalanceUsd: projectedRetirementBalance,
      estimatedAnnualIncomeAtRetirement: estimatedAnnualIncome,
      retirementGoal: input.retirementGoal ?? null,
      onTrackStatus,
    },
    recommendations: [
      ...(yearsToRetirement
        ? [
            {
              category: "Retirement",
              priority: "high",
              text: `Maximise contributions to your tax-advantaged accounts in each jurisdiction. With ${yearsToRetirement} years of growth, compounding has a significant impact.`,
            },
          ]
        : []),
      {
        category: "Tax",
        priority: "high",
        text: `Review applicable tax treaties between ${countryList}. Double-taxation agreements may significantly reduce your overall tax burden.`,
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
