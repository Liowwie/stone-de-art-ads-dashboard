// Minimal RFC4180-ish CSV parser: handles quoted fields, embedded commas,
// embedded newlines inside quotes, and "" escaped quotes.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\r") {
      i += 1;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  // flush last field/row if file doesn't end with newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Parses a CSV file's text into an array of objects keyed by header,
// skipping `skipLines` leading non-header lines (title/date-range rows
// present in the Google Ads exports).
export function parseCsvObjects(text, skipLines = 0) {
  const rows = parseCsv(text);
  const dataRows = rows.slice(skipLines);
  const header = dataRows[0].map((h) => h.trim());
  const out = [];
  for (const r of dataRows.slice(1)) {
    // skip fully blank trailing rows
    if (r.length === 1 && r[0].trim() === "") continue;
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    out.push(obj);
  }
  return { header, rows: out };
}

// "1,234" / "6.87%" / "192.47" / " --" / "" -> number
export function num(s) {
  if (s === undefined || s === null) return 0;
  const t = String(s).trim().replace(/,/g, "").replace(/%/g, "");
  if (t === "" || t === "--" || t === "-") return 0;
  const v = Number(t);
  return Number.isFinite(v) ? v : 0;
}

// "RM29,070.00" -> 29070.00
export function rm(s) {
  if (!s) return 0;
  const t = String(s).replace(/RM/gi, "").trim();
  return num(t);
}
