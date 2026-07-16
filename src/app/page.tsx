import { getExecutiveKpis, getMonthlyTrend, getPaidOrganicSplit } from "@/lib/data";
import { formatRM, formatNumber, formatPct } from "@/lib/format";
import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { LastUpdated } from "@/components/LastUpdated";
import { MonthlyChart } from "@/components/MonthlyChart";
import { MonthlyPerformanceTable } from "@/components/MonthlyPerformanceTable";
import { CampaignTable } from "@/components/CampaignTable";
import { LeadSummary } from "@/components/LeadSummary";
import { PaidOrganicSplit } from "@/components/PaidOrganicSplit";
import { SalesSummary } from "@/components/SalesSummary";
import { FormulaNote } from "@/components/FormulaNote";

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const kpis = getExecutiveKpis();
  const trend = getMonthlyTrend();
  const split = getPaidOrganicSplit();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Executive Overview</h1>
        <LastUpdated />
      </div>

      <Section id="executive" title="Google Ads performance" subtitle="Full account, all campaigns, 3 Sep 2025 – 16 Jul 2026">
        <KpiGrid>
          <KpiCard label="Spend" value={formatRM(kpis.spend)} />
          <KpiCard label="Impressions" value={formatNumber(kpis.impressions)} />
          <KpiCard label="Clicks" value={formatNumber(kpis.clicks)} />
          <KpiCard label="CTR" value={formatPct(kpis.ctr)} />
          <KpiCard label="Avg. CPC" value={formatRM(kpis.avgCpc)} />
          <KpiCard label="Google Ads Conversions" value={formatNumber(kpis.conversions)} />
          <KpiCard label="Conversion Rate" value={formatPct(kpis.convRate)} />
          <KpiCard label="Cost / Google Ads Conversion" value={formatRM(kpis.costPerConv)} />
        </KpiGrid>
      </Section>

      <Section id="actual-leads" title="Actual lead performance" subtitle="Verified from website + WhatsApp lead logs, not Google Ads' own conversion count">
        <KpiGrid>
          <KpiCard label="Total actual leads" value={formatNumber(kpis.totalActualLeads)} sub={`${kpis.websiteLeadCount} website + ${kpis.whatsappLeadCount} WhatsApp`} />
          <KpiCard label="Paid leads" value={formatNumber(kpis.paidLeadsCount)} />
          <KpiCard label="Organic leads" value={formatNumber(kpis.organicLeadsCount)} />
          <KpiCard label="Unsure / unspecified" value={formatNumber(kpis.unsureLeadsCount + kpis.unspecifiedLeadsCount)} />
          <KpiCard label="Actual Lead CPL" value={kpis.actualLeadCPL != null ? formatRM(kpis.actualLeadCPL) : "—"} sub="spend ÷ paid leads" />
          <KpiCard label="Qualified leads (WhatsApp)" value={formatNumber(kpis.qualifiedLeads)} sub="Relevant / Active / KIV tagged" />
          <KpiCard label="Showroom visits (Walk-In)" value={formatNumber(kpis.showroomVisits)} sub="from WhatsApp log Walk-In rows" />
        </KpiGrid>
        <FormulaNote />
      </Section>

      <Section id="sales" title="Google-attributed sales & ROAS" subtitle="Only sales tagged “Paid” in the sales log are treated as Google Ads-attributed">
        <SalesSummary kpis={kpis} />
      </Section>

      <Section id="monthly" title="Monthly performance">
        <MonthlyChart data={trend} />
        <MonthlyPerformanceTable />
      </Section>

      <Section id="campaigns" title="Campaign performance">
        <CampaignTable />
      </Section>

      <Section id="leads" title="Website & WhatsApp lead detail" subtitle="Deduplicated, test/spam excluded — see audit below">
        <LeadSummary />
      </Section>

      <Section id="paid-organic" title="Paid vs organic vs unsure leads">
        <PaidOrganicSplit counts={split} />
      </Section>
    </div>
  );
}
