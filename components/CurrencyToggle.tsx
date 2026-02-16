"use client";

import { useEffect, useState } from "react";

export type CurrencyMode = "residence" | "retirement" | "native";

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

  const options: { value: CurrencyMode; label: string; sub: string }[] = [
    { value: "residence", label: "Residence", sub: residenceCurrency },
    { value: "retirement", label: "Retirement", sub: retirementCurrency },
    { value: "native", label: "Native", sub: "each currency" },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {options.map((o) => (
        <button
          key={o.value}
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
      ))}
    </div>
  );
}
