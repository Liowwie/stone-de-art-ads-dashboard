"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden mt-2 text-xs border border-slate-300 rounded px-2 py-1 text-slate-600 hover:bg-slate-50"
    >
      Print / Save as PDF
    </button>
  );
}
