'use client';

import type { DashboardStatsData } from '@/hooks/useDashboardStats';

interface DashboardStatsProps {
  stats?: DashboardStatsData | null;
  loading?: boolean;
  className?: string;
}

// Stat cards and agent workload have been removed.
export const DashboardStats = (_props: DashboardStatsProps) => null;
