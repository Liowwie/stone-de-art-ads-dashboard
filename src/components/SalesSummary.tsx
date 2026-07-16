import { formatRM, formatNumber } from "@/lib/format";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import type { getExecutiveKpis } from "@/lib/data";

export function SalesSummary({ kpis }: { kpis: ReturnType<typeof getExecutiveKpis> }) {
  return (
    <div className="space-y-4">
      <KpiGrid>
        <KpiCard label="Confirmed Google-attributed sales" value={formatNumber(kpis.salesCount)} sub="tagged “Paid” in sales log" />
        <KpiCard label="Confirmed Google-attributed revenue" value={formatRM(kpis.salesRevenue)} />
        <KpiCard label="Cost per confirmed sale" value={kpis.costPerSale != null ? formatRM(kpis.costPerSale) : "—"} />
        <KpiCard
          label="ROAS"
          value={kpis.roas != null ? `${kpis.roas.toFixed(2)}×` : "—"}
          sub={
            kpis.roas == null
              ? "No confirmed Paid sales in range"
              : !kpis.roasReliable
              ? "⚠ based on fewer than 3 confirmed sales"
              : "revenue ÷ spend"
          }
        />
      </KpiGrid>

      {!kpis.roasReliable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm p-4">
          <span className="font-medium">Data-quality warning:</span>{" "}
          {`Only ${kpis.salesCount} sale(s) in this range are tagged "Paid" (confirmed Google Ads-attributed) in the source sales log, and attribution there is a manual tag with no order ID, click ID, or UTM link back to a specific ad click. ROAS shown above should be treated as indicative only, not a verified figure.`}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div className="font-medium text-slate-600 mb-2">Other sales in the log (excluded from ROAS)</div>
        <ul className="space-y-1 text-slate-600">
          <li className="flex justify-between">
            <span>Organic-tagged sales</span>
            <span className="tabular-nums">{kpis.organicSalesCount} · {formatRM(kpis.organicSalesRevenue)}</span>
          </li>
          <li className="flex justify-between">
            <span>Unsure-attribution sales</span>
            <span className="tabular-nums">{kpis.unsureSalesCount} · {formatRM(kpis.unsureSalesRevenue)}</span>
          </li>
        </ul>
        <p className="text-xs text-slate-400 mt-2">
          Only sales explicitly tagged &ldquo;Paid&rdquo; are counted as Google Ads revenue. Organic and
          Unsure sales are shown for context only and are never added into spend-based metrics like ROAS or
          cost-per-sale.
        </p>
      </div>
    </div>
  );
}
