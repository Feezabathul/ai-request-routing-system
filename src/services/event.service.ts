// src/services/event.service.ts

import { prisma } from "../lib/prisma";
import { RequestEventType } from "@/generated/prisma/client";

/**
 * Generic payload type for event metadata. Allows any JSON‑serialisable data.
 */
export type EventMetadata = Record<string, unknown>;

/**
 * Helper that creates a RequestEvent record.
 * Centralises error handling and type safety for all event‑logging helpers.
 */
async function createEvent(params: {
  requestId: string;
  actorId?: string | null;
  type: RequestEventType;
  description?: string;
  metadata?: EventMetadata;
}): Promise<void> {
  const { requestId, actorId, type, description, metadata } = params;
  try {
    await prisma.requestEvent.create({
      data: {
        requestId,
        actorId: actorId ?? undefined,
        eventType: type,
        description: description ?? null,
        metadata: metadata ? (JSON.stringify(metadata) as unknown as object) : undefined,
      },
    });
  } catch (err) {
    console.error(`Failed to log event ${type} for request ${requestId}:`, err);
    // In production you might report to an external monitoring service.
    throw err;
  }
}

/** Log that a new request has been created. */
export async function logRequestCreatedEvent(params: {
  requestId: string;
  actorId?: string;
  metadata?: EventMetadata;
}): Promise<void> {
  await createEvent({
    requestId: params.requestId,
    actorId: params.actorId,
    type: RequestEventType.REQUEST_CREATED,
    description: "Customer request created",
    metadata: params.metadata,
  });
}

/** Log that an AI classification has been completed. */
export async function logAIClassifiedEvent(params: {
  requestId: string;
  actorId?: string; // could be system user
  classification: {
    predictedCategory: string;
    confidenceScore: number;
    suggestedPriority: string;
  };
  metadata?: EventMetadata;
}): Promise<void> {
  const { classification, ...rest } = params;
  await createEvent({
    requestId: rest.requestId,
    actorId: rest.actorId,
    type: RequestEventType.AI_CLASSIFIED,
    description: "AI classification completed",
    metadata: {
      ...rest.metadata,
      classification,
    },
  });
}

/** Log that the request status has changed. */
export async function logStatusChangedEvent(params: {
  requestId: string;
  actorId?: string;
  from: string;
  to: string;
  metadata?: EventMetadata;
}): Promise<void> {
  await createEvent({
    requestId: params.requestId,
    actorId: params.actorId,
    type: RequestEventType.STATUS_CHANGED,
    description: `Status changed from ${params.from} to ${params.to}`,
    metadata: { ...params.metadata, from: params.from, to: params.to },
  });
}

/** Log that a note has been added to a request. */
export async function logNoteAddedEvent(params: {
  requestId: string;
  actorId?: string;
  noteId: string;
  metadata?: EventMetadata;
}): Promise<void> {
  await createEvent({
    requestId: params.requestId,
    actorId: params.actorId,
    type: RequestEventType.NOTE_ADDED,
    description: "Internal note added",
    metadata: { ...params.metadata, noteId: params.noteId },
  });
}

/** Log that the assignment of a request has changed. */
export async function logAssignmentChangedEvent(params: {
  requestId: string;
  actorId?: string;
  fromUserId?: string | null;
  toUserId?: string | null;
  metadata?: EventMetadata;
}): Promise<void> {
  await createEvent({
    requestId: params.requestId,
    actorId: params.actorId,
    type: RequestEventType.ASSIGNED,
    description: `Assignment changed`,
    metadata: {
      ...params.metadata,
      fromUserId: params.fromUserId ?? null,
      toUserId: params.toUserId ?? null,
    },
  });
}

/** Log that the priority of a request has changed. */
export async function logPriorityChangedEvent(params: {
  requestId: string;
  actorId?: string;
  from: string;
  to: string;
  metadata?: EventMetadata;
}): Promise<void> {
  await createEvent({
    requestId: params.requestId,
    actorId: params.actorId,
    type: RequestEventType.PRIORITY_CHANGED,
    description: `Priority changed from ${params.from} to ${params.to}`,
    metadata: { ...params.metadata, from: params.from, to: params.to },
  });
}
