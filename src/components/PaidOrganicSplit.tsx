"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS: Record<string, string> = {
  Paid: "#2a78d6",
  Organic: "#008300",
  Unsure: "#eda100",
  Unspecified: "#94a3b8",
};

export function PaidOrganicSplit({ counts }: { counts: Record<string, number> }) {
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm font-medium text-slate-600 mb-2">
        Paid vs organic vs unsure — actual leads (website + WhatsApp)
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#334155" }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              formatter={(v) => {
                const n = Number(v);
                return [`${n} (${total > 0 ? ((n / total) * 100).toFixed(1) : 0}%)`, "Leads"];
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={COLORS[d.name] ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-slate-400 mt-2">
        &ldquo;Unsure&rdquo; and &ldquo;Unspecified&rdquo; leads are kept separate from Paid because the
        source records do not reliably confirm a Google Ads origin — they are not counted toward Actual
        Lead CPL.
      </div>
    </div>
  );
}
