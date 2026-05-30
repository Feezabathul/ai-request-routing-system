'use client';

import { BarChart2, Clock, RotateCw, CheckCircle } from 'lucide-react';
import { StatGrid } from '@/components/dashboard/StatGrid';
import type { StatCardProps } from '@/components/dashboard/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import type { DashboardStatsData } from '@/hooks/useDashboardStats';

interface DashboardStatsProps {
  stats?: DashboardStatsData | null;
  loading?: boolean;
  className?: string;
}

const STAT_CARDS = [
  {
    key: 'totalRequests' as const,
    label: 'Total Requests',
    description: 'All customer requests',
    icon: <BarChart2 className="h-5 w-5 text-indigo-500" />,
  },
  {
    key: 'newRequests' as const,
    label: 'New Requests',
    description: 'Waiting for assignment',
    icon: <Clock className="h-5 w-5 text-indigo-500" />,
  },
  {
    key: 'inProgressRequests' as const,
    label: 'In Progress Requests',
    description: 'Assigned to agents',
    icon: <RotateCw className="h-5 w-5 text-indigo-500" />,
  },
  {
    key: 'resolvedRequests' as const,
    label: 'Resolved Requests',
    description: 'Completed requests',
    icon: <CheckCircle className="h-5 w-5 text-indigo-500" />,
  },
];

export const DashboardStats = ({ stats: externalStats, loading: externalLoading, className }: DashboardStatsProps) => {
  const { stats: internalStats, loading: internalLoading, error: internalError } = useDashboardStats();
  const isControlled = typeof externalStats !== 'undefined' || typeof externalLoading !== 'undefined';
  const stats = isControlled ? externalStats ?? null : internalStats;
  const loading = isControlled ? externalLoading ?? false : internalLoading;
  const error = isControlled ? null : internalError;

  const cards: StatCardProps[] = STAT_CARDS.map((card) => ({
    icon: card.icon,
    label: card.label,
    description: card.description,
    loading,
    value: loading ? 0 : stats?.[card.key] ?? 0,
  }));

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <StatGrid stats={cards} className={className ?? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Agent Workload</p>
            <p className="text-sm text-gray-500">Active assigned requests per agent</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-10 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : stats?.agentWorkload?.length ? (
          <div className="space-y-3">
            {stats.agentWorkload.map((agent) => (
              <div
                key={agent.agentId}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-gray-900">{agent.name}</p>
                  <p className="text-sm text-gray-500">{agent.activeAssignedRequests} Active Requests</p>
                </div>
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                  {agent.activeAssignedRequests}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            No active assigned requests at this time.
          </div>
        )}
      </div>
    </section>
  );
};
