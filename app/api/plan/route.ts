import { NextRequest, NextResponse } from "next/server";

type PlanInput = {
  countries: string[];
  accounts: { type: string; country: string; balanceUsd: number }[];
  retirementYear?: number | null;
  retirementGoal?: RetirementGoal | null;
  residenceCountry?: string;
  retirementCountry?: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: PlanInput = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const plan = await generatePlanWithAI(body, apiKey);
        return NextResponse.json(plan);
      } catch (err) {
        console.error("OpenRouter plan generation failed, falling back to stub:", err);
      }
    }

    return NextResponse.json(buildStubPlan(body));
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "Unable to generate your plan. Please try again." },
      { status: 500 }
    );
  }
}

async function generatePlanWithAI(input: PlanInput, apiKey: string) {
  const model = process.env.OPENROUTER_PLAN_MODEL ?? "anthropic/claude-3.5-haiku";

  const totalBalance = input.accounts.reduce((s, a) => s + a.balanceUsd, 0);
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = input.retirementYear ? input.retirementYear - currentYear : null;

  const systemPrompt = `You are a cross-border financial planning expert. You help expats and dual citizens with assets in multiple countries build retirement and tax strategies.

Return a JSON object with exactly this shape:
{
  "summary": "2-3 sentence overview of the user's situation and key opportunities",
  "metrics": {
    "netWorthUsd": <number: sum of all account balances>,
    "yearsToRetirement": <number or null>,
    "retirementYear": <number or null>,
    "projectedRetirementBalanceUsd": <number or null: assume 7% annual growth>,
    "estimatedAnnualIncomeAtRetirement": <number or null: assume 4% withdrawal rate>,
    "retirementGoal": <object with targetYear and targetAmountUsd, or null>,
    "onTrackStatus": <"on_track" | "at_risk" | "off_track" | null>
  },
  "recommendations": [
    { "category": <string>, "priority": <"high" | "medium" | "low">, "text": <string> }
  ],
  "disclaimer": "This is an AI-generated summary for informational purposes only and does not constitute financial, legal, or tax advice. Please consult qualified professionals in each jurisdiction."
}

For onTrackStatus: "on_track" if projected balance >= goal target, "at_risk" if >= 80% of target, "off_track" if below 80%. Null if no goal set.
Provide 3-5 recommendations that are specific to the user's countries, account types, and timeline. Prioritise cross-border tax treaty opportunities, currency risk, and jurisdiction-specific retirement account rules.`;

  const userPrompt = `Generate a financial plan for this user:

Countries with assets: ${input.countries.join(", ")}
Current residence: ${input.residenceCountry ?? "not specified"}
Planned retirement country: ${input.retirementCountry ?? "not specified"}
Total portfolio value: $${totalBalance.toLocaleString()} USD
Years to retirement: ${yearsToRetirement ?? "not specified"}
Target retirement year: ${input.retirementYear ?? "not specified"}
Retirement savings goal: ${input.retirementGoal ? `$${input.retirementGoal.targetAmountUsd.toLocaleString()} by ${input.retirementGoal.targetYear}` : "not specified"}

Accounts:
${input.accounts.map(a => `- ${a.type} in ${a.country}: $${a.balanceUsd.toLocaleString()} USD`).join("\n")}
${input.notes ? `\nAdditional notes: ${input.notes}` : ""}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://prestigeworldwide.app",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter returned ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");

  return JSON.parse(content);
}

type RetirementGoal = {
  targetYear: number;
  targetAmountUsd: number;
};

function buildStubPlan(input: PlanInput) {
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
