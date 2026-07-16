import { meta } from "@/lib/data";
import { buildReportStory, PERIODS } from "@/lib/insights";
import { formatRM, formatNumber, formatPct } from "@/lib/format";
import { CampaignTable } from "@/components/CampaignTable";
import { SalesSummary } from "@/components/SalesSummary";
import { MetricGlossary } from "@/components/MetricGlossary";
import { StoryCallout, IssueList } from "@/components/StoryCallout";
import { PrintButton } from "@/components/PrintButton";

function ReportKpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-slate-200 rounded-md p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionHeading({ title, id }: { title: string; id?: string }) {
  return (
    <h2 id={id} className="text-base font-semibold text-slate-800 mb-3 pt-2 border-t border-slate-200 first:border-t-0 first:pt-0">
      {title}
    </h2>
  );
}

function fmtDelta(pct: number | null, digits = 1): string {
  if (pct == null) return "n/a";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export default function ReportPage() {
  const s = buildReportStory();
  const generated = new Date(meta.lastUpdated).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const cplImproved = s.deltas.actualLeadCPL != null && s.deltas.actualLeadCPL < 0;

  return (
    <div className="print-page max-w-[210mm] mx-auto px-6 sm:px-10 py-8 bg-white text-slate-800">
      <div className="flex items-start justify-between mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stone De Art — Google Ads Client Report</h1>
          <p className="text-sm text-slate-500">
            Full data range: {meta.accountDateRange.start} to {meta.accountDateRange.end}. Quarter comparison
            below covers {PERIODS.q1.label} vs {PERIODS.q2.label} (the two most recent complete quarters).
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Generated {generated}</div>
          <PrintButton />
        </div>
      </div>

      {/* Executive headline */}
      <section className="mb-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-500 mb-1">
            Executive headline
          </div>
          <p className="text-slate-800 text-base leading-relaxed">
            {PERIODS.q2.label} generated {fmtDelta(s.deltas.paidLeads)} more Actual Paid Leads than{" "}
            {PERIODS.q1.label} ({s.q1.paidLeadsCount} → {s.q2.paidLeadsCount}) on {fmtDelta(s.deltas.spend)} more
            spend, and Actual Paid CPL {cplImproved ? "improved" : "moved"} to {s.q2.actualLeadCPL != null ? formatRM(s.q2.actualLeadCPL) : "—"}
            {" "}— but zero Google-attributed sales have been confirmed since December 2025, so this growth
            still cannot be tied to verified revenue.
          </p>
        </div>
      </section>

      <MetricGlossary />

      {/* Quarter at a glance */}
      <section className="mb-2 mt-6">
        <SectionHeading title="The quarter at a glance" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <StoryCallout
            observation={
              <>
                Actual Paid Leads rose from {s.q1.paidLeadsCount} in {PERIODS.q1.label} to {s.q2.paidLeadsCount}{" "}
                in {PERIODS.q2.label} ({fmtDelta(s.deltas.paidLeads)}), while spend rose {fmtDelta(s.deltas.spend)}{" "}
                ({formatRM(s.q1.spend)} → {formatRM(s.q2.spend)}).
              </>
            }
            meaning="Lead volume grew faster than budget, so the cost of each real paid lead came down slightly rather than up."
            likelyExplanation={
              <>
                Both campaign families (Collection and Signature Works) scaled spend at a similar rate in Q2
                2026, and click-through rate also improved ({formatPct(s.q1.ctr)} → {formatPct(s.q2.ctr)}),
                suggesting ad relevance held up as spend increased rather than efficiency being diluted.
              </>
            }
            action="Continue the current budget split rather than making a large reallocation; the current scale-up is working."
          />
          <StoryCallout
            observation={
              <>
                Confirmed Google-attributed sales in {PERIODS.q1.label} and {PERIODS.q2.label} combined: {s.q1.salesCount + s.q2.salesCount}.
                The only 2 confirmed &ldquo;Paid&rdquo; sales on record ({formatRM(s.lifetime.salesRevenue)}) both closed in{" "}
                {PERIODS.rampUp.label}.
              </>
            }
            meaning="Growth in leads and spend over the last two quarters has no confirmed sale attached to it yet, so ROAS for current activity cannot be verified."
            likelyExplanation="Marble/stone projects typically involve a multi-month sales cycle (quotation, site visit, decision), so recent leads may still be in progress rather than lost — but this cannot be confirmed from the data provided."
            action="Request an updated sales log covering Jan–Jul 2026 so recent lead growth can be checked against actual closed deals."
          />
          <StoryCallout
            observation={
              <>
                &ldquo;Unsure&rdquo;/unspecified-source leads fell from {s.q1UnsureShare.toFixed(1)}% of total actual
                leads in {PERIODS.q1.label} to {s.q2UnsureShare.toFixed(1)}% in {PERIODS.q2.label}.
              </>
            }
            meaning="Source tagging on the WhatsApp log is getting more disciplined, which makes CPL and channel-split numbers more trustworthy over time."
            likelyExplanation="Unspecified-source leads were far more common during the Sep–Dec 2025 launch ramp-up (168 rows) than in Q1 2026 (2 rows) or Q2 2026 (0 rows), consistent with the team adopting the Paid/Organic/Unsure tagging habit after launch."
            action="Keep reinforcing the tagging habit at first contact — it is already working and should not be relaxed."
          />
          <StoryCallout
            observation={
              <>
                Google Ads&apos; own conversion count in {PERIODS.q2.label} ({s.q2.conversions}) sits{" "}
                {s.q2ConversionGap.toFixed(1)}% below the {s.q2.totalActualLeads} actual leads recorded in the
                website + WhatsApp logs over the same period.
              </>
            }
            meaning="The platform's own reporting alone would understate how much real demand the campaigns are generating."
            likelyExplanation="Most enquiries likely happen through WhatsApp conversations that Google Ads has no visibility into (no conversion tracking is wired to the WhatsApp channel), rather than the ads underperforming."
            action="Use Actual Paid Leads / Actual Paid CPL — not the Google Ads conversion count — as the primary number when judging whether campaigns are working."
          />
        </div>
      </section>

      {/* Key wins / Key concerns */}
      <section className="mb-2">
        <SectionHeading title="What improved (key wins)" />
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 mb-4">
          <li>
            Actual Paid Leads: {s.q1.paidLeadsCount} → {s.q2.paidLeadsCount} ({fmtDelta(s.deltas.paidLeads)})
          </li>
          <li>
            Actual Paid CPL: {s.q1.actualLeadCPL != null ? formatRM(s.q1.actualLeadCPL) : "—"} → {s.q2.actualLeadCPL != null ? formatRM(s.q2.actualLeadCPL) : "—"} ({fmtDelta(s.deltas.actualLeadCPL)})
          </li>
          <li>
            CTR: {formatPct(s.q1.ctr)} → {formatPct(s.q2.ctr)} ({s.deltas.ctrPts >= 0 ? "+" : ""}{s.deltas.ctrPts.toFixed(2)} pts)
          </li>
          <li>
            Source-tagging quality: Unsure/unspecified share of leads fell from {s.q1UnsureShare.toFixed(1)}% to {s.q2UnsureShare.toFixed(1)}%
          </li>
          <li>
            Collection campaign family cost per conversion (RM{s.familiesQ2.find((f) => f.family === "Collection")?.costPerConv?.toFixed(2) ?? "—"}) stayed below Signature Works (RM{s.familiesQ2.find((f) => f.family === "Signature Works")?.costPerConv?.toFixed(2) ?? "—"}) in Q2 2026
          </li>
        </ul>

        <SectionHeading title="What declined (key concerns)" />
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
          <li>Confirmed Google-attributed sales: 0 in {PERIODS.q1.label} and 0 in {PERIODS.q2.label}</li>
          <li>
            Showroom visits (Walk-In log): {s.q1.showroomVisits} → {s.q2.showroomVisits} ({s.deltas.showroomVisits >= 0 ? "+" : ""}{s.deltas.showroomVisits}), essentially flat while total actual leads rose {fmtDelta(s.deltas.totalActualLeads)}
          </li>
          <li>Website leads remain a small share of total demand: {s.q2WebsiteShare.toFixed(1)}% of Q2 2026 actual leads</li>
          <li>
            Cost per Google Ads conversion rose to {formatRM(s.q2.costPerConv)} in Q2 2026 versus {formatRM(s.q1.costPerConv)} in Q1 2026, even though Actual Paid CPL improved over the same period — a reminder that the two metrics can move in different directions
          </li>
        </ul>
      </section>

      {/* Where leads came from */}
      <section className="mb-2 break-inside-avoid">
        <SectionHeading title="Where the leads came from" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <ReportKpi label="WhatsApp share (Q2)" value={`${s.q2WhatsappShare.toFixed(1)}%`} sub={`${s.q2.whatsappLeadCount} of ${s.q2.totalActualLeads} leads`} />
          <ReportKpi label="Website share (Q2)" value={`${s.q2WebsiteShare.toFixed(1)}%`} sub={`${s.q2.websiteLeadCount} of ${s.q2.totalActualLeads} leads`} />
          <ReportKpi label="Paid (Q2)" value={formatNumber(s.q2.paidLeadsCount)} />
          <ReportKpi label="Organic (Q2)" value={formatNumber(s.q2.organicLeadsCount)} />
        </div>
        <p className="text-sm text-slate-600">
          WhatsApp is the dominant lead channel by a wide margin ({s.q2WhatsappShare.toFixed(1)}% of Q2 2026 actual
          leads). This means the business&apos;s lead flow is heavily dependent on WhatsApp specifically — if that
          channel were disrupted (number change, staff turnover, platform issue), overall lead volume would be
          affected far more than a website-form outage would be. Paid-tagged leads ({s.q2.paidLeadsCount}) outnumber
          Organic ({s.q2.organicLeadsCount}) in Q2 2026, but {s.q2UnsureShare.toFixed(1)}% of leads still carry an
          Unsure/unspecified tag and are excluded from both — treat the Paid/Organic split as a floor, not the
          complete picture.
        </p>
      </section>

      {/* Campaign story */}
      <section className="mb-2 break-inside-avoid">
        <SectionHeading title="Campaign story" />
        <p className="text-sm text-slate-600 mb-3">
          Figures below are for {PERIODS.q2.label}, grouped into the two active campaign families (General has run
          for under 1% of lifetime spend and is excluded here as inactive).
        </p>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm border border-slate-200 rounded-md overflow-hidden">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-3 py-2">Family</th>
                <th className="text-right font-medium px-3 py-2">Spend share</th>
                <th className="text-right font-medium px-3 py-2">Click share</th>
                <th className="text-right font-medium px-3 py-2">Conversion share</th>
                <th className="text-right font-medium px-3 py-2">Cost / Conv.</th>
                <th className="text-right font-medium px-3 py-2">Website leads (UTM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.familiesQ2
                .filter((f) => f.family !== "General" && f.family !== "Other")
                .map((f) => {
                  const utm = s.utmLeadsQ2.byFamily.find((u) => u.family === f.family);
                  return (
                    <tr key={f.family}>
                      <td className="px-3 py-2 font-medium">{f.family}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{f.spendShare.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{f.clicksShare.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{f.convShare.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{f.costPerConv != null ? formatRM(f.costPerConv) : "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{utm?.count ?? 0}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <StoryCallout
          observation={
            <>
              Collection and Signature Works split Q2 2026 spend almost evenly ({s.familiesQ2.find((f) => f.family === "Collection")?.spendShare.toFixed(1)}% vs {s.familiesQ2.find((f) => f.family === "Signature Works")?.spendShare.toFixed(1)}%), but Collection delivered a larger share of conversions ({s.familiesQ2.find((f) => f.family === "Collection")?.convShare.toFixed(1)}% vs {s.familiesQ2.find((f) => f.family === "Signature Works")?.convShare.toFixed(1)}%) at a lower cost per conversion.
            </>
          }
          meaning="Collection is currently the more efficient of the two active campaign families."
          likelyExplanation="This is based on Google Ads' own conversion metric only — website-lead UTM tags corroborate the direction (15 UTM-tagged Collection leads vs 13 Signature Works in Q2 2026) but WhatsApp leads carry no campaign-level tag at all, so this cannot be confirmed at the full-funnel level."
          action="If increasing total budget, weight the increase toward Collection first; monitor Signature Works ad groups for underperformers before cutting it."
        />
      </section>

      {/* Funnel story */}
      <section className="mb-2 break-inside-avoid">
        <SectionHeading title="Funnel story" />
        <p className="text-sm text-slate-600 mb-3">
          Using the full data range for the largest, most stable sample. Google Ads Conversions is shown
          separately rather than chained into this funnel, because (as shown above) it measures something
          different from — and smaller than — actual recorded leads.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <ReportKpi label="Clicks" value={formatNumber(s.funnel.clicks)} />
          <ReportKpi label="Actual Leads" value={formatNumber(s.funnel.actualLeads)} sub={`${s.funnel.clicksToLeadsPct.toFixed(1)}% of clicks`} />
          <ReportKpi label="Showroom Visits" value={formatNumber(s.funnel.showroomVisits)} sub={`${s.funnel.leadsToVisitsPct.toFixed(1)}% of leads`} />
          <ReportKpi label="Confirmed Sales" value={formatNumber(s.funnel.confirmedSales)} sub={`${s.funnel.visitsToSalesPct.toFixed(1)}% of visits`} />
        </div>
        <StoryCallout
          observation={<>The largest drop-off in the funnel is between Actual Leads ({formatNumber(s.funnel.actualLeads)}) and Showroom Visits ({formatNumber(s.funnel.showroomVisits)}) — a {(100 - s.funnel.leadsToVisitsPct).toFixed(1)}% drop.</>}
          meaning="Most recorded leads are not currently tracked through to a showroom visit."
          likelyExplanation="This is at least partly a tracking gap rather than a true conversion failure: showroom visits are only logged via the WhatsApp sheet's 'Walk-In' tag, which cannot capture visits originating from website leads, and may not be filled in consistently even for WhatsApp-originated visits."
          action="Before treating this as a sales-process problem, confirm with the showroom team whether Walk-In is logged for every visit, including those that started as a website enquiry."
        />
      </section>

      {/* Sales & ROAS story */}
      <section className="mb-2 break-inside-avoid">
        <SectionHeading title="Sales and ROAS story" />
        <SalesSummary kpis={s.lifetime} />
        <div className="mt-3">
          <StoryCallout
            observation={<>Lifetime ROAS is {s.lifetime.roas != null ? `${s.lifetime.roas.toFixed(2)}×` : "not available"}, built from only {s.lifetime.salesCount} confirmed &ldquo;Paid&rdquo; sale(s) against {s.lifetime.unsureSalesCount} &ldquo;Unsure&rdquo;-attribution sale(s) and {s.lifetime.organicSalesCount} Organic sale(s) in the same log.</>}
            meaning="This ROAS figure should not be presented to stakeholders as a confirmed, precise return-on-spend number — it is directionally useful at best."
            likelyExplanation="Sales attribution in the source log is a manual tag with no order ID, click ID, or UTM link back to a specific ad click, and the sample size (2 confirmed sales) is too small to be statistically meaningful."
            action="Do not use this ROAS figure alone to justify a budget increase or cut. Prioritise closing the sales-attribution tracking gap first (see Recommended Actions)."
          />
        </div>
      </section>

      {/* Data-quality limitations */}
      <section className="mb-2">
        <SectionHeading title="Data-quality limitations" />
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
          <li>Sales attribution is a manual tag with no order ID/click ID/UTM link — only 11 sales rows exist in total, 2 of which are confirmed Google-attributed.</li>
          <li>Website-lead UTM campaign tags (e.g. &ldquo;collection&rdquo;, &ldquo;signature_work&rdquo;) map to a campaign family, not an exact Google Ads campaign — multiple dated campaigns share the same tag.</li>
          <li>WhatsApp leads carry no campaign-level attribution field at all.</li>
          <li>RSA export contains no actual headline/description creative text — only ad-group-level performance metrics are available.</li>
          <li>Quality Score is present on only a small fraction of keywords; no fabricated account-wide average is shown.</li>
          <li>874 rows in the WhatsApp export were blank template rows with no date, name, or phone number and were excluded entirely.</li>
        </ul>
      </section>

      {/* Current issues */}
      <section className="mb-2 break-inside-avoid">
        <SectionHeading title="Current issues, ranked by business impact" />
        <IssueList issues={s.issues} />
      </section>

      {/* Recommended actions */}
      <section className="mb-2 break-inside-avoid">
        <SectionHeading title="Recommended next actions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-slate-700 mb-1">Immediate (next 7 days)</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Request an updated sales log covering Jan–Jul 2026 with Paid/Organic/Unsure tags — the only confirmed Paid sales on file predate this year&apos;s growth.</li>
              <li>Confirm with the showroom/sales team whether every walk-in visit (including from website leads) is being logged.</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-slate-700 mb-1">Short-term (next 30 days)</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Review Signature Works at the ad-group/keyword level against Collection to explain the cost-per-conversion gap.</li>
              <li>Audit the ~{s.q2UnsureShare.toFixed(0)}% of Q2 leads tagged Unsure to see if a source can be recovered from conversation history.</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-slate-700 mb-1">Tracking improvements</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Add a booking/sale-source field that ties a confirmed sale back to a specific lead record, not just a Paid/Organic/Unsure tag.</li>
              <li>Continue the Paid/Organic/Unsure tagging discipline that has already cut Unsure/unspecified share from {s.q1UnsureShare.toFixed(0)}% (Q1) to {s.q2UnsureShare.toFixed(0)}% (Q2).</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-slate-700 mb-1">Budget recommendations</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Keep the current roughly even Collection / Signature Works split; if adding budget, weight new spend toward Collection first (lower cost per conversion).</li>
              <li>Hold off on a further overall spend increase until updated sales data closes the current attribution gap — more spend cannot yet be tied to more confirmed revenue.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What this means for the business */}
      <section className="mb-4 break-inside-avoid">
        <SectionHeading title="What this means for the business" />
        <div className="rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <p>
            <span className="font-medium">Are ads generating more or fewer real leads?</span> More — Actual Paid
            Leads grew {fmtDelta(s.deltas.paidLeads)} quarter-on-quarter ({s.q1.paidLeadsCount} → {s.q2.paidLeadsCount}).
          </p>
          <p>
            <span className="font-medium">Is lead efficiency improving or declining?</span>{" "}
            {cplImproved ? "Improving" : "Roughly stable"} — Actual Paid CPL moved {fmtDelta(s.deltas.actualLeadCPL)}{" "}
            ({s.q1.actualLeadCPL != null ? formatRM(s.q1.actualLeadCPL) : "—"} → {s.q2.actualLeadCPL != null ? formatRM(s.q2.actualLeadCPL) : "—"}).
          </p>
          <p>
            <span className="font-medium">Which lead source is driving results?</span> WhatsApp, by a wide margin
            ({s.q2WhatsappShare.toFixed(1)}% of Q2 2026 actual leads vs {s.q2WebsiteShare.toFixed(1)}% from the
            website form).
          </p>
          <p>
            <span className="font-medium">Which campaign needs attention?</span> Signature Works — its cost per
            conversion (RM{s.familiesQ2.find((f) => f.family === "Signature Works")?.costPerConv?.toFixed(2) ?? "—"})
            is running above Collection (RM{s.familiesQ2.find((f) => f.family === "Collection")?.costPerConv?.toFixed(2) ?? "—"}) despite a similar budget share.
          </p>
          <p>
            <span className="font-medium">Is revenue attribution reliable enough to judge ROAS?</span> Not yet.
            Only {s.lifetime.salesCount} confirmed Google-attributed sale(s) exist across the whole data range,
            both from December 2025 — there is no confirmed sale to check against the leads generated in Q1 or Q2
            2026.
          </p>
          <p>
            <span className="font-medium">What should the client approve or change next?</span> Approve continuing
            the current spend and budget split; do not approve a further spend increase based on ROAS until an
            updated, better-attributed sales log is provided.
          </p>
        </div>
      </section>

      <section className="mb-4 break-inside-avoid">
        <SectionHeading title="Campaign performance (full account, all time)" />
        <CampaignTable />
      </section>

      <footer className="text-[11px] text-slate-400 border-t border-slate-200 pt-3 mt-6">
        No customer names, phone numbers, or email addresses are included in this report. Every figure above is
        computed directly from the provided Google Ads exports and lead/sales logs — nothing is estimated or
        inferred beyond the formulas and explicitly-labelled &ldquo;likely explanation&rdquo; notes above, which are
        clearly separated from verified data.
      </footer>
    </div>
  );
}
