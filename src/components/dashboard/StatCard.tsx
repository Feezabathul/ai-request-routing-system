import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  description,
  loading,
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
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 rounded text-indigo-600 bg-indigo-100">
          {loading ? <span className="block h-5 w-5 rounded bg-gray-200 animate-pulse" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-semibold text-gray-900">
            {loading ? <span className="inline-block h-10 w-24 rounded bg-gray-200 animate-pulse" /> : value}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 min-h-[1.25rem]">
        {loading ? <span className="inline-block h-4 w-40 rounded bg-gray-200 animate-pulse" /> : description}
      </p>
      {trend && trendValue && !loading && (
        <p className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? '▲' : '▼'} {trendValue}
        </p>
      )}
    </div>
  );
};
