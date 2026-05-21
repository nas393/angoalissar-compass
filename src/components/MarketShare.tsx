import React from 'react';

interface Props {
  share: number;
  province: string;
}

export const MarketShare: React.FC<Props> = ({ share, province }) => (
  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-blue-800 dark:text-blue-200 mb-4">
    <strong>{share}% {province}</strong> · <small>est.</small>
  </div>
);
