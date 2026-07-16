// Build-time ETL: reads the raw CSVs in /data, cleans them per the
// documented data-quality rules, and writes typed JSON consumed by the app.
// Run via `npm run build` / `npm run dev` (see package.json "predata").
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseCsvObjects, num, rm } from "./lib/csv.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const OUT_DIR = path.resolve(__dirname, "../src/data");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// The raw CSVs (which contain names/phones/emails) live outside this repo on
// purpose, so they never get committed or deployed. On a fresh clone (e.g. a
// CI runner building for GitHub Pages) that directory won't exist — in that
// case, keep the already-committed, already-scrubbed JSON in src/data as-is
// rather than failing the build.
if (!existsSync(DATA_DIR)) {
  console.log(`[build-data] ${DATA_DIR} not found — using committed src/data/*.json as-is (no raw CSVs to rebuild from).`);
  process.exit(0);
}

const readRaw = (name) => readFileSync(path.join(DATA_DIR, name), "utf-8");

// ---------- shared helpers ----------

const GADS_MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function monthNameToISO(m) {
  const [name, year] = m.trim().split(/\s+/);
  const mm = GADS_MONTHS[name.toLowerCase()];
  return `${year}-${String(mm).padStart(2, "0")}`;
}

// "8/25" or "04/26" -> "2025-08" / "2026-04"
function shortMonthToISO(m) {
  const [mo, yy] = m.trim().split("/");
  const year = 2000 + Number(yy);
  return `${year}-${String(Number(mo)).padStart(2, "0")}`;
}

// "2025/08/11" -> "2025-08-11"
function slashDateToISO(d) {
  if (!d) return null;
  const t = d.trim();
  const mSlash = t.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (mSlash) return `${mSlash[1]}-${mSlash[2]}-${mSlash[3]}`;
  return null;
}

function pct(s) {
  return num(s); // already stored as a plain number (e.g. 6.87 for "6.87%")
}

