import React, { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { MarketShare } from '../components/MarketShare';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { CsvExportModal } from '../components/CsvExportModal';
import { CommodityChart } from '../components/CommodityChart';
import { ProvinceMap } from '../components/ProvinceMap';
import {
  getCurrentPrices,
  getMarketShare,
  getPriceHistory,
  getCommodities
} from '../services/mock-data';

export default function Dashboard() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState('Arroz');
  const [csvOpen, setCsvOpen] = useState(false);

  const allPrices = useMemo(() => getCurrentPrices(), []);
  const marketShare = useMemo(() => getMarketShare(), []);
  const commodities = useMemo(() => getCommodities(), []);
  const priceHistory = useMemo(
    () => getPriceHistory(selectedCommodity, 30),
    [selectedCommodity]
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Painel de Mercado</h1>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setCsvOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            📥 Exportar CSV
          </button>
          <DarkModeToggle />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <ProvinceMap onProvinceClick={setSelectedProvince} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <MarketShare share={marketShare.share} province={marketShare.province} />

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h2 className="font-medium mb-1">
              Província: {selectedProvince || 'Clique no mapa'}
            </h2>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Produto</label>
              <select
                value={selectedCommodity}
                onChange={e => setSelectedCommodity(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
              >
                {commodities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <CommodityChart commodity={selectedCommodity} data={priceHistory} />
        </div>
      </div>

      <CsvExportModal
        data={allPrices}
        open={csvOpen}
        onOpenChange={setCsvOpen}
      />
    </div>
  );
}
