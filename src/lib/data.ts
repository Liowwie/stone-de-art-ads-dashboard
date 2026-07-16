import monthlyRaw from "@/data/monthly.json";
import campaignsRaw from "@/data/campaigns.json";
import adGroupsRaw from "@/data/adGroups.json";
import rsaRaw from "@/data/rsa.json";
import keywordsRaw from "@/data/keywords.json";
import websiteLeadsRaw from "@/data/websiteLeads.json";
import whatsappLeadsRaw from "@/data/whatsappLeads.json";
import salesRaw from "@/data/sales.json";
import metaRaw from "@/data/meta.json";
import auditLogRaw from "@/data/auditLog.json";
import type {
  MonthlyRow,
  CampaignRow,
  AdGroupRow,
  RsaData,
  KeywordRow,
  WebsiteLeadsData,
  WhatsappLeadsData,
  SaleRow,
  Meta,
  AuditEntry,
} from "@/lib/types";

export const monthly = monthlyRaw as MonthlyRow[];
export const campaigns = campaignsRaw as CampaignRow[];
export const adGroups = adGroupsRaw as AdGroupRow[];
export const rsa = rsaRaw as RsaData;
export const keywords = keywordsRaw as KeywordRow[];
export const websiteLeads = websiteLeadsRaw as WebsiteLeadsData;
export const whatsappLeads = whatsappLeadsRaw as WhatsappLeadsData;
export const sales = salesRaw as SaleRow[];
export const meta = metaRaw as Meta;
export const auditLog = auditLogRaw as AuditEntry[];

const QUALIFIED_QUALITIES = new Set([
  "Relevant",
  "Unmatched - Relevant",
  "Active (ID/Contractor)",
  "KIV (ID/Contractor)",
]);

export type DateRange = { start?: string | null; end?: string | null };

function inRange(date: string | null, range: DateRange): boolean {
  if (!date) return true;
  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;
  return true;
}

export function filterByRange<T extends { date?: string | null; month?: string }>(
  rows: T[],
  range: DateRange
): T[] {
  return rows.filter((r) => inRange((r.date ?? r.month) ?? null, range));
}

export function getExecutiveKpis(range: DateRange = {}) {
  const m = filterByRange(monthly, range);

  // --- Google Ads platform metrics ---
  const spend = sum(m, (r) => r.cost);
  const impressions = sum(m, (r) => r.impressions);
  const clicks = sum(m, (r) => r.clicks);
  const conversions = sum(m, (r) => r.conversions); // Google Ads-reported conversions

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const avgCpc = clicks > 0 ? spend / clicks : 0;
  const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const costPerConv = conversions > 0 ? spend / conversions : 0; // Cost per Google Ads conversion

  // --- Actual lead performance (CSV-verified, deduped) ---
  const wLeads = filterByRange(websiteLeads.raw, range);
  const waLeads = filterByRange(whatsappLeads.raw, range).filter(
    (l) => l.inquiryType === "Whatsapp"
  );
  const walkIns = filterByRange(whatsappLeads.raw, range).filter(
    (l) => l.inquiryType === "Walk-In"
  );

  const websiteLeadCount = wLeads.length;
  const whatsappLeadCount = waLeads.length;
  const totalActualLeads = websiteLeadCount + whatsappLeadCount;

  const allActualLeads = [...wLeads, ...waLeads];
  const paidLeadsCount = allActualLeads.filter((l) => l.organicPaid === "Paid").length;
  const organicLeadsCount = allActualLeads.filter((l) => l.organicPaid === "Organic").length;
  const unsureLeadsCount = allActualLeads.filter((l) => l.organicPaid === "Unsure").length;
  const unspecifiedLeadsCount = allActualLeads.filter((l) => l.organicPaid === "Unspecified").length;

  // Actual Lead CPL = Google Ads spend / valid PAID website+WhatsApp leads.
  // Deliberately NOT Google Ads conversions, and NOT total actual leads
  // (which would include organic/unsure leads spend didn't generate).
  const actualLeadCPL = paidLeadsCount > 0 ? spend / paidLeadsCount : null;

  const qualifiedLeads = waLeads.filter((l) => l.leadQuality && QUALIFIED_QUALITIES.has(l.leadQuality)).length;

  // --- Sales & ROAS: only "Paid" (confirmed Google-attributed) rows count ---
  const rangedSales = filterByRangeMonth(sales, range);
  const paidSales = rangedSales.filter((s) => s.organicPaid === "Paid");
  const organicSales = rangedSales.filter((s) => s.organicPaid === "Organic");
  const unsureSales = rangedSales.filter((s) => s.organicPaid === "Unsure");
  const salesCount = paidSales.length;
  const salesRevenue = sum(paidSales, (s) => s.amount);
  const costPerSale = salesCount > 0 ? spend / salesCount : null;
  // ROAS = confirmed Google-attributed revenue / Google Ads spend.
  const roas = spend > 0 && salesCount > 0 ? salesRevenue / spend : null;
  const roasReliable = salesCount >= 3; // fewer than 3 confirmed sales is too thin a sample to report with confidence

  return {
    spend,
    impressions,
    clicks,
    ctr,
    avgCpc,
    conversions,
    convRate,
    costPerConv,
    websiteLeadCount,
    whatsappLeadCount,
    totalActualLeads,
    paidLeadsCount,
    organicLeadsCount,
    unsureLeadsCount,
    unspecifiedLeadsCount,
    actualLeadCPL,
    qualifiedLeads,
    showroomVisits: walkIns.length,
    salesCount,
    salesRevenue,
    costPerSale,
    roas,
    roasReliable,
    organicSalesCount: organicSales.length,
    organicSalesRevenue: sum(organicSales, (s) => s.amount),
    unsureSalesCount: unsureSales.length,
    unsureSalesRevenue: sum(unsureSales, (s) => s.amount),
  };
}

