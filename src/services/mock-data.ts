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

const provinces = [
  'Luanda', 'Benguela', 'Huíla', 'Cabinda', 'Cuanza Norte',
  'Cuanza Sul', 'Malanje', 'Lunda Norte', 'Lunda Sul',
  'Moxico', 'Namibe', 'Uíge', 'Zaire', 'Bié',
  'Cunene', 'Huambo', 'Cuando Cubango', 'Bengo'
];

const commodities = ['Arroz', 'Milho', 'Feijão', 'Óleo', 'Açúcar', 'Farinha'];

const randomPrice = (commodity: string): number => {
  const ranges: Record<string, [number, number]> = {
    Arroz: [400, 800],
    Milho: [200, 500],
    Feijão: [600, 1200],
    Óleo: [1000, 2000],
    Açúcar: [500, 1000],
    Farinha: [300, 700]
  };
  const [min, max] = ranges[commodity] || [100, 500];
  return Math.floor(Math.random() * (max - min + 1) + min);
};

let currentPrices: CommodityPrice[] = [];
provinces.forEach(province => {
  commodities.forEach(commodity => {
    currentPrices.push({
      province,
      commodity,
      price: randomPrice(commodity),
      currency: 'AOA',
      unit: 'kg',
      lastUpdated: new Date().toISOString()
    });
  });
});

export const getProvinces = () => provinces;
export const getCommodities = () => commodities;
export const getCurrentPrices = (): CommodityPrice[] => currentPrices;
export const getMarketShare = (): { province: string; share: number; estimated: boolean } => ({
  province: 'Luanda',
  share: 34,
  estimated: true
});

export const getPriceHistory = (commodity: string, days = 30): PriceHistoryPoint[] => {
  const base = currentPrices.find(p => p.commodity === commodity)?.price || 100;
  let price = base * 0.8 + Math.random() * (base * 0.4);
  const points: PriceHistoryPoint[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price += (Math.random() - 0.5) * (base * 0.05);
    points.push({ date: date.toISOString().split('T')[0], price: Math.round(price) });
  }
  return points;
};
