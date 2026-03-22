"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Account {
  balance: number;
  currency: string;
  type: string;
  subtype: string | null;
}

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "United States",
  CAD: "Canada",
  GBP: "United Kingdom",
  SGD: "Singapore",
  EUR: "Europe",
  AUD: "Australia",
  NZD: "New Zealand",
  CHF: "Switzerland",
  JPY: "Japan",
};

const SUBTYPE_LABELS: Record<string, string> = {
  rrsp: "RRSP",
  resp: "RESP",
  lira: "LIRA",
  tfsa: "TFSA",
  "401k": "401(k)",
  ira: "IRA",
  "roth ira": "Roth IRA",
  "roth 401k": "Roth 401(k)",
  checking: "Checking",
  savings: "Savings",
  brokerage: "Brokerage",
  mortgage: "Mortgage",
  "student loan": "Student Loan",
  "auto loan": "Auto Loan",
};

const BAR_COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-400",
  "bg-teal-500",
];

function AllocationRow({
  label,
  valueUsd,
  total,
  colorClass,
}: {
  label: string;
  valueUsd: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((valueUsd / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-9 text-right shrink-0 tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

export default function AllocationCharts() {
  const supabase = createClient();
  const [geoGroups, setGeoGroups] = useState<[string, number][]>([]);
  const [typeGroups, setTypeGroups] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accounts } = await supabase
        .from("user_accounts")
        .select("balance, currency, type, subtype")
        .eq("user_id", user.id)
        .gt("balance", 0); // assets only, exclude loans/credit

      if (!accounts || accounts.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch FX rates for all currencies present
      const currencies = [...new Set((accounts as Account[]).map((a) => a.currency))].join(",");
      let rates: Record<string, number> = { USD: 1 };
      try {
        const res = await fetch(`/api/fx?base=USD&targets=${currencies}`);
        const json = await res.json();
        rates = { USD: 1, ...json.rates };
      } catch {
        // proceed with USD-only rates; proportions will still be directionally correct
      }

      const toUsd = (balance: number, currency: string) =>
        balance / (rates[currency] ?? 1);

      // Geographic grouping by currency → country
      const geo: Record<string, number> = {};
      for (const a of accounts as Account[]) {
        const country = CURRENCY_TO_COUNTRY[a.currency] ?? "Other";
        geo[country] = (geo[country] ?? 0) + toUsd(a.balance, a.currency);
      }

      // Account type grouping by subtype → human label
      const types: Record<string, number> = {};
      for (const a of accounts as Account[]) {
        const label =
          (a.subtype ? SUBTYPE_LABELS[a.subtype.toLowerCase()] : null) ??
          (a.type === "depository"
            ? "Cash"
            : a.type.charAt(0).toUpperCase() + a.type.slice(1));
        types[label] = (types[label] ?? 0) + toUsd(a.balance, a.currency);
      }

      setGeoGroups(Object.entries(geo).sort(([, a], [, b]) => b - a));
      setTypeGroups(Object.entries(types).sort(([, a], [, b]) => b - a));
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-2.5 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded animate-pulse" />
                <div className="h-2.5 w-8 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (geoGroups.length === 0) return null;

  const geoTotal = geoGroups.reduce((s, [, v]) => s + v, 0);
  const typeTotal = typeGroups.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-3">By geography</p>
        <div className="space-y-2.5">
          {geoGroups.map(([country, value], i) => (
            <AllocationRow
              key={country}
              label={country}
              valueUsd={value}
              total={geoTotal}
              colorClass={BAR_COLORS[i % BAR_COLORS.length]}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700 mb-3">By account type</p>
        <div className="space-y-2.5">
          {typeGroups.map(([label, value], i) => (
            <AllocationRow
              key={label}
              label={label}
              valueUsd={value}
              total={typeTotal}
              colorClass={BAR_COLORS[i % BAR_COLORS.length]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
