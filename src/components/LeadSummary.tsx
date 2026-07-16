import { getExcludedLeadsSummary, websiteLeads, whatsappLeads } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { KpiCard, KpiGrid } from "@/components/KpiCard";

export function LeadSummary() {
  const excluded = getExcludedLeadsSummary();

  return (
    <div className="space-y-4">
      <KpiGrid>
        <KpiCard label="Website leads (valid)" value={formatNumber(websiteLeads.audit.cleanCount)} sub={`of ${websiteLeads.audit.rawCount} raw submissions`} />
        <KpiCard
          label="WhatsApp leads (valid)"
          value={formatNumber(whatsappLeads.raw.filter((l) => l.inquiryType === "Whatsapp").length)}
          sub={`of ${whatsappLeads.audit.rawCount} raw rows`}
        />
        <KpiCard label="Walk-ins (from WhatsApp log)" value={formatNumber(whatsappLeads.raw.filter((l) => l.inquiryType === "Walk-In").length)} sub="tracked separately, not summed into leads" />
        <KpiCard label="Total records excluded" value={formatNumber(excluded.totalExcluded)} sub="test, spam, duplicate, blank" />
      </KpiGrid>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-sm font-medium text-slate-600 mb-3">Exclusion audit</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-slate-500 text-xs uppercase mb-1">Website leads</div>
            <ul className="space-y-1 text-slate-600">
              <li className="flex justify-between"><span>Raw submissions</span><span className="tabular-nums">{excluded.website.rawCount}</span></li>
              <li className="flex justify-between"><span>Excluded — explicit test entries</span><span className="tabular-nums">{excluded.website.excludedTest}</span></li>
              <li className="flex justify-between"><span>Excluded — spam / unsolicited pitches</span><span className="tabular-nums">{excluded.website.excludedSpam}</span></li>
              <li className="flex justify-between"><span>Excluded — duplicate submission</span><span className="tabular-nums">{excluded.website.excludedDuplicate}</span></li>
              <li className="flex justify-between font-medium text-slate-800 pt-1 border-t border-slate-100"><span>Valid leads</span><span className="tabular-nums">{excluded.website.cleanCount}</span></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-slate-500 text-xs uppercase mb-1">WhatsApp leads</div>
            <ul className="space-y-1 text-slate-600">
              <li className="flex justify-between"><span>Raw rows</span><span className="tabular-nums">{excluded.whatsapp.rawCount}</span></li>
              <li className="flex justify-between"><span>Excluded — blank template rows</span><span className="tabular-nums">{excluded.whatsapp.excludedBlank}</span></li>
              <li className="flex justify-between"><span>Excluded — explicit test entries</span><span className="tabular-nums">{excluded.whatsapp.excludedTest}</span></li>
              <li className="flex justify-between"><span>Excluded — duplicate submission</span><span className="tabular-nums">{excluded.whatsapp.excludedDuplicate}</span></li>
              <li className="flex justify-between font-medium text-slate-800 pt-1 border-t border-slate-100"><span>Valid rows (Whatsapp + Walk-In)</span><span className="tabular-nums">{excluded.whatsapp.cleanCount}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
