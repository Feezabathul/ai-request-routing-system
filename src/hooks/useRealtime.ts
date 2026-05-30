import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Handlers for realtime events.
 * Keys are Supabase event names (e.g., 'INSERT', 'UPDATE', 'DELETE')
 * or custom identifiers. The payload type is the raw Supabase payload.
 */
export type RealtimeEventHandlers = {
  [event: string]: (payload: RealtimePostgresChangesPayload<Record<string, any>>) => void;
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
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);
  const handlersRef = useRef<RealtimeEventHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    // Ensure the Supabase client is ready.
    if (!supabase) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Realtime subscription disabled because Supabase is not configured.');
      }
      return;
    }

    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Register generic listener for all Postgres change events.
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
        const { eventType } = payload;
        const currentHandlers = handlersRef.current;
        // Prefer a specific handler, otherwise fall back to a generic '*' handler.
        if (currentHandlers[eventType]) {
          currentHandlers[eventType](payload);
        } else if (currentHandlers['*']) {
          currentHandlers['*'](payload);
        }
      }
    );

    // Subscribe to the channel.
    channel.subscribe((status) => {
      if (status === ('SUBSCRIPTION_ERROR' as unknown as typeof status)) {
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
  }, [channelName]);

  // Return a manual unsubscribe function for callers that need explicit control.
  return () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };
}
