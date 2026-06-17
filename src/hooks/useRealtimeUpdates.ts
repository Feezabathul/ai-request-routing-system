'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeUpdates(callback: () => void) {
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'CustomerRequest' },
        (payload) => {
          console.log('CustomerRequest changed:', payload);
          callback();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'User' },
        (payload) => {
          console.log('User changed:', payload);
          callback();
        }
      )
      .subscribe((status) => {
        console.log('Supabase realtime status:', status);
      });

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [callback]);
}
