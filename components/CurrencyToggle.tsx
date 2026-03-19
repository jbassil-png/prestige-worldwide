"use client";

import { useEffect, useState } from "react";

export type CurrencyMode = "residence" | "retirement" | "native";

// Simple tooltip component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="group/tooltip relative">
      {children}
      <div className="invisible group-hover/tooltip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

interface Props {
  residenceCurrency: string;
  retirementCurrency: string;
  onChange: (mode: CurrencyMode) => void;
}

const STORAGE_KEY = "pw_currency_mode";

export default function CurrencyToggle({ residenceCurrency, retirementCurrency, onChange }: Props) {
  const [mode, setMode] = useState<CurrencyMode>("residence");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyMode | null;
    if (saved) {
      setMode(saved);
      onChange(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(m: CurrencyMode) {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
    onChange(m);
  }

  const options: { value: CurrencyMode; label: string; sub: string; tooltip: string }[] = [
    {
      value: "residence",
      label: "Residence",
      sub: residenceCurrency,
      tooltip: "View all amounts in your residence country currency"
    },
    {
      value: "retirement",
      label: "Retirement",
      sub: retirementCurrency,
      tooltip: "View all amounts in your retirement country currency"
    },
    {
      value: "native",
      label: "Native",
      sub: "each currency",
      tooltip: "View each account in its original currency"
    },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {options.map((o) => (
        <Tooltip key={o.value} text={o.tooltip}>
          <button
            onClick={() => select(o.value)}
            className={`flex flex-col items-center px-4 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === o.value
                ? "bg-white text-brand-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{o.label}</span>
            <span className="text-[10px] opacity-70">{o.sub}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
