export function FormulaNote() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-2">
      <div className="font-medium text-slate-700">Formulas used on this page</div>
      <div>
        <span className="font-medium text-slate-700">Actual Lead CPL</span> = Google Ads spend ÷ valid
        website + WhatsApp leads tagged &ldquo;Paid&rdquo;. This is independent of Google Ads&apos;
        own conversion count — see &ldquo;Cost / Google Ads Conversion&rdquo; for that platform metric.
      </div>
      <div>
        <span className="font-medium text-slate-700">ROAS</span> = confirmed Google-attributed sales
        revenue (sales log rows tagged &ldquo;Paid&rdquo;) ÷ Google Ads spend. Organic and Unsure-attribution
        sales are excluded from this figure.
      </div>
    </div>
  );
}
