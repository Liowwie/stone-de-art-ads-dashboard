import { getMonthlyPerformance } from "@/lib/data";
import { formatRM, formatNumber } from "@/lib/format";

export function MonthlyPerformanceTable() {
  const rows = getMonthlyPerformance();

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-2">Month</th>
              <th className="text-right font-medium px-4 py-2">Spend</th>
              <th className="text-right font-medium px-4 py-2">Clicks</th>
              <th className="text-right font-medium px-4 py-2">Ads Conversions</th>
              <th className="text-right font-medium px-4 py-2">Paid Leads</th>
              <th className="text-right font-medium px-4 py-2">Actual Lead CPL</th>
              <th className="text-right font-medium px-4 py-2">Confirmed Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.month}>
                <td className="px-4 py-2 font-medium text-slate-700">{r.label}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatRM(r.spend)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatNumber(r.clicks)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatNumber(r.conversions)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatNumber(r.paidLeads)}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {r.actualLeadCPL != null ? formatRM(r.actualLeadCPL) : "—"}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {r.revenue > 0 ? formatRM(r.revenue) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
        Paid Leads = website + WhatsApp leads tagged &ldquo;Paid&rdquo; in that month. Confirmed Revenue
        reflects only sales tagged &ldquo;Paid&rdquo; in the sales log; most months have none, which is
        expected given only 2 confirmed Paid sales exist across the full data range. Monthly ROAS is not
        shown: crediting a sale&apos;s full value to the single month it closed in against that month&apos;s
        spend alone would be misleading given a multi-month sales cycle and only 2 confirmed sales — ROAS is
        reported only as an account-level figure in the Sales &amp; ROAS section above.
      </div>
    </div>
  );
}
