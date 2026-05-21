import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { PriceHistoryPoint } from '../services/mock-data';

interface Props {
  commodity: string;
  data: PriceHistoryPoint[];
}

export const CommodityChart: React.FC<Props> = ({ commodity, data }) => {
  if (data.length === 0) return null;
  const current = data[data.length - 1].price;
  const prev = data[0].price;
  const changePercent = prev ? ((current - prev) / prev) * 100 : 0;
  const high = Math.max(...data.map(d => d.price));
  const low = Math.min(...data.map(d => d.price));
  const volume = Math.floor(Math.random() * 1000);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-medium">{commodity}</h3>
      <div className="text-2xl font-bold mt-1">{current.toLocaleString()} AOA/kg</div>
      <span className={`text-sm font-medium ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {changePercent >= 0 ? '▲' : '▼'} {changePercent.toFixed(2)}%
      </span>

      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.map(d => ({ ...d, price: d.price }))}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke={changePercent >= 0 ? '#16a34a' : '#dc2626'}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
        <span>Máx: {high.toLocaleString()}</span>
        <span>Mín: {low.toLocaleString()}</span>
        <span>Volume: {volume}</span>
      </div>
    </div>
  );
};
