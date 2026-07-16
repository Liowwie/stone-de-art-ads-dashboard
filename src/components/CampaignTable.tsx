import { campaigns } from "@/lib/data";
import { formatRM, formatNumber, formatPct } from "@/lib/format";

export function CampaignTable() {
  const rows = [...campaigns]
    .filter((c) => c.impressions > 0 || c.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-2">Campaign</th>
              <th className="text-left font-medium px-4 py-2">State</th>
              <th className="text-right font-medium px-4 py-2">Spend</th>
              <th className="text-right font-medium px-4 py-2">Clicks</th>
              <th className="text-right font-medium px-4 py-2">CTR</th>
              <th className="text-right font-medium px-4 py-2">Avg. CPC</th>
              <th className="text-right font-medium px-4 py-2">Conversions</th>
              <th className="text-right font-medium px-4 py-2">Cost / Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.campaign}>
                <td className="px-4 py-2 font-medium text-slate-700">{c.campaign}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-xs ${
                      c.state === "Enabled"
                        ? "bg-emerald-50 text-emerald-700"
                        : c.state === "Paused"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.state}
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{formatRM(c.cost)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatNumber(c.clicks)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatPct(c.ctr)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatRM(c.avgCpc)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatNumber(c.conversions)}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {c.conversions > 0 ? formatRM(c.costPerConv) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
        Actual-lead attribution is not broken down by campaign: website-lead UTM campaign tags
        (e.g. &ldquo;collection&rdquo;, &ldquo;signature_work&rdquo;) do not map 1:1 to individual Google Ads
        campaign names (e.g. multiple &ldquo;Collection_TOF_Search&rdquo; campaigns exist across different
        dates), and WhatsApp leads carry no campaign-level tracking at all. Showing a per-campaign
        lead or CPL figure here would invent attribution the data doesn&apos;t support.
      </div>
    </div>
  );
}
