// ─────────────────────────────────────────────────────────────────────────────
// API Service Layer
// All data flows through this file. Swap stub functions for real fetch() calls
// when your backend is ready. Each function signature stays the same.
// ─────────────────────────────────────────────────────────────────────────────
import type {
  CommodityPrice, PriceHistoryPoint, ForecastPoint,
  Distributor, SKUMargin, LandedCostParams, LandedCostResult,
  NewsItem, KPISummary, FXRate, ProvinceHeat,
} from "@/types";
import { PROVINCES, COMMODITIES, BRANDS, REGIONS, CHANNELS, SALESPERSONS, PROVINCE_MAP_COORDS } from "@/lib/constants";

// ── helpers ──────────────────────────────────────────────────────────────────
const rnd  = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1) + a);
const rndF = (a: number, b: number, d = 2) => parseFloat((Math.random() * (b - a) + a).toFixed(d));

const PRICE_RANGES: Record<string, [number,number]> = {
  Rice:[400,800], Maize:[200,500], Beans:[600,1200],
  Oil:[1000,2000], Sugar:[500,1000], Flour:[300,700],
};

// ── Commodity Prices ─────────────────────────────────────────────────────────
const _prices: CommodityPrice[] = PROVINCES.flatMap(province =>
  COMMODITIES.map(commodity => ({
    province, commodity,
    price: rnd(...PRICE_RANGES[commodity]),
    currency: "AOA", unit: "kg",
    lastUpdated: new Date().toISOString(),
  }))
);

/** GET /api/prices?province=Luanda */
export async function fetchPrices(province?: string | null): Promise<CommodityPrice[]> {
  // TODO: return fetch(`/api/prices${province ? `?province=${province}` : ""}`).then(r => r.json());
  return province ? _prices.filter(p => p.province === province) : _prices;
}

/** GET /api/prices/history?commodity=Rice&days=60 */
export async function fetchPriceHistory(commodity: string, days = 60): Promise<PriceHistoryPoint[]> {
  // TODO: return fetch(`/api/prices/history?commodity=${commodity}&days=${days}`).then(r => r.json());
  const base = _prices.find(p => p.commodity === commodity)?.price ?? 500;
  let price = base * 0.85;
  return Array.from({ length: days + 1 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - i));
    price += (Math.random() - 0.5) * base * 0.04;
    return { date: d.toISOString().slice(0,10), price: Math.round(price) };
  });
}

/** GET /api/prices/forecast?commodity=Rice */
export async function fetchForecast(commodity: string): Promise<ForecastPoint[]> {
  // TODO: return fetch(`/api/prices/forecast?commodity=${commodity}`).then(r => r.json());
  const base = _prices.find(p => p.commodity === commodity)?.price ?? 500;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cur = new Date().getMonth();
  return months.map((month, i) => ({
    month,
    actual: i <= cur ? Math.round(base * (1 + (i-5)*0.006) + (Math.random()-0.5)*base*0.04) : undefined,
    forecast: Math.round(base * (1 + (i-5)*0.007)),
    upper:    Math.round(base * (1 + (i-5)*0.007) * 1.07),
    lower:    Math.round(base * (1 + (i-5)*0.007) * 0.93),
  }));
}

// ── KPI Summary ──────────────────────────────────────────────────────────────
/** GET /api/kpi */
export async function fetchKPI(): Promise<KPISummary> {
  // TODO: return fetch("/api/kpi").then(r => r.json());
  return {
    totalRevenue: 2_840_000_000,
    totalVolumeMT: 21868,
    grossMarginPct: 6.4,
    activeCustomers: 312,
    collectionDays: 38,
    topRegion: "Luanda",
    revenueGrowthPct: 4.2,
    marginVsTargetPct: -2.1,
  };
}

// ── Distributors ─────────────────────────────────────────────────────────────
const _distributors: Distributor[] = [
  "Norte Distributors Ltd","Sul Commerce","Benguela Trade","Luanda Wholesale",
  "Cabinda Supply Co","Huambo Distributors","Lobito Commerce","Namibe Traders",
].map((name, i) => {
  const sales = rnd(65,115), profit = rndF(4,18), collect = rnd(70,98);
  const coverage = rnd(55,95), growth = rndF(-5,22);
  const score = Math.min(Math.round(
    (Math.min(sales,100)*0.3 + profit*2 + collect*0.25 + coverage*0.2 + Math.max(growth+5,0)*1.5) / 1.5
  ), 100);
  return { id:`d${i}`, name, region: REGIONS[i % REGIONS.length], salesAchievement:sales,
    profitability:profit, collectionEfficiency:collect, coverage, growth, score, rank:0 };
}).sort((a,b) => b.score - a.score).map((d,i) => ({ ...d, rank: i+1 }));

/** GET /api/distributors?region=Luanda */
export async function fetchDistributors(region?: string | null): Promise<Distributor[]> {
  // TODO: return fetch(`/api/distributors${region ? `?region=${region}` : ""}`).then(r => r.json());
  return region ? _distributors.filter(d => d.region === region) : _distributors;
}