// Account-level date range, parsed from the "3 September 2025 - 16 July 2026"
// line present as row 2 of every Google Ads export.
function parseAccountRange(text) {
  const line = text.split("\n")[1]?.trim() ?? "";
  const [startStr, endStr] = line.split(" - ").map((s) => s.trim());
  const parseLong = (s) => {
    const m = s.match(/^(\d{1,2}) (\w+) (\d{4})$/);
    if (!m) return null;
    const mm = GADS_MONTHS[m[2].toLowerCase()];
    return `${m[3]}-${String(mm).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  };
  return { start: parseLong(startStr), end: parseLong(endStr) };
}

const auditLog = [];
function audit(entry) {
  auditLog.push(entry);
  console.log(`[audit] ${entry.dataset}: ${entry.reason} -> ${entry.count}`);
}

// ---------- Google Ads: monthly ----------

function buildMonthly() {
  const text = readRaw("google-ads-monthly.csv");
  const { rows } = parseCsvObjects(text, 2);
  return rows.map((r) => ({
    month: monthNameToISO(r["Month"]),
    monthLabel: r["Month"],
    campaign: r["Campaign"],
    impressions: num(r["Impr."]),
    clicks: num(r["Clicks"]),
    ctr: pct(r["CTR"]),
    cost: num(r["Cost"]),
    conversions: num(r["Conversions"]),
    convRate: pct(r["Conv. rate"]),
    costPerConv: num(r["Cost / conv."]),
  }));
}

// ---------- Google Ads: campaigns ----------

function buildCampaigns() {
  const text = readRaw("google-ads-campaigns.csv");
  const { rows } = parseCsvObjects(text, 2);
  return rows.map((r) => ({
    campaign: r["Campaign"],
    state: r["Campaign state"],
    type: r["Campaign type"],
    cost: num(r["Cost"]),
    impressions: num(r["Impr."]),
    clicks: num(r["Clicks"]),
    ctr: pct(r["CTR"]),
    avgCpc: num(r["Avg. CPC"]),
    conversions: num(r["Conversions"]),
    costPerConv: num(r["Cost / conv."]),
    convRate: pct(r["Conv. rate"]),
    imprAbsTopPct: pct(r["Impr. (Abs. Top) %"]),
    imprTopPct: pct(r["Impr. (Top) %"]),
  }));
}

// ---------- Google Ads: ad groups ----------

function buildAdGroups() {
  const text = readRaw("google-ads-adgroups.csv");
  const { rows } = parseCsvObjects(text, 2);
  return rows.map((r) => ({
    adGroup: r["Ad group"],
    campaign: r["Campaign"],
    campaignState: r["Campaign state"],
    adGroupState: r["Ad group state"],
    adsActive: num(r["Ads: active"]),
    keywordsActive: num(r["Keywords: active"]),
    cost: num(r["Cost"]),
    impressions: num(r["Impr."]),
    clicks: num(r["Clicks"]),
    ctr: pct(r["CTR"]),
    avgCpc: num(r["Avg. CPC"]),
    conversions: num(r["Conversions"]),
    costPerConv: num(r["Cost / conv."]),
    convRate: pct(r["Conv. rate"]),
  }));
}

// ---------- Google Ads: RSA (ad-group level; no creative text in export) ----------

function buildRsa() {
  const text = readRaw("google-ads-rsa.csv");
  const { rows } = parseCsvObjects(text, 2);
  const withCreative = rows.filter(
    (r) => r["Headline"] && !["--", " --", ""].includes(r["Headline"].trim())
  ).length;
  return {
    hasCreativeText: withCreative > 0,
    rows: rows.map((r) => ({
      adGroup: r["Ad group"],
      campaign: r["Campaign"],
      campaignState: r["Campaign state"],
      adGroupState: r["Ad group state"],
      clicks: num(r["Clicks"]),
      impressions: num(r["Impr."]),
      ctr: pct(r["CTR"]),
      avgCpc: num(r["Avg. CPC"]),
      cost: num(r["Cost"]),
      conversions: num(r["Conversions"]),
      costPerConv: num(r["Cost / conv."]),
      convRate: pct(r["Conv. rate"]),
    })),
  };
}

// ---------- Google Ads: keywords ----------

function buildKeywords() {
  const text = readRaw("google-ads-keywords.csv");
  const { rows } = parseCsvObjects(text, 2);
  return rows
    .map((r) => ({
      keyword: r["Search keyword"],
      status: r["Search keyword status"],
      matchType: r["Search keyword match type"],
      campaign: r["Campaign"],
      adGroup: r["Ad group"],
      qualityScore:
        r["Quality Score"] && r["Quality Score"].trim() !== "--" && r["Quality Score"].trim() !== ""
          ? num(r["Quality Score"])
          : null,
      clicks: num(r["Clicks"]),
      impressions: num(r["Impr."]),
      ctr: pct(r["CTR"]),
      avgCpc: num(r["Avg. CPC"]),
      cost: num(r["Cost"]),
      conversions: num(r["Conversions"]),
      costPerConv: num(r["Cost / conv."]),
      convRate: pct(r["Conv. rate"]),
    }))
    // Keep the dashboard's keyword table useful: drop rows with zero
    // impressions AND zero cost (never served) — this is a display filter,
    // not a data deletion; the raw file remains the source of truth.
    .filter((k) => k.impressions > 0 || k.cost > 0);
}

// ---------- Website leads ----------

const SPAM_MESSAGE_RE =
  /guest post|backlink|domain authority\b|link building|outreach service|business partner|distribut(e|ion) (of )?our products|blogger outreach/i;
const TEST_NAME_RE = /\btest(ing)?\b/i;

function buildWebsiteLeads() {
  const text = readRaw("stone-de-art-website-leads.csv");
  const { rows } = parseCsvObjects(text, 0);

  const rawCount = rows.length;
  let excludedTest = 0;
  let excludedSpam = 0;
  let excludedDuplicate = 0;

  const seenPhoneDate = new Set();
  const clean = [];

  // Preserve file order (chronological) so the first of a duplicate pair wins.
  for (const r of rows) {
    const name = r["Name"] || "";
    const phone = (r["Phone Number"] || "").trim();
    const message = r["Write your Message"] || "";
    const cleanDate = slashDateToISO(r["Clean Date"]);

    if (TEST_NAME_RE.test(name)) {
      excludedTest += 1;
      continue;
    }
    if (SPAM_MESSAGE_RE.test(message)) {
      excludedSpam += 1;
      continue;
    }
    const dupKey =
      phone && !["-", "--", ""].includes(phone) ? `${phone}|${cleanDate}` : null;
    if (dupKey) {
      if (seenPhoneDate.has(dupKey)) {
        excludedDuplicate += 1;
        continue;
      }
      seenPhoneDate.add(dupKey);
    }

    const utmSource = (r["utm_source"] || "").toLowerCase();
    const isGoogleUtm = utmSource === "google";
    let organicPaid = r["Organic / Paid?"] || "Unspecified";
    // A "Paid" tag paired with a non-Google UTM source is a tagging error
    // (e.g. utm_source=chatgpt.com) — treat conservatively as unattributable.
    if (organicPaid === "Paid" && r["utm_source"] && !isGoogleUtm) {
      organicPaid = "Unsure";
    }

    clean.push({
      date: cleanDate,
      siteLocation: r["Site Location"] || null,
      budgetRange: r["Budget Range"] || null,
      projectRole: r["Your Project Role"] || null,
      lookingFor: r["Looking For ?"] || null,
      stoneTypes: r["Preferred Stone Types?"] || null,
      utmSource: r["utm_source"] || null,
      utmMedium: r["utm_medium"] || null,
      utmCampaign: r["utm_campaign"] || null,
      utmContent: r["utm_content"] || null,
      newReturning: r["New / Returning"] || null,
      organicPaid,
    });
  }

  audit({ dataset: "websiteLeads", reason: "explicit test submissions", count: excludedTest });
  audit({ dataset: "websiteLeads", reason: "spam / unsolicited pitch content", count: excludedSpam });
  audit({ dataset: "websiteLeads", reason: "duplicate submission (same phone + date)", count: excludedDuplicate });

  return {
    raw: clean,
    audit: {
      rawCount,
      excludedTest,
      excludedSpam,
      excludedDuplicate,
      cleanCount: clean.length,
    },
  };
}

// ---------- WhatsApp leads ----------

function buildWhatsappLeads() {
  const text = readRaw("stone-de-art-whatsapp-leads.csv");
  const { rows } = parseCsvObjects(text, 0);
  const rawCount = rows.length;

  let excludedBlank = 0;
  let excludedTest = 0;
  let excludedDuplicate = 0;

  const seenPhoneDate = new Set();
  const clean = [];

  for (const r of rows) {
    const date = r["Date"] || "";
    if (!date.trim()) {
      excludedBlank += 1;
      continue;
    }
    const name = r["Customer Name"] || "";
    if (TEST_NAME_RE.test(name)) {
      excludedTest += 1;
      continue;
    }
    const phone = (r["Phone Number"] || "").trim();
    const dupKey = phone && !["-", "--", ""].includes(phone) ? `${phone}|${date}` : null;
    if (dupKey) {
      if (seenPhoneDate.has(dupKey)) {
        excludedDuplicate += 1;
        continue;
      }
      seenPhoneDate.add(dupKey);
    }

    let organicPaid = r["Organic/Paid"] || "Unspecified";
    if (organicPaid === "" ) organicPaid = "Unspecified";
    if (organicPaid === "Unsure, Paid") organicPaid = "Unsure";

    clean.push({
      date: slashDateToISO(date),
      inquiryType: r["Inquiry Type"] || null,
      leadStatus: r["Lead Status"] || null,
      organicPaid,
      newReturning: r["New / Returning?"] || null,
      leadQuality: r["Lead Quality"] || null,
    });
  }

  audit({ dataset: "whatsappLeads", reason: "blank template row (no date/name/phone)", count: excludedBlank });
  audit({ dataset: "whatsappLeads", reason: "explicit test submissions", count: excludedTest });
  audit({ dataset: "whatsappLeads", reason: "duplicate submission (same phone + date)", count: excludedDuplicate });

  return {
    raw: clean,
    audit: {
      rawCount,
      excludedBlank,
      excludedTest,
      excludedDuplicate,
      cleanCount: clean.length,
    },
  };
}

// ---------- Google-attributed sales ----------

function buildSales() {
  const text = readRaw("stone-de-art-google-sales.csv");
  const { rows } = parseCsvObjects(text, 0);
  return rows.map((r) => {
    let organicPaid = r["Organic / Paid"] || "Unsure";
    if (organicPaid === "Unsure, Paid") organicPaid = "Unsure";
    return {
      month: shortMonthToISO(r["Month"]),
      organicPaid,
      amount: rm(r["Sales"]),
    };
  });
}

// ---------- assemble ----------

const monthly = buildMonthly();
const campaigns = buildCampaigns();
const adGroups = buildAdGroups();
const rsa = buildRsa();
const keywords = buildKeywords();
const websiteLeads = buildWebsiteLeads();
const whatsappLeads = buildWhatsappLeads();
const sales = buildSales();

const accountRange = parseAccountRange(readRaw("google-ads-campaigns.csv"));

const meta = {
  lastUpdated: new Date().toISOString(),
  accountDateRange: accountRange,
  websiteLeadsDateRange: minMax(websiteLeads.raw.map((r) => r.date).filter(Boolean)),
  whatsappLeadsDateRange: minMax(whatsappLeads.raw.map((r) => r.date).filter(Boolean)),
  salesDateRange: minMax(sales.map((s) => s.month).filter(Boolean)),
};

function minMax(arr) {
  if (arr.length === 0) return { min: null, max: null };
  const sorted = [...arr].sort();
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}

writeFileSync(path.join(OUT_DIR, "monthly.json"), JSON.stringify(monthly, null, 2));
writeFileSync(path.join(OUT_DIR, "campaigns.json"), JSON.stringify(campaigns, null, 2));
writeFileSync(path.join(OUT_DIR, "adGroups.json"), JSON.stringify(adGroups, null, 2));
writeFileSync(path.join(OUT_DIR, "rsa.json"), JSON.stringify(rsa, null, 2));
writeFileSync(path.join(OUT_DIR, "keywords.json"), JSON.stringify(keywords, null, 2));
writeFileSync(path.join(OUT_DIR, "websiteLeads.json"), JSON.stringify(websiteLeads, null, 2));
writeFileSync(path.join(OUT_DIR, "whatsappLeads.json"), JSON.stringify(whatsappLeads, null, 2));
writeFileSync(path.join(OUT_DIR, "sales.json"), JSON.stringify(sales, null, 2));
writeFileSync(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
writeFileSync(path.join(OUT_DIR, "auditLog.json"), JSON.stringify(auditLog, null, 2));

console.log("\nData build complete:");
console.log(`  monthly: ${monthly.length} rows`);
console.log(`  campaigns: ${campaigns.length} rows`);
console.log(`  adGroups: ${adGroups.length} rows`);
console.log(`  rsa: ${rsa.rows.length} rows (hasCreativeText=${rsa.hasCreativeText})`);
console.log(`  keywords: ${keywords.length} rows (filtered from raw)`);
console.log(`  websiteLeads: ${websiteLeads.raw.length}/${websiteLeads.audit.rawCount} clean`);
console.log(`  whatsappLeads: ${whatsappLeads.raw.length}/${whatsappLeads.audit.rawCount} clean`);
console.log(`  sales: ${sales.length} rows`);
