export type MonthlyRow = {
  month: string; // "2025-09"
  monthLabel: string; // "September 2025"
  campaign: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  conversions: number;
  convRate: number;
  costPerConv: number;
};

export type CampaignRow = {
  campaign: string;
  state: string;
  type: string;
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  conversions: number;
  costPerConv: number;
  convRate: number;
  imprAbsTopPct: number;
  imprTopPct: number;
};

export type AdGroupRow = {
  adGroup: string;
  campaign: string;
  campaignState: string;
  adGroupState: string;
  adsActive: number;
  keywordsActive: number;
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  conversions: number;
  costPerConv: number;
  convRate: number;
};

export type RsaRow = {
  adGroup: string;
  campaign: string;
  campaignState: string;
  adGroupState: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  costPerConv: number;
  convRate: number;
};

export type RsaData = {
  hasCreativeText: boolean;
  rows: RsaRow[];
};

export type KeywordRow = {
  keyword: string;
  status: string;
  matchType: string;
  campaign: string;
  adGroup: string;
  qualityScore: number | null;
  clicks: number;
  impressions: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  costPerConv: number;
  convRate: number;
};

export type WebsiteLead = {
  date: string | null; // "2025-08-11"
  siteLocation: string | null;
  budgetRange: string | null;
  projectRole: string | null;
  lookingFor: string | null;
  stoneTypes: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  newReturning: string | null;
  organicPaid: string;
};

export type WebsiteLeadsData = {
  raw: WebsiteLead[];
  audit: {
    rawCount: number;
    excludedTest: number;
    excludedSpam: number;
    excludedDuplicate: number;
    cleanCount: number;
  };
};

export type WhatsappLead = {
  date: string | null;
  inquiryType: string | null;
  leadStatus: string | null;
  organicPaid: string;
  newReturning: string | null;
  leadQuality: string | null;
};

export type WhatsappLeadsData = {
  raw: WhatsappLead[];
  audit: {
    rawCount: number;
    excludedBlank: number;
    excludedTest: number;
    excludedDuplicate: number;
    cleanCount: number;
  };
};

export type SaleRow = {
  month: string;
  organicPaid: string;
  amount: number;
};

export type Meta = {
  lastUpdated: string;
  accountDateRange: { start: string | null; end: string | null };
  websiteLeadsDateRange: { min: string | null; max: string | null };
  whatsappLeadsDateRange: { min: string | null; max: string | null };
  salesDateRange: { min: string | null; max: string | null };
};

export type AuditEntry = {
  dataset: string;
  reason: string;
  count: number;
};
