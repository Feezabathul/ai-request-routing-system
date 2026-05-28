import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow',
        className,
      )}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-indigo-100 rounded text-indigo-600">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {trend && trendValue && (
        <p className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? '▲' : '▼'} {trendValue}
        </p>
      )}
    </div>
  );
};
