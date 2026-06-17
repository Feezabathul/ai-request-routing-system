import {
  AIProcessingStatus,
  RequestEventType,
  RequestStatus,
  ClassificationLabel,
  type CustomerRequest,
} from "@prisma/client";
import { requestRepository } from "@/repositories/request.repository";
import { broadcastAdminNotificationsUpdated } from "@/services/realtime.service";
import { classifyRequestWithAI } from "@/lib/ai-classification";
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

const departmentToLabel: Record<string, ClassificationLabel> = {
  'Billing': 'BILLING',
  'Technical Support': 'TECHNICAL',
  'Account Management': 'ACCOUNT',
  'General Support': 'GENERAL',
  'Feature Request': 'FEATURE_REQUEST',
};

const enqueueAIClassification = async (requestId: string) => {
  // Simulate an asynchronous job processing the AI Classification
  setTimeout(async () => {
    try {
      const request = await requestRepository.getRequestById(requestId);
      if (!request) return;

      const result = classifyRequestWithAI(request.subject, request.message || '');
      const label = departmentToLabel[result.aiCategory] || 'GENERAL';

      // Insert AI classification
      await requestRepository.createAiClassification(requestId, label, result.aiConfidence / 100);

      // Status goes to OPEN, unless it was closed/resolved already.
      if (request.status === 'WAITING_ON_CUSTOMER') { // Wait state for AI processing
         await requestRepository.updateRequestStatus(requestId, 'OPEN');
      }
      await requestRepository.updateAIProcessingStatus(requestId, 'COMPLETED');
      
      await requestRepository.createRequestEvent({
        requestId,
        eventType: 'AI_CLASSIFIED',
      });
      
    } catch (e) {
      console.error('AI classification failed', e);
      await requestRepository.updateAIProcessingStatus(requestId, 'FAILED');
    }
  }, 1500); // 1.5 seconds delay for AI mock
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

  void broadcastAdminNotificationsUpdated({ action: 'REQUEST_CREATED', requestId: request.id });

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

  void broadcastAdminNotificationsUpdated({
    action: 'REQUEST_STATUS_UPDATED',
    requestId: parsedId.id,
    status: parsed.status,
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

  void broadcastAdminNotificationsUpdated({ action: 'REQUEST_ASSIGNED', requestId: parsedId.id });

  return updated;
};

