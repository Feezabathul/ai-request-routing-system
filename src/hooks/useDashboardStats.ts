'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AgentWorkload {
  agentId: string;
  name: string;
  activeAssignedRequests: number;
}

export interface DashboardStatsData {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  agentWorkload: AgentWorkload[];
}

const ADMIN_NOTIFICATIONS_CHANNEL = 'admin_notifications';
const ADMIN_NOTIFICATIONS_EVENT = 'ADMIN_NOTIFICATIONS_UPDATED';

async function fetchDashboardStats(): Promise<DashboardStatsData> {
  const response = await fetch('/api/dashboard/stats', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load dashboard statistics.');
  }
  const json = await response.json();
  if (!json?.success) {
    throw new Error(json?.error?.message ?? 'Invalid dashboard statistics response.');
  }
  return json.data as DashboardStatsData;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await refresh();
    };

    void initialize();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'requests') {
        void refresh();
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    if (!supabase) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Dashboard stats realtime refresh disabled because Supabase is not configured.');
      }
    } else {
      const channel = supabase.channel(ADMIN_NOTIFICATIONS_CHANNEL);
      channelRef.current = channel;

      channel.on('broadcast', { event: ADMIN_NOTIFICATIONS_EVENT }, () => {
        void refresh();
      });

      channel.subscribe();
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [refresh]);

  return { stats, loading, error, refresh };
}
