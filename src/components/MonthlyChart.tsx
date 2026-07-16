"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatMonthLabel, formatRM, formatNumber } from "@/lib/format";

const BLUE = "#2a78d6";
const GREEN = "#008300";
const AQUA = "#1baf7a";

type Row = { month: string; cost: number; clicks: number; conversions: number };

function Panel({
  title,
  data,
  dataKey,
  color,
  kind,
  formatter,
}: {
  title: string;
  data: Row[];
  dataKey: keyof Row;
  color: string;
  kind: "bar" | "line";
  formatter: (v: number) => string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm font-medium text-slate-600 mb-2">{title}</div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthLabel}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                formatter={(v) => formatter(Number(v))}
                labelFormatter={(l) => formatMonthLabel(String(l))}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthLabel}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                formatter={(v) => formatter(Number(v))}
                labelFormatter={(l) => formatMonthLabel(String(l))}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyChart({ data }: { data: Row[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Panel title="Spend by month (RM)" data={data} dataKey="cost" color={BLUE} kind="bar" formatter={formatRM} />
      <Panel title="Clicks by month" data={data} dataKey="clicks" color={AQUA} kind="bar" formatter={formatNumber} />
      <Panel
        title="Conversions by month"
        data={data}
        dataKey="conversions"
        color={GREEN}
        kind="line"
        formatter={formatNumber}
      />
    </div>
  );
}
