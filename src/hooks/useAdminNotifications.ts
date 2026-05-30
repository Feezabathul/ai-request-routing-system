'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AdminNotificationsResponse } from '@/types/admin-notification';
import {
  getLocalStorageNotifications,
  mergeAdminNotifications,
} from '@/lib/admin-notifications-client';

const ADMIN_NOTIFICATIONS_CHANNEL = 'admin_notifications';
const ADMIN_NOTIFICATIONS_EVENT = 'ADMIN_NOTIFICATIONS_UPDATED';

async function fetchAdminNotifications(): Promise<AdminNotificationsResponse | null> {
  try {
    const response = await fetch('/api/admin/notifications', { cache: 'no-store' });
    if (!response.ok) return null;
    const json = await response.json();
    if (!json.success) return null;
    return json.data as AdminNotificationsResponse;
  } catch {
    return null;
  }
}

export function useAdminNotifications() {
  const [data, setData] = useState<AdminNotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [apiData, localNotifications] = await Promise.all([
      fetchAdminNotifications(),
      Promise.resolve(getLocalStorageNotifications()),
    ]);

    const merged = mergeAdminNotifications(apiData, localNotifications);
    setData(merged);

    if (!apiData && localNotifications.length === 0) {
      setError(null);
    } else if (!apiData && localNotifications.length > 0) {
      setError(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'requests') void refresh();
    };

    const onCustom = () => void refresh();

    window.addEventListener('storage', onStorage);
    window.addEventListener('admin-notifications-updated', onCustom);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && anonKey) {
      void import('@supabase/supabase-js').then(({ createClient }) => {
        const client = createClient(url, anonKey);
        const channel = client.channel(ADMIN_NOTIFICATIONS_CHANNEL);
        channelRef.current = channel;

        channel
          .on('broadcast', { event: ADMIN_NOTIFICATIONS_EVENT }, () => {
            void refresh();
          })
          .subscribe();
      });
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('admin-notifications-updated', onCustom);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [refresh]);

  return { data, loading, error, refresh };
}
