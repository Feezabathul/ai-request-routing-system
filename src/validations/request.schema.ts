import { z } from "zod";

export const RequestPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const RequestStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"]);
export const AIProcessingStatusEnum = z.enum(["PENDING", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"]);

export const createRequestSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().min(1, "Description is required").max(10_000, "Description is too long"),

  customerName: z.string().trim().min(1, "Customer name is required").max(200),
  customerEmail: z.string().email("Please provide a valid customer email").transform((v) => v.toLowerCase().trim()),

  createdById: z.string().uuid("createdById must be a UUID"),

  priority: RequestPriorityEnum.optional(),
  status: RequestStatusEnum.optional(),

  // For safe retries from clients; currently stored in RequestEvent metadata placeholder.
  idempotencyKey: z.string().trim().min(1).max(200).optional(),
});

export const updateRequestStatusSchema = z.object({
  status: RequestStatusEnum,
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
  status: RequestStatusEnum.optional(),
  priority: RequestPriorityEnum.optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).max(10_000).optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type AssignAgentInput = z.infer<typeof assignAgentSchema>;
export type RequestIdInput = z.infer<typeof requestIdSchema>;
export type ListRequestsInput = z.infer<typeof listRequestsSchema>;

export const DEFAULT_AI_PROCESSING_STATUS = "PENDING";
