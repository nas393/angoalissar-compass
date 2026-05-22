// ─────────────────────────────────────────────────────────────────────────────
// ANGOALISSAR COMPASS  –  Mock Data Service
// Replace with real API calls when backend is ready.
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

export interface DistributorScorecard {
  id: string;
  name: string;
  region: string;
  salesAchievement: number; // %
  profitability: number;    // %
  collectionEfficiency: number; // %
  coverage: number;         // %
  growth: number;           // %
  score: number;            // composite 0-100
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
  grossMargin: number; // %
  units: number;
}

export interface LandedCostScenario {
  skuId: string;
  skuName: string;
  baseCostUSD: number;
  freightUSD: number;
  customsDuty: number; // %
  fxRate: number; // USD→AOA
  otherCosts: number;
  landedCostAOA: number;
  sellingPriceAOA: number;
  marginPct: number;
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  date: string;
  category: 'macro' | 'commodity' | 'competitor' | 'regulatory';
  sentiment: 'positive' | 'neutral' | 'negative';
  province?: string;
}

export interface SavedBriefing {
  id: string;
  title: string;
  content: string;
  type: 'briefing' | 'devil';
  province: string | null;
  tone: string;
  horizon: string;
  generatedAt: string;
  exportable: boolean;
}

// ──────────────────────────────────────────────────────────────
// STATIC DATA
// ──────────────────────────────────────────────────────────────

export const PROVINCES = [
  'Luanda', 'Benguela', 'Huíla', 'Cabinda', 'Cuanza Norte',
  'Cuanza Sul', 'Malanje', 'Lunda Norte', 'Lunda Sul',
  'Moxico', 'Namibe', 'Uíge', 'Zaire', 'Bié',
  'Cunene', 'Huambo', 'Cuando Cubango', 'Bengo'
];

export const COMMODITIES = ['Arroz', 'Milho', 'Feijão', 'Óleo', 'Açúcar', 'Farinha'];

const REGIONS = ['Luanda', 'Benguela', 'Huambo', 'Lobito', 'Lubango', 'Cabinda', 'Namibe', 'Uíge'];
const BRANDS = ['Madrugada', 'Águia', 'Stallion', 'Patriota', 'Uncle Sam'];
const CATEGORIES = ['Farinha de Trigo', 'Arroz', 'Açúcar', 'Óleo', 'Feijão', 'Milho'];
const CHANNELS = ['Wholesale', 'Retail', 'HoReCa', 'Modern Trade'];
const SALESPERSONS = ['António', 'Maria', 'Carlos', 'Fernanda', 'João', 'Beatriz'];

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const rndF = (min: number, max: number, dp = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dp));

// ──────────────────────────────────────────────────────────────
// COMMODITY PRICES
// ──────────────────────────────────────────────────────────────

const PRICE_RANGES: Record<string, [number, number]> = {
  Arroz: [400, 800], Milho: [200, 500], Feijão: [600, 1200],
  Óleo: [1000, 2000], Açúcar: [500, 1000], Farinha: [300, 700]
};

let _currentPrices: CommodityPrice[] = [];
PROVINCES.forEach(province => {
  COMMODITIES.forEach(commodity => {
    const [min, max] = PRICE_RANGES[commodity];
    _currentPrices.push({
      province, commodity,
      price: rnd(min, max),
      currency: 'AOA', unit: 'kg',
      lastUpdated: new Date().toISOString()
    });
  });
});

export const getProvinces = () => PROVINCES;
export const getCommodities = () => COMMODITIES;
export const getCurrentPrices = (): CommodityPrice[] => _currentPrices;

export const getMarketShare = (province?: string | null) => ({
  province: province || 'Luanda',
  share: province ? rnd(8, 42) : 34,
  estimated: true
});

export const getPriceHistory = (commodity: string, days = 30): PriceHistoryPoint[] => {
  const base = _currentPrices.find(p => p.commodity === commodity)?.price || 500;
  let price = base * 0.8 + Math.random() * (base * 0.4);
  return Array.from({ length: days + 1 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    price += (Math.random() - 0.5) * (base * 0.05);
    return { date: date.toISOString().split('T')[0], price: Math.round(price) };
  });
};

// ──────────────────────────────────────────────────────────────
// DISTRIBUTOR SCORECARDS
// ──────────────────────────────────────────────────────────────

const DISTRIBUTOR_NAMES = [
  'Distribuidora Norte Lda', 'Sul Comércio', 'Benguela Trade', 'Luanda Wholesale',
  'Cabinda Supply', 'Huambo Distribuidora', 'Lobito Commerce', 'Namibe Traders'
];

let _distributors: DistributorScorecard[] = DISTRIBUTOR_NAMES.map((name, i) => {
  const sales = rnd(65, 115);
  const profit = rndF(4, 18);
  const collect = rnd(70, 98);
  const coverage = rnd(55, 95);
  const growth = rndF(-5, 22);
  const score = Math.round((
    Math.min(sales, 100) * 0.3 + profit * 2 + collect * 0.25 +
    coverage * 0.2 + Math.max(growth + 5, 0) * 1.5
  ) / 1.5);
  return { id: `dist_${i}`, name, region: REGIONS[i % REGIONS.length],
    salesAchievement: sales, profitability: profit, collectionEfficiency: collect,
    coverage, growth, score: Math.min(score, 100), rank: 0 };
});
_distributors.sort((a, b) => b.score - a.score);
_distributors.forEach((d, i) => { d.rank = i + 1; });

export const getDistributors = (): DistributorScorecard[] => _distributors;

// ──────────────────────────────────────────────────────────────
// SKU MARGINS  (profitability engine)
// ──────────────────────────────────────────────────────────────

