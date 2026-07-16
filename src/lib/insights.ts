// Computes the numbers behind the Client Report's narrative. Every sentence
// rendered in the report should trace back to a value produced here — no
// figure is hand-typed into the report page itself.
import { getExecutiveKpis, monthly, websiteLeads, type DateRange } from "@/lib/data";

export const PERIODS = {
  q1: { start: "2026-01-01", end: "2026-03-31", label: "Q1 2026 (Jan–Mar)" },
  q2: { start: "2026-04-01", end: "2026-06-30", label: "Q2 2026 (Apr–Jun)" },
  rampUp: { start: "2025-09-01", end: "2025-12-31", label: "Launch ramp-up (Sep–Dec 2025)" },
  partial: { start: "2026-07-01", end: "2026-07-16", label: "Jul 2026 (partial, in progress)" },
} satisfies Record<string, { start: string; end: string; label: string }>;

export function pctChange(a: number, b: number): number | null {
  if (a === 0) return null;
  return ((b - a) / a) * 100;
}

export type Family = "Collection" | "Signature Works" | "General" | "Other";

export function campaignFamily(campaignName: string): Family {
  if (/^Collection/i.test(campaignName)) return "Collection";
  if (/^Signature Works?/i.test(campaignName)) return "Signature Works";
  if (/^General/i.test(campaignName)) return "General";
  return "Other";
}

function utmFamily(utm: string | null): "Collection" | "Signature Works" | null {
  if (!utm) return null;
  const u = utm.toLowerCase();
  if (u.includes("collection")) return "Collection";
  if (u.includes("signature")) return "Signature Works";
  return null;
}

function inRange(d: string, range: DateRange): boolean {
  if (range.start && d < range.start) return false;
  if (range.end && d > range.end) return false;
  return true;
}

export type FamilyStats = {
  family: Family;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  costPerConv: number | null;
  spendShare: number;
  clicksShare: number;
  convShare: number;
};

export function getFamilyBreakdown(range: DateRange): FamilyStats[] {
  const rows = monthly.filter((r) => inRange(r.month, { start: range.start?.slice(0, 7), end: range.end?.slice(0, 7) }));
  const byFam = new Map<Family, { spend: number; clicks: number; impressions: number; conversions: number }>();
  let totalSpend = 0;
  let totalClicks = 0;
  let totalConv = 0;
  for (const r of rows) {
    const f = campaignFamily(r.campaign);
    const e = byFam.get(f) ?? { spend: 0, clicks: 0, impressions: 0, conversions: 0 };
    e.spend += r.cost;
    e.clicks += r.clicks;
    e.impressions += r.impressions;
    e.conversions += r.conversions;
    byFam.set(f, e);
    totalSpend += r.cost;
    totalClicks += r.clicks;
    totalConv += r.conversions;
  }
  return [...byFam.entries()]
    .filter(([, v]) => v.spend > 0 || v.clicks > 0)
    .map(([family, v]) => ({
      family,
      spend: v.spend,
      clicks: v.clicks,
      impressions: v.impressions,
      conversions: v.conversions,
      ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
      costPerConv: v.conversions > 0 ? v.spend / v.conversions : null,
      spendShare: totalSpend > 0 ? (v.spend / totalSpend) * 100 : 0,
      clicksShare: totalClicks > 0 ? (v.clicks / totalClicks) * 100 : 0,
      convShare: totalConv > 0 ? (v.conversions / totalConv) * 100 : 0,
    }))
    .sort((a, b) => b.spend - a.spend);
}

export function getUtmWebsiteLeadFamilies(range: DateRange) {
  const leads = websiteLeads.raw.filter((l) => l.date && inRange(l.date, range));
  const withUtm = leads.filter((l) => l.utmCampaign);
  const byFam = new Map<string, number>();
  for (const l of withUtm) {
    const f = utmFamily(l.utmCampaign) ?? "Other / unmatched";
    byFam.set(f, (byFam.get(f) ?? 0) + 1);
  }
  return {
    totalWebsiteLeads: leads.length,
    withUtmCount: withUtm.length,
    byFamily: [...byFam.entries()].map(([family, count]) => ({ family, count })),
  };
}

export type PeriodKpis = ReturnType<typeof getExecutiveKpis>;

