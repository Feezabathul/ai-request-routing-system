import { prisma } from "@/lib/prisma";
import {
  AIProcessingStatus,
  RequestEventType,
  RequestPriority,
  RequestStatus,
  type CustomerRequest,
  type RequestEvent,
} from "@/generated/prisma";

export type CreateCustomerRequestData = {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  createdById: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  aiProcessingStatus?: AIProcessingStatus;
  retryCount?: number;
};

export type RequestListFilters = {
  status?: RequestStatus;
  priority?: RequestPriority;
  take?: number;
  skip?: number;
};

export type CreateRequestEventData = {
  requestId: string;
  actorId?: string;
  eventType: RequestEventType;
  description?: string;
  metadata?: unknown;
};

export class RequestRepository {
  async createRequest(data: CreateCustomerRequestData): Promise<CustomerRequest> {
    return prisma.customerRequest.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        subject: data.subject,
        message: data.message,
        createdById: data.createdById,
        status: data.status,
        priority: data.priority,
        aiProcessingStatus: data.aiProcessingStatus,
        retryCount: data.retryCount,
      },
    });
  }

  async getRequestById(id: string): Promise<CustomerRequest | null> {
    return prisma.customerRequest.findUnique({
      where: { id },
      include: {
        aiClassifications: { orderBy: { createdAt: "desc" } },
        internalNotes: { orderBy: { createdAt: "desc" } },
        requestEvents: { orderBy: { createdAt: "desc" } },
        assignedTo: true,
        createdBy: true,
      },
    }) as unknown as CustomerRequest | null;
  }

  async getAllRequests(filters: RequestListFilters): Promise<CustomerRequest[]> {
    const { status, priority, take = 50, skip = 0 } = filters;
    return prisma.customerRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: true,
        createdBy: true,
      },
    }) as unknown as CustomerRequest[];
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<CustomerRequest> {
    return prisma.customerRequest.update({
      where: { id },
      data: { status },
    });
  }

  async assignAgentToRequest(id: string, agentId: string): Promise<CustomerRequest> {
    return prisma.customerRequest.update({
      where: { id },
      data: { assignedToId: agentId },
    });
  }

  async updateAIProcessingStatus(
    id: string,
    aiProcessingStatus: AIProcessingStatus,
    retryCount?: number,
  ): Promise<CustomerRequest> {
    return prisma.customerRequest.update({
      where: { id },
      data: {
        aiProcessingStatus,
        ...(typeof retryCount === "number" ? { retryCount } : {}),
      },
    });
  }

  async createRequestEvent(data: CreateRequestEventData): Promise<RequestEvent> {
    return prisma.requestEvent.create({
      data: {
        requestId: data.requestId,
        actorId: data.actorId,
        eventType: data.eventType,
        description: data.description,
        metadata: data.metadata as never,
      },
    });
  }
}

export const requestRepository = new RequestRepository();