// ── SKU Margins ──────────────────────────────────────────────────────────────
const _skuMargins: SKUMargin[] = [
  "Madrugada Flour 50kg","Águia Flour 25kg","Stallion Flour 50kg",
  "Patriota Rice 25kg","Uncle Sam Rice 5kg","Sugar 50kg","Beans 25kg","Oil 5L",
].flatMap(sku => REGIONS.slice(0,4).map(region => {
  const rev = rnd(80000,500000), costPct = rndF(0.79,0.96);
  return {
    sku, brand: BRANDS[rnd(0,4)], category: "FMCG", region,
    channel: CHANNELS[rnd(0,3)], salesperson: SALESPERSONS[rnd(0,5)],
    revenueAOA: rev, costAOA: Math.round(rev * costPct),
    grossMargin: parseFloat(((1 - costPct)*100).toFixed(1)), units: rnd(50,2000),
  };
}));

/** GET /api/margins?region=Luanda */
export async function fetchSKUMargins(region?: string | null): Promise<SKUMargin[]> {
  // TODO: return fetch(`/api/margins${region ? `?region=${region}` : ""}`).then(r => r.json());
  return region ? _skuMargins.filter(d => d.region === region) : _skuMargins;
}

// ── Landed Cost ──────────────────────────────────────────────────────────────
export function calcLandedCost(p: LandedCostParams): LandedCostResult {
  const cifAOA    = (p.baseCostUSD + p.freightUSD) * p.fxRate;
  const dutyAOA   = cifAOA * (p.customsDuty / 100);
  const landedCostAOA = Math.round(cifAOA + dutyAOA + p.otherCostsAOA);
  const marginPct = parseFloat(((1 - landedCostAOA / p.sellingPriceAOA) * 100).toFixed(2));
  return { ...p, cifAOA: Math.round(cifAOA), dutyAOA: Math.round(dutyAOA), landedCostAOA, marginPct };
}

export function defaultLandedCostParams(): LandedCostParams {
  return { skuName:"Madrugada Flour 50kg", baseCostUSD:18.5, freightUSD:2.8,
    customsDuty:10, fxRate:870, otherCostsAOA:500, sellingPriceAOA:24500 };
}

// ── News ─────────────────────────────────────────────────────────────────────
const _news: NewsItem[] = [
  {id:"n1",headline:"BNA holds interest rate at 19.5% — commercial credit impact expected",source:"Jornal de Angola",date:"2026-05-22",category:"macro",sentiment:"neutral",province:"Luanda"},
  {id:"n2",headline:"Rice prices up 8% in Luanda following shortage in informal market",source:"Expansão",date:"2026-05-21",category:"commodity",sentiment:"negative",province:"Luanda"},
  {id:"n3",headline:"Sodosa expands distribution network to Malanje and Bié",source:"Mercado",date:"2026-05-20",category:"competitor",sentiment:"negative"},
  {id:"n4",headline:"Government announces temporary wheat flour subsidy — AOA 2/kg",source:"MINFIN",date:"2026-05-20",category:"regulatory",sentiment:"positive"},
  {id:"n5",headline:"Kwanza stabilises vs dollar: USD/AOA closed at 878.4",source:"BNA",date:"2026-05-19",category:"macro",sentiment:"neutral"},
  {id:"n6",headline:"Maize harvest in Huambo exceeds forecast by 12% — downward price pressure",source:"MINAGRIF",date:"2026-05-18",category:"commodity",sentiment:"positive",province:"Huambo"},
  {id:"n7",headline:"Noble Group announces entry into packaged flour segment",source:"Expansão",date:"2026-05-17",category:"competitor",sentiment:"negative"},
  {id:"n8",headline:"Kero and Candando negotiate exclusive discount with sugar suppliers",source:"Mercado",date:"2026-05-16",category:"competitor",sentiment:"negative",province:"Luanda"},
];

/** GET /api/news?province=Luanda */
export async function fetchNews(province?: string | null): Promise<NewsItem[]> {
  // TODO: return fetch(`/api/news${province ? `?province=${province}` : ""}`).then(r => r.json());
  return province ? _news.filter(n => !n.province || n.province === province) : _news;
}

// ── FX Rates ─────────────────────────────────────────────────────────────────
/** GET /api/fx  — wire to BNA or forex API */
export async function fetchFXRates(): Promise<FXRate[]> {
  // TODO: return fetch("/api/fx").then(r => r.json());
  return [
    {pair:"USD/AOA", rate:878.4, change:+0.3},
    {pair:"EUR/AOA", rate:953.2, change:-0.8},
    {pair:"CNY/AOA", rate:121.3, change:+0.1},
    {pair:"GBP/AOA", rate:1112.7,change:+1.2},
    {pair:"BRL/AOA", rate:159.6, change:-0.4},
  ];
}

// ── Province Heat Map ─────────────────────────────────────────────────────────
/** GET /api/coverage */
export async function fetchProvinceHeat(): Promise<ProvinceHeat[]> {
  // TODO: return fetch("/api/coverage").then(r => r.json());
  return PROVINCE_MAP_COORDS.map(p => ({ ...p, value: rnd(10,100) }));
}
