import { meta } from "@/lib/data";

export function LastUpdated() {
  const d = new Date(meta.lastUpdated);
  const label = d.toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="text-xs text-slate-400">
      Data last built: {label} · Google Ads data: {meta.accountDateRange.start} to{" "}
      {meta.accountDateRange.end}
    </div>
  );
}
