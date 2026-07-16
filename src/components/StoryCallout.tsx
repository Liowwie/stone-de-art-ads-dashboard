export function StoryCallout({
  observation,
  meaning,
  likelyExplanation,
  action,
}: {
  observation: React.ReactNode;
  meaning: React.ReactNode;
  likelyExplanation?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 text-sm break-inside-avoid">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Observation</div>
        <div className="text-slate-800">{observation}</div>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Meaning</div>
        <div className="text-slate-600">{meaning}</div>
      </div>
      {likelyExplanation && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Likely explanation <span className="normal-case font-normal text-slate-400">(not confirmed)</span>
          </div>
          <div className="text-slate-600">{likelyExplanation}</div>
        </div>
      )}
      {action && (
        <div className="pt-1 border-t border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">Recommended action</div>
          <div className="text-slate-700">{action}</div>
        </div>
      )}
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  Critical: "border-red-200 bg-red-50 text-red-800",
  "Needs attention": "border-amber-200 bg-amber-50 text-amber-800",
  Monitoring: "border-slate-200 bg-slate-50 text-slate-700",
};

export function IssueList({ issues }: { issues: { severity: string; text: string }[] }) {
  const order = ["Critical", "Needs attention", "Monitoring"];
  const grouped = order.map((sev) => ({ sev, items: issues.filter((i) => i.severity === sev) })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {grouped.map((g) => (
        <div key={g.sev}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{g.sev}</div>
          <div className="space-y-2">
            {g.items.map((it, i) => (
              <div key={i} className={`rounded-md border px-3 py-2 text-sm break-inside-avoid ${SEVERITY_STYLES[g.sev]}`}>
                {it.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
