import type { CountrySelection } from "../steps/StepCountries";
import type { Account } from "../steps/StepConnect";
import type { GoalsData } from "../steps/StepGoals";

export const MOCK_SELECTIONS: CountrySelection[] = [
  {
    country: "United States",
    countryCode: "US",
    accountTypes: ["401(k)", "IRA / Roth IRA"],
  },
  {
    country: "Canada",
    countryCode: "CA",
    accountTypes: ["RRSP", "TFSA"],
  },
];

export const MOCK_ACCOUNTS: Account[] = [
  { name: "401(k) (United States)", type: "401(k)", balanceUsd: 124000, currency: "USD", countryCode: "US" },
  { name: "IRA / Roth IRA (United States)", type: "IRA / Roth IRA", balanceUsd: 38000, currency: "USD", countryCode: "US" },
  { name: "RRSP (Canada)", type: "RRSP", balanceUsd: 67000, currency: "CAD", countryCode: "CA" },
  { name: "TFSA (Canada)", type: "TFSA", balanceUsd: 31000, currency: "CAD", countryCode: "CA" },
];

export const MOCK_GOALS: GoalsData = {
  goalTypes: ["retirement", "tax"],
  retirementYear: 2055,
  residenceCountry: "United States",
  retirementCountry: "Canada",
  retirementGoal: { targetYear: 2055, targetAmountUsd: 2000000 },
  notes: "US-Canadian dual citizen living in Toronto. Planning to retire in British Columbia.",
};
