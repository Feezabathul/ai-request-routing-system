// src/services/realtime.service.ts

import { supabaseService } from "@/lib/supabase";

/**
 * Types of realtime events the server can broadcast.
 */
export enum RealtimeEventType {
  REQUEST_UPDATED = "REQUEST_UPDATED",
  AI_COMPLETED = "AI_COMPLETED",
  NOTE_ADDED = "NOTE_ADDED",
  TIMELINE_EVENT = "TIMELINE_EVENT",
}

/**
 * Shape of payload sent to all realtime listeners.
 */
export interface RealtimePayload {
  requestId: string;
  eventType: RealtimeEventType;
  timestamp: string; // ISO string
  metadata?: Record<string, unknown>;
}

/**
 * Internal helper that sends a payload on a channel dedicated to a request.
 * Using a per‑request channel keeps the broadcast lightweight and scoped.
 */
async function broadcast(payload: RealtimePayload): Promise<void> {
  const channelName = `request_${payload.requestId}`;
  try {
    const channel = supabaseService.channel(channelName);
    // Ensure the channel is subscribed before sending – Supabase will create it lazily.
    await channel.subscribe();
    // The payload follows Supabase Realtime's "broadcast" shape.
    await channel.send({
      type: "broadcast",
      event: payload.eventType,
      payload,
    });
    // Optionally you could unsubscribe after send, but keeping it open allows multiple sends.
  } catch (err) {
    console.error(`Failed to broadcast ${payload.eventType} for request ${payload.requestId}:`, err);
    // Swallow error to avoid crashing the worker – callers can still handle if needed.
  }
}

/** Broadcast that a request was updated (status, priority, etc.). */
export async function broadcastRequestUpdated(requestId: string, metadata?: Record<string, unknown>) {
  await broadcast({
    requestId,
    eventType: RealtimeEventType.REQUEST_UPDATED,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

/** Broadcast that AI classification has completed for a request. */
export async function broadcastAICompleted(requestId: string, metadata?: Record<string, unknown>) {
  await broadcast({
    requestId,
    eventType: RealtimeEventType.AI_COMPLETED,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

/** Broadcast that a new internal note was added. */
export async function broadcastNoteAdded(requestId: string, noteId: string, metadata?: Record<string, unknown>) {
  await broadcast({
    requestId,
    eventType: RealtimeEventType.NOTE_ADDED,
    timestamp: new Date().toISOString(),
    metadata: { ...metadata, noteId },
  });
}

/** Broadcast a generic timeline event (e.g., status change, assignment). */
export async function broadcastTimelineEvent(
  requestId: string,
  eventName: string,
  metadata?: Record<string, unknown>
) {
  await broadcast({
    requestId,
    eventType: RealtimeEventType.TIMELINE_EVENT,
    timestamp: new Date().toISOString(),
    metadata: { ...metadata, eventName },
  });
}
