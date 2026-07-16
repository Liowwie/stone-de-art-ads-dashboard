export function formatRM(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("MYR", "RM")
    .replace("MYR", "RM");
}

export function formatRMPrecise(value: number): string {
  return `RM ${new Intl.NumberFormat("en-MY", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-MY").format(Math.round(value));
}

export function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatMonthLabel(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
}