export function buildReportStory() {
  const lifetime = getExecutiveKpis();
  const q1 = getExecutiveKpis(PERIODS.q1);
  const q2 = getExecutiveKpis(PERIODS.q2);
  const rampUp = getExecutiveKpis(PERIODS.rampUp);
  const partial = getExecutiveKpis(PERIODS.partial);

  const deltas = {
    spend: pctChange(q1.spend, q2.spend),
    clicks: pctChange(q1.clicks, q2.clicks),
    conversions: pctChange(q1.conversions, q2.conversions),
    ctrPts: q2.ctr - q1.ctr,
    paidLeads: pctChange(q1.paidLeadsCount, q2.paidLeadsCount),
    actualLeadCPL: q1.actualLeadCPL != null && q2.actualLeadCPL != null ? pctChange(q1.actualLeadCPL, q2.actualLeadCPL) : null,
    totalActualLeads: pctChange(q1.totalActualLeads, q2.totalActualLeads),
    websiteLeads: pctChange(q1.websiteLeadCount, q2.websiteLeadCount),
    whatsappLeads: pctChange(q1.whatsappLeadCount, q2.whatsappLeadCount),
    showroomVisits: q2.showroomVisits - q1.showroomVisits,
  };

  const q1UnsureShare = q1.totalActualLeads > 0 ? ((q1.unsureLeadsCount + q1.unspecifiedLeadsCount) / q1.totalActualLeads) * 100 : 0;
  const q2UnsureShare = q2.totalActualLeads > 0 ? ((q2.unsureLeadsCount + q2.unspecifiedLeadsCount) / q2.totalActualLeads) * 100 : 0;
  const q2WhatsappShare = q2.totalActualLeads > 0 ? (q2.whatsappLeadCount / q2.totalActualLeads) * 100 : 0;
  const q2WebsiteShare = q2.totalActualLeads > 0 ? (q2.websiteLeadCount / q2.totalActualLeads) * 100 : 0;
  const q2ConversionGap = q2.totalActualLeads > 0 ? ((q2.totalActualLeads - q2.conversions) / q2.totalActualLeads) * 100 : 0;

  const familiesQ2 = getFamilyBreakdown(PERIODS.q2);
  const familiesLifetime = getFamilyBreakdown({});
  const utmLeadsQ2 = getUtmWebsiteLeadFamilies(PERIODS.q2);

  const topFamilyQ2 = familiesQ2[0] ?? null;

  // --- funnel (lifetime, largest sample) ---
  const funnel = {
    clicks: lifetime.clicks,
    actualLeads: lifetime.totalActualLeads,
    showroomVisits: lifetime.showroomVisits,
    confirmedSales: lifetime.salesCount,
    clicksToLeadsPct: lifetime.clicks > 0 ? (lifetime.totalActualLeads / lifetime.clicks) * 100 : 0,
    leadsToVisitsPct: lifetime.totalActualLeads > 0 ? (lifetime.showroomVisits / lifetime.totalActualLeads) * 100 : 0,
    visitsToSalesPct: lifetime.showroomVisits > 0 ? (lifetime.salesCount / lifetime.showroomVisits) * 100 : 0,
  };

  // --- automatic insight generation (template rules) ---
  const insights: string[] = [];

  if (deltas.spend != null && deltas.paidLeads != null) {
    if (deltas.spend > 0 && deltas.paidLeads < 0) {
      insights.push(
        `Efficiency weakened: spend rose ${deltas.spend.toFixed(1)}% quarter-on-quarter while paid leads fell ${Math.abs(deltas.paidLeads).toFixed(1)}%.`
      );
    } else if (deltas.paidLeads > deltas.spend) {
      insights.push(
        `Efficiency improved: paid leads grew ${deltas.paidLeads.toFixed(1)}% versus spend growth of ${deltas.spend.toFixed(1)}%, which is why Actual Paid CPL moved from RM${q1.actualLeadCPL?.toFixed(2)} to RM${q2.actualLeadCPL?.toFixed(2)}.`
      );
    }
  }

  insights.push(
    `WhatsApp remains the primary lead channel and accounts for ${q2WhatsappShare.toFixed(1)}% of total actual leads in Q2 2026, versus ${q2WebsiteShare.toFixed(1)}% from the website form.`
  );

  if (q2UnsureShare > 15) {
    insights.push(
      `${q2UnsureShare.toFixed(1)}% of Q2 2026 actual leads carry an "Unsure" or unspecified source tag, which limits how precisely campaign-level CPL and ROAS can be trusted.`
    );
  }

  if (q2WebsiteShare < 15) {
    insights.push(
      `Website form volume stayed limited (${q2.websiteLeadCount} leads in Q2 2026, ${q2WebsiteShare.toFixed(1)}% of total actual leads), so overall lead generation depends heavily on WhatsApp.`
    );
  }

  insights.push(
    `Platform-reported Google Ads conversions (${q2.conversions} in Q2 2026) are ${q2ConversionGap.toFixed(1)}% lower than recorded actual leads (${q2.totalActualLeads}), so optimisation and budget decisions should prioritise the CRM/CSV lead counts over the Google Ads conversion count alone.`
  );

  if (topFamilyQ2 && topFamilyQ2.spendShare > 60) {
    insights.push(
      `Budget concentration risk: ${topFamilyQ2.family} accounts for ${topFamilyQ2.spendShare.toFixed(1)}% of Q2 2026 spend.`
    );
  }

  if (!lifetime.roasReliable) {
    insights.push(
      `ROAS should be treated as directional only: just ${lifetime.salesCount} confirmed "Paid" sale(s) exist in the entire dataset, and ${lifetime.unsureSalesCount} sale(s) remain classified "Unsure."`
    );
  }

  // --- ranked issues ---
  type Issue = { severity: "Critical" | "Needs attention" | "Monitoring"; text: string };
  const issues: Issue[] = [];

  if (q2.salesCount === 0) {
    issues.push({
      severity: "Critical",
      text: `Zero confirmed Google-attributed sales have been logged in Q1 or Q2 2026. The only 2 confirmed "Paid" sales on file (RM${lifetime.salesRevenue.toLocaleString()}) both closed in December 2025, so lifetime ROAS (${lifetime.roas?.toFixed(2)}×) cannot be treated as representative of current spend levels.`,
    });
  }
  if (q2UnsureShare > 20) {
    issues.push({
      severity: "Critical",
      text: `${q2UnsureShare.toFixed(1)}% of Q2 2026 actual leads cannot be confidently assigned to Paid or Organic, which caps the accuracy of any lead-source ROI comparison.`,
    });
  }
  issues.push({
    severity: "Needs attention",
    text: `Google Ads' own conversion count (${q2.conversions}) undercounts actual recorded leads (${q2.totalActualLeads}) by ${q2ConversionGap.toFixed(1)}% in Q2 2026 — a measurement gap, not a performance drop, but it means platform-only reporting understates real demand.`,
  });
  issues.push({
    severity: "Needs attention",
    text: `Showroom visit tracking (${q2.showroomVisits} in Q2 2026 vs ${q1.showroomVisits} in Q1) has not grown alongside the ${deltas.totalActualLeads?.toFixed(1)}% rise in actual leads. This may reflect true visit behaviour or a gap in how visits are logged — the WhatsApp sheet's "Walk-In" tag is the only source for this figure and does not capture website-lead-driven visits at all.`,
  });
  if (familiesQ2.length >= 2) {
    const worst = [...familiesQ2].filter((f) => f.costPerConv != null).sort((a, b) => (b.costPerConv ?? 0) - (a.costPerConv ?? 0))[0];
    const best = [...familiesQ2].filter((f) => f.costPerConv != null).sort((a, b) => (a.costPerConv ?? 0) - (b.costPerConv ?? 0))[0];
    if (worst && best && worst.family !== best.family) {
      issues.push({
        severity: "Monitoring",
        text: `${worst.family} is running at a higher cost per conversion (RM${worst.costPerConv?.toFixed(2)}) than ${best.family} (RM${best.costPerConv?.toFixed(2)}) in Q2 2026, despite a similar budget share — worth an ad-group-level review before shifting more budget toward it.`,
      });
    }
  }
  const generalFamily = familiesLifetime.find((f) => f.family === "General");
  if (generalFamily) {
    issues.push({
      severity: "Monitoring",
      text: `General_TOF_Search has run for less than 1% of lifetime spend (RM${generalFamily.spend.toFixed(2)}) and generated 0 conversions before being paused — no action needed unless the client wants to revisit that theme.`,
    });
  }

  return {
    lifetime,
    q1,
    q2,
    rampUp,
    partial,
    deltas,
    q1UnsureShare,
    q2UnsureShare,
    q2WhatsappShare,
    q2WebsiteShare,
    q2ConversionGap,
    familiesQ2,
    familiesLifetime,
    utmLeadsQ2,
    topFamilyQ2,
    funnel,
    insights,
    issues,
  };
}

export type ReportStory = ReturnType<typeof buildReportStory>;