const SKU_NAMES = [
  'Farinha Madrugada 50kg', 'Farinha Águia 25kg', 'Farinha Stallion 50kg',
  'Arroz Patriota 25kg', 'Arroz Uncle Sam 5kg', 'Açúcar Refinado 50kg',
  'Feijão Frade 25kg', 'Óleo Girassol 5L', 'Milho Moído 50kg'
];

export const getSKUMargins = (): SKUMargin[] =>
  SKU_NAMES.flatMap(sku =>
    REGIONS.slice(0, 4).map(region => {
      const rev = rnd(80000, 500000);
      const costPct = rndF(0.78, 0.96);
      const cost = Math.round(rev * costPct);
      const gm = parseFloat(((1 - costPct) * 100).toFixed(1));
      return {
        sku, brand: BRANDS[rnd(0, BRANDS.length - 1)],
        category: CATEGORIES[rnd(0, CATEGORIES.length - 1)],
        region, channel: CHANNELS[rnd(0, CHANNELS.length - 1)],
        salesperson: SALESPERSONS[rnd(0, SALESPERSONS.length - 1)],
        revenueAOA: rev, costAOA: cost, grossMargin: gm,
        units: rnd(50, 2000)
      };
    })
  );

// ──────────────────────────────────────────────────────────────
// LANDED COST SIMULATOR
// ──────────────────────────────────────────────────────────────

export const getDefaultLandedCostScenario = (): LandedCostScenario => ({
  skuId: 'FAR0028C',
  skuName: 'Farinha Madrugada 50kg',
  baseCostUSD: 18.5,
  freightUSD: 2.8,
  customsDuty: 10,
  fxRate: 870,
  otherCosts: 500,
  landedCostAOA: 0,
  sellingPriceAOA: 24500,
  marginPct: 0
});

export const calcLandedCost = (s: Omit<LandedCostScenario, 'landedCostAOA' | 'marginPct'>): LandedCostScenario => {
  const cif = (s.baseCostUSD + s.freightUSD) * s.fxRate;
  const duty = cif * (s.customsDuty / 100);
  const landedCostAOA = Math.round(cif + duty + s.otherCosts);
  const marginPct = parseFloat(((1 - landedCostAOA / s.sellingPriceAOA) * 100).toFixed(2));
  return { ...s, landedCostAOA, marginPct };
};

// ──────────────────────────────────────────────────────────────
// FORECASTING
// ──────────────────────────────────────────────────────────────

export const getForecast = (commodity: string): ForecastPoint[] => {
  const base = _currentPrices.find(p => p.commodity === commodity)?.price || 500;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  return months.map((month, i) => {
    const isHistory = i < currentMonth;
    const trend = 1 + (i - 6) * 0.005;
    const forecast = Math.round(base * trend + (Math.random() - 0.5) * base * 0.05);
    return {
      month,
      actual: isHistory ? Math.round(base * (1 + (i - 6) * 0.004) + (Math.random() - 0.5) * base * 0.04) : undefined,
      forecast,
      lowerBound: Math.round(forecast * 0.93),
      upperBound: Math.round(forecast * 1.07)
    };
  });
};

// ──────────────────────────────────────────────────────────────
// NEWS FEED
// ──────────────────────────────────────────────────────────────

export const getNewsFeed = (province?: string | null): NewsItem[] => {
  const items: NewsItem[] = [
    { id: 'n1', headline: 'BNA mantém taxa de juro em 19.5% – impacto no crédito comercial', source: 'Jornal de Angola', date: '2026-05-22', category: 'macro', sentiment: 'neutral', province: 'Luanda' },
    { id: 'n2', headline: 'Preço do arroz sobe 8% em Luanda após escassez no mercado informal', source: 'Expansão', date: '2026-05-21', category: 'commodity', sentiment: 'negative', province: 'Luanda' },
    { id: 'n3', headline: 'Sodosa expande rede de distribuição para Malanje e Bié', source: 'Mercado', date: '2026-05-20', category: 'competitor', sentiment: 'negative', province: undefined },
    { id: 'n4', headline: 'Governo anuncia subsídio temporário à farinha de trigo – AOA 2/kg', source: 'MINFIN', date: '2026-05-20', category: 'regulatory', sentiment: 'positive', province: undefined },
    { id: 'n5', headline: 'Kwanza estabiliza face ao dólar: USD/AOA fechou a 878.4', source: 'BNA', date: '2026-05-19', category: 'macro', sentiment: 'neutral', province: undefined },
    { id: 'n6', headline: 'Campanha maíz em Huambo supera previsão em 12% – pressão baixista nos preços', source: 'MINAGRIF', date: '2026-05-18', category: 'commodity', sentiment: 'positive', province: 'Huambo' },
    { id: 'n7', headline: 'Noble Group anuncia entrada no segmento de farinha embalada', source: 'Expansão', date: '2026-05-17', category: 'competitor', sentiment: 'negative', province: undefined },
    { id: 'n8', headline: 'Kero e Candando negoceiam desconto exclusivo com fornecedores de açúcar', source: 'Mercado', date: '2026-05-16', category: 'competitor', sentiment: 'negative', province: 'Luanda' },
  ];
  if (!province) return items;
  return items.filter(n => !n.province || n.province === province);
};

// ──────────────────────────────────────────────────────────────
// KPI SUMMARY
// ──────────────────────────────────────────────────────────────

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

export const getKPISummary = (): KPISummary => ({
  totalRevenue: 2_840_000_000,
  totalVolumeMT: 21868,
  grossMarginPct: 6.4,
  activeCustomers: 312,
  collectionDays: 38,
  topRegion: 'Luanda',
  revenueGrowthPct: 4.2,
  marginVsTargetPct: -2.1
});
