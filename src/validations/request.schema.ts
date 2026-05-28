import { z } from "zod";

import { AIProcessingStatus, RequestPriority, RequestStatus } from "@/generated/prisma";

export const createRequestSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().min(1, "Description is required").max(10_000, "Description is too long"),

  customerName: z.string().trim().min(1, "Customer name is required").max(200),
  customerEmail: z.email("Please provide a valid customer email").transform((v) => v.toLowerCase().trim()),

  createdById: z.string().uuid("createdById must be a UUID"),

  priority: z.nativeEnum(RequestPriority).optional(),
  status: z.nativeEnum(RequestStatus).optional(),

  // For safe retries from clients; currently stored in RequestEvent metadata placeholder.
  idempotencyKey: z.string().trim().min(1).max(200).optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  actorId: z.string().uuid("actorId must be a UUID").optional(),
});

export const assignAgentSchema = z.object({
  agentId: z.string().uuid("agentId must be a UUID"),
  actorId: z.string().uuid("actorId must be a UUID").optional(),
});

export const requestIdSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});

export const listRequestsSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  priority: z.nativeEnum(RequestPriority).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).max(10_000).optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type AssignAgentInput = z.infer<typeof assignAgentSchema>;
export type RequestIdInput = z.infer<typeof requestIdSchema>;
export type ListRequestsInput = z.infer<typeof listRequestsSchema>;

export const DEFAULT_AI_PROCESSING_STATUS = AIProcessingStatus.PENDING;

