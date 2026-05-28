import React from 'react';
import { StatCard, StatCardProps } from '@/components/dashboard/StatCard';
import { twMerge } from 'tailwind-merge';

interface StatGridProps {
  stats: StatCardProps[];
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({ stats, className }) => {
  return (
    <section className={twMerge('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4', className)}>
      {stats.map((s, idx) => (
        <StatCard key={idx} {...s} />
      ))}
    </section>
  );
};
