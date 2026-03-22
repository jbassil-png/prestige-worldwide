"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  netWorthUsd: number;
  retirementYear: number;
  targetAmountUsd: number | null;
  /** Formats a USD value into the user's selected display currency */
  fmt: (usd: number) => string;
}

const CAGR = 0.07;
const CURRENT_YEAR = new Date().getFullYear();
const CHART_COLOR = "#0ea5e9"; // brand-500

function buildProjection(netWorthUsd: number, retirementYear: number) {
  const points: { year: number; value: number }[] = [];
  for (let year = CURRENT_YEAR; year <= retirementYear; year++) {
    points.push({
      year,
      value: Math.round(netWorthUsd * Math.pow(1 + CAGR, year - CURRENT_YEAR)),
    });
  }
  return points;
}

function abbreviate(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export default function ProjectionChart({ netWorthUsd, retirementYear, targetAmountUsd, fmt }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = buildProjection(netWorthUsd, retirementYear);
  const years = retirementYear - CURRENT_YEAR;

  // Show a tick every ~4 years, always include the last year
  const tickInterval = Math.max(1, Math.floor(years / 4));

  if (!mounted) {
    return <div className="h-44 bg-gray-50 rounded-lg animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600">Growth projection</p>
        <p className="text-[10px] text-gray-400">7% CAGR · {CURRENT_YEAR} → {retirementYear}</p>
      </div>

      <ResponsiveContainer width="100%" height={176}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.18} />
              <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />

          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={abbreviate}
            width={38}
          />

          <Tooltip
            formatter={(value) => [fmt(Number(value)), "Projected"]}
            labelFormatter={(year) => String(year)}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
          />

          {/* Goal line */}
          {targetAmountUsd && (
            <ReferenceLine
              y={targetAmountUsd}
              stroke="#10b981"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: "Goal",
                position: "insideTopRight",
                fontSize: 10,
                fill: "#10b981",
                dy: -4,
              }}
            />
          )}

          {/* "Today" marker */}
          <ReferenceLine
            x={CURRENT_YEAR}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLOR}
            strokeWidth={2}
            fill="url(#projGradient)"
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLOR, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
