// ─────────────────────────────────────────────────────────────────────────────
// Angoalissar Compass — Core Types
// Replace stub implementations with real API responses matching these shapes.
// ─────────────────────────────────────────────────────────────────────────────

export interface CommodityPrice {
  province: string;
  commodity: string;
  price: number;
  currency: string;
  unit: string;
  lastUpdated: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  forecast: number;
  upper: number;
  lower: number;
}

export interface Distributor {
  id: string;
  name: string;
  region: string;
  salesAchievement: number;
  profitability: number;
  collectionEfficiency: number;
  coverage: number;
  growth: number;
  score: number;
  rank: number;
}

export interface SKUMargin {
  sku: string;
  brand: string;
  category: string;
  region: string;
  channel: string;
  salesperson: string;
  revenueAOA: number;
  costAOA: number;
  grossMargin: number;
  units: number;
}

export interface LandedCostParams {
  skuName: string;
  baseCostUSD: number;
  freightUSD: number;
  customsDuty: number;
  fxRate: number;
  otherCostsAOA: number;
  sellingPriceAOA: number;
}

export interface LandedCostResult extends LandedCostParams {
  cifAOA: number;
  dutyAOA: number;
  landedCostAOA: number;
  marginPct: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  date: string;
  category: "macro" | "commodity" | "competitor" | "regulatory";
  sentiment: "positive" | "neutral" | "negative";
  province?: string;
}

export interface SavedBriefing {
  id: string;
  title: string;
  content: string;
  type: "briefing" | "devil";
  province: string | null;
  tone: string;
  horizon: string;
  generatedAt: string;
}

export interface KPISummary {
  totalRevenue: number;
  totalVolumeMT: number;
  grossMarginPct: number;
  activeCustomers: number;
  collectionDays: number;
  topRegion: string;
  revenueGrowthPct: number;
  marginVsTargetPct: number;
}

export interface FXRate {
  pair: string;
  rate: number;
  change: number;
}

export interface ProvinceHeat {
  id: string;
  cx: number;
  cy: number;
  r: number;
  value: number;
}

export type Section =
  | "overview" | "commodities" | "distributors" | "profitability"
  | "landed" | "copilot" | "briefings" | "news" | "settings";

export interface AppSettings {
  devilTone: "mild" | "moderate" | "brutal";
  copilotMemory: number;
  briefingTime: string;
  briefingEnabled: boolean;
}
