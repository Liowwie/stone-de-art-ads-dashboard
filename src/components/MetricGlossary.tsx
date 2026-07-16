const TERMS: { term: string; def: string }[] = [
  {
    term: "Google Ads Conversions",
    def: "A count Google's own platform reports (e.g. clicks it thinks led to a form fill or call). It is measured differently from — and, in this account, is consistently lower than — the leads actually recorded in the website and WhatsApp logs. Useful for platform-side bid optimisation, not for judging real lead volume.",
  },
  {
    term: "Actual Paid Leads",
    def: "Real website + WhatsApp submissions, cleaned of test/spam/duplicates, that are explicitly tagged \"Paid\" (i.e. attributed to Google Ads). This is the number Actual Paid CPL is built from.",
  },
  {
    term: "Total Actual Leads",
    def: "All cleaned website + WhatsApp leads regardless of source tag — Paid, Organic, Unsure, and Unspecified combined. Shows total demand, not just what's attributable to ads.",
  },
  {
    term: "Organic Leads",
    def: "Actual leads explicitly tagged as arriving without paid ad influence (e.g. direct search, referral, word of mouth).",
  },
  {
    term: "Unsure / Unspecified Leads",
    def: "Actual leads where the source could not be confidently tagged Paid or Organic at the time of entry. These are kept out of both the Paid and Organic counts — folding them into either would overstate that channel's performance.",
  },
  {
    term: "Sales",
    def: "Confirmed closed deals from the sales log, tagged Paid / Organic / Unsure by the same convention as leads. Only \"Paid\" sales are used for ROAS.",
  },
];

export function MetricGlossary() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm space-y-3">
      <div className="font-medium text-slate-700">How to read the numbers in this report</div>
      <dl className="space-y-2">
        {TERMS.map((t) => (
          <div key={t.term}>
            <dt className="font-medium text-slate-700">{t.term}</dt>
            <dd className="text-slate-600">{t.def}</dd>
          </div>
        ))}
      </dl>
      <p className="text-slate-600 pt-2 border-t border-slate-100">
        <span className="font-medium text-slate-700">Why Actual Paid CPL is the headline efficiency metric:</span>{" "}
        Google Ads Conversions is a platform-side estimate that this account&apos;s own numbers show diverging
        from real recorded contacts. Actual Paid CPL (spend ÷ Actual Paid Leads) is grounded in real,
        deduplicated records from the business&apos;s own lead logs, so it is the more trustworthy signal for
        judging whether ad spend is translating into real enquiries.
      </p>
    </div>
  );
}
