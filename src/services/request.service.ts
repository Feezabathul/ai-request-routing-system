import {
  AIProcessingStatus,
  RequestEventType,
  RequestStatus,
  type CustomerRequest,
} from "@/generated/prisma";
import { requestRepository } from "@/repositories/request.repository";
import {
  DEFAULT_AI_PROCESSING_STATUS,
  assignAgentSchema,
  createRequestSchema,
  listRequestsSchema,
  requestIdSchema,
  updateRequestStatusSchema,
  type AssignAgentInput,
  type CreateRequestInput,
  type ListRequestsInput,
  type RequestIdInput,
  type UpdateRequestStatusInput,
} from "@/validations/request.schema";

export class RequestServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "RequestServiceError";
    this.statusCode = statusCode;
  }
}

const enqueueAIClassification = async (requestId: string) => {
  // Placeholder: integrate BullMQ here (non-blocking).
  // This function must NOT throw in a way that blocks request creation.
  void requestId;
};

export const createRequest = async (input: unknown): Promise<CustomerRequest> => {
  const parsed = createRequestSchema.parse(input) satisfies CreateRequestInput;

  const request = await requestRepository.createRequest({
    customerName: parsed.customerName,
    customerEmail: parsed.customerEmail,
    subject: parsed.title,
    message: parsed.description,
    createdById: parsed.createdById,
    status: parsed.status,
    retryCount: 0,
    aiProcessingStatus: DEFAULT_AI_PROCESSING_STATUS,
    priority: parsed.priority,
  });

  // Timeline placeholder
  await requestRepository.createRequestEvent({
    requestId: request.id,
    actorId: parsed.createdById,
    eventType: RequestEventType.REQUEST_CREATED,
    metadata: parsed.idempotencyKey ? { idempotencyKey: parsed.idempotencyKey } : undefined,
  });

  // Non-blocking AI processing kickoff
  void (async () => {
    try {
      await requestRepository.updateAIProcessingStatus(request.id, AIProcessingStatus.QUEUED);
      await requestRepository.createRequestEvent({
        requestId: request.id,
        actorId: parsed.createdById,
        eventType: RequestEventType.AI_CLASSIFICATION_QUEUED,
      });
      await enqueueAIClassification(request.id);
    } catch (err) {
      // Keep request creation successful even if AI enqueue fails.
      const currentRetry = request.retryCount ?? 0;
      const nextRetry = currentRetry + 1;
      await requestRepository.updateAIProcessingStatus(request.id, AIProcessingStatus.FAILED, nextRetry);
      await requestRepository.createRequestEvent({
        requestId: request.id,
        actorId: parsed.createdById,
        eventType: RequestEventType.AI_CLASSIFICATION_FAILED,
        description: err instanceof Error ? err.message : "AI enqueue failed",
      });
    }
  })();

  return request;
};

export const getRequestById = async (input: unknown) => {
  const parsed = requestIdSchema.parse(input) satisfies RequestIdInput;
  const request = await requestRepository.getRequestById(parsed.id);
  if (!request) throw new RequestServiceError("Request not found", 404);
  return request;
};

export const getAllRequests = async (input: unknown) => {
  const parsed = listRequestsSchema.parse(input) satisfies ListRequestsInput;
  return requestRepository.getAllRequests(parsed);
};

export const updateRequestStatus = async (requestId: string, input: unknown) => {
  const parsedId = requestIdSchema.parse({ id: requestId }) satisfies RequestIdInput;
  const parsed = updateRequestStatusSchema.parse(input) satisfies UpdateRequestStatusInput;

  const updated = await requestRepository.updateRequestStatus(parsedId.id, parsed.status);

  await requestRepository.createRequestEvent({
    requestId: parsedId.id,
    actorId: parsed.actorId,
    eventType: RequestEventType.STATUS_CHANGED,
    metadata: { status: parsed.status },
  });

  return updated;
};

export const assignAgentToRequest = async (requestId: string, input: unknown) => {
  const parsedId = requestIdSchema.parse({ id: requestId }) satisfies RequestIdInput;
  const parsed = assignAgentSchema.parse(input) satisfies AssignAgentInput;

  const updated = await requestRepository.assignAgentToRequest(parsedId.id, parsed.agentId);

  await requestRepository.createRequestEvent({
    requestId: parsedId.id,
    actorId: parsed.actorId,
    eventType: RequestEventType.ASSIGNED,
    metadata: { assignedToId: parsed.agentId },
  });

  return updated;
};

