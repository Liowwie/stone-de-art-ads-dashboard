import { getExecutiveKpis, meta } from "@/lib/data";
import { formatRM, formatNumber, formatPct } from "@/lib/format";
import { CampaignTable } from "@/components/CampaignTable";
import { SalesSummary } from "@/components/SalesSummary";
import { FormulaNote } from "@/components/FormulaNote";
import { PrintButton } from "@/components/PrintButton";

function ReportKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 rounded-md p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

export default function ReportPage() {
  const kpis = getExecutiveKpis();
  const generated = new Date(meta.lastUpdated).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="print-page max-w-[210mm] mx-auto px-6 sm:px-10 py-8 bg-white">
      <div className="flex items-start justify-between mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stone De Art — Google Ads Client Report</h1>
          <p className="text-sm text-slate-500">
            Reporting period: {meta.accountDateRange.start} to {meta.accountDateRange.end}
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Generated {generated}</div>
          <PrintButton />
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Google Ads performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReportKpi label="Spend" value={formatRM(kpis.spend)} />
          <ReportKpi label="Impressions" value={formatNumber(kpis.impressions)} />
          <ReportKpi label="Clicks" value={formatNumber(kpis.clicks)} />
          <ReportKpi label="CTR" value={formatPct(kpis.ctr)} />
          <ReportKpi label="Avg. CPC" value={formatRM(kpis.avgCpc)} />
          <ReportKpi label="Conversions" value={formatNumber(kpis.conversions)} />
          <ReportKpi label="Conv. Rate" value={formatPct(kpis.convRate)} />
          <ReportKpi label="Cost / Conversion" value={formatRM(kpis.costPerConv)} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Actual lead performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <ReportKpi label="Total actual leads" value={formatNumber(kpis.totalActualLeads)} />
          <ReportKpi label="Paid leads" value={formatNumber(kpis.paidLeadsCount)} />
          <ReportKpi label="Organic leads" value={formatNumber(kpis.organicLeadsCount)} />
          <ReportKpi label="Actual Lead CPL" value={kpis.actualLeadCPL != null ? formatRM(kpis.actualLeadCPL) : "—"} />
        </div>
        <FormulaNote />
      </section>

      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Google-attributed sales & ROAS</h2>
        <SalesSummary kpis={kpis} />
      </section>

      <section className="mb-4 break-inside-avoid">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Campaign performance</h2>
        <CampaignTable />
      </section>

      <footer className="text-[11px] text-slate-400 border-t border-slate-200 pt-3 mt-6">
        No customer names, phone numbers, or email addresses are included in this report. Figures are
        derived solely from the provided Google Ads exports and lead/sales logs; no figures are estimated
        or inferred beyond the formulas stated above.
      </footer>
    </div>
  );
}
