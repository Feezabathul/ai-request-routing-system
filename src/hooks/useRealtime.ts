import { useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Handlers for realtime events.
 * Keys are Supabase event names (e.g., 'INSERT', 'UPDATE', 'DELETE')
 * or custom identifiers. The payload type is the raw Supabase payload.
 */
export type RealtimeEventHandlers = {
  [event: string]: (payload: RealtimePostgresChangesPayload<any>) => void;
};

/**
 * Subscribe to a Supabase Realtime channel.
 *
 * @param channelName The name of the channel to listen on (e.g., 'request_updates').
 * @param handlers    Mapping of Supabase event types to callbacks.
 * @returns A function that can be used to manually unsubscribe.
 */
export function useRealtime(
  channelName: string,
  handlers: RealtimeEventHandlers = {}
): () => void {
  // Keep a reference to the channel so we can unsubscribe on cleanup.
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Ensure the Supabase client is ready.
    if (!supabaseBrowser) {
      console.error('Supabase client is not initialized.');
      return;
    }

    const channel = supabaseBrowser.channel(channelName);
    channelRef.current = channel;

    // Register generic listener for all Postgres change events.
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload: RealtimePostgresChangesPayload<any>) => {
        const { eventType } = payload;
        // Prefer a specific handler, otherwise fall back to a generic '*' handler.
        if (handlers[eventType]) {
          handlers[eventType](payload);
        } else if (handlers['*']) {
          handlers['*'](payload);
        }
      }
    );

    // Subscribe to the channel.
    channel.subscribe((status) => {
      if (status === 'SUBSCRIPTION_ERROR') {
        console.error(`Realtime subscription error on channel ${channelName}`);
      }
    });

    // Cleanup on unmount.
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
    // Re‑subscribe only when the channel name changes.
  }, [channelName, JSON.stringify(handlers)]);

  // Return a manual unsubscribe function for callers that need explicit control.
  return () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };
}