function filterByRangeMonth(rows: SaleRow[], range: DateRange): SaleRow[] {
  return rows.filter((r) => {
    if (range.start && r.month < range.start.slice(0, 7)) return false;
    if (range.end && r.month > range.end.slice(0, 7)) return false;
    return true;
  });
}

export function sum<T>(rows: T[], pick: (r: T) => number): number {
  return rows.reduce((acc, r) => acc + pick(r), 0);
}

export function getMonthlyTrend(range: DateRange = {}) {
  const filtered = filterByRange(monthly, range);
  const byMonth = new Map<string, { month: string; label: string; cost: number; clicks: number; impressions: number; conversions: number }>();
  for (const r of filtered) {
    const existing = byMonth.get(r.month) ?? {
      month: r.month,
      label: r.monthLabel,
      cost: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
    };
    existing.cost += r.cost;
    existing.clicks += r.clicks;
    existing.impressions += r.impressions;
    existing.conversions += r.conversions;
    byMonth.set(r.month, existing);
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function getLeadFunnelByMonth(range: DateRange = {}) {
  const wLeads = filterByRange(websiteLeads.raw, range);
  const waLeads = filterByRange(whatsappLeads.raw, range).filter((l) => l.inquiryType === "Whatsapp");

  const byMonth = new Map<string, { month: string; website: number; whatsapp: number }>();
  for (const l of wLeads) {
    if (!l.date) continue;
    const month = l.date.slice(0, 7);
    const e = byMonth.get(month) ?? { month, website: 0, whatsapp: 0 };
    e.website += 1;
    byMonth.set(month, e);
  }
  for (const l of waLeads) {
    if (!l.date) continue;
    const month = l.date.slice(0, 7);
    const e = byMonth.get(month) ?? { month, website: 0, whatsapp: 0 };
    e.whatsapp += 1;
    byMonth.set(month, e);
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function getMonthlyPerformance(range: DateRange = {}) {
  const trend = getMonthlyTrend(range); // month, label, cost, clicks, impressions, conversions

  const wLeads = filterByRange(websiteLeads.raw, range);
  const waLeads = filterByRange(whatsappLeads.raw, range).filter((l) => l.inquiryType === "Whatsapp");
  const paidLeadsByMonth = new Map<string, number>();
  for (const l of [...wLeads, ...waLeads]) {
    if (!l.date || l.organicPaid !== "Paid") continue;
    const month = l.date.slice(0, 7);
    paidLeadsByMonth.set(month, (paidLeadsByMonth.get(month) ?? 0) + 1);
  }

  const rangedSales = filterByRangeMonth(sales, range).filter((s) => s.organicPaid === "Paid");
  const revenueByMonth = new Map<string, number>();
  const salesCountByMonth = new Map<string, number>();
  for (const s of rangedSales) {
    revenueByMonth.set(s.month, (revenueByMonth.get(s.month) ?? 0) + s.amount);
    salesCountByMonth.set(s.month, (salesCountByMonth.get(s.month) ?? 0) + 1);
  }

  return trend.map((t) => {
    const paidLeads = paidLeadsByMonth.get(t.month) ?? 0;
    const revenue = revenueByMonth.get(t.month) ?? 0;
    const salesCount = salesCountByMonth.get(t.month) ?? 0;
    return {
      month: t.month,
      label: t.label,
      spend: t.cost,
      clicks: t.clicks,
      conversions: t.conversions,
      paidLeads,
      actualLeadCPL: paidLeads > 0 ? t.cost / paidLeads : null,
      revenue,
      salesCount,
      // Monthly ROAS is deliberately NOT computed here: with only 2 confirmed
      // sales in the whole dataset and a multi-month B2B sales cycle, crediting
      // a sale's full revenue to the single calendar month it closed in against
      // that month's spend alone produces a distorted figure (e.g. one month
      // showing 60x+ ROAS). ROAS is only meaningful as an account-level figure
      // — see getExecutiveKpis().roas.
    };
  });
}

export function getExcludedLeadsSummary() {
  return {
    website: websiteLeads.audit,
    whatsapp: whatsappLeads.audit,
    totalExcluded:
      websiteLeads.audit.excludedTest +
      websiteLeads.audit.excludedSpam +
      websiteLeads.audit.excludedDuplicate +
      whatsappLeads.audit.excludedBlank +
      whatsappLeads.audit.excludedTest +
      whatsappLeads.audit.excludedDuplicate,
  };
}

export function getPaidOrganicSplit(range: DateRange = {}) {
  const wLeads = filterByRange(websiteLeads.raw, range);
  const waLeads = filterByRange(whatsappLeads.raw, range).filter((l) => l.inquiryType === "Whatsapp");
  const all = [...wLeads.map((l) => l.organicPaid), ...waLeads.map((l) => l.organicPaid)];

  const counts: Record<string, number> = { Paid: 0, Organic: 0, Unsure: 0, Unspecified: 0 };
  for (const tag of all) {
    if (tag in counts) counts[tag] += 1;
    else counts.Unspecified += 1;
  }
  return counts;
}
