import { prisma } from "@/lib/prisma";
import {
  AIProcessingStatus,
  RequestEventType,
  RequestPriority,
  RequestStatus,
  type CustomerRequest,
  type RequestEvent,
} from "@/generated/prisma/client";

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

  async getDashboardStats() {
    try {
      const [totalRequests, newRequests, inProgressRequests, resolvedRequests, activeAssignedCounts] =
        await Promise.all([
          prisma.customerRequest.count(),
          prisma.customerRequest.count({
            where: {
              assignedToId: null,
              status: { notIn: [RequestStatus.RESOLVED, RequestStatus.CLOSED] },
            },
          }),
          prisma.customerRequest.count({
            where: {
              assignedToId: { not: null },
              status: { in: [RequestStatus.OPEN, RequestStatus.IN_PROGRESS] },
            },
          }),
          prisma.customerRequest.count({
            where: { status: { in: [RequestStatus.RESOLVED, RequestStatus.CLOSED] } },
          }),
          prisma.customerRequest.groupBy({
            by: ['assignedToId'],
            where: {
              assignedToId: { not: null },
              status: { notIn: [RequestStatus.RESOLVED, RequestStatus.CLOSED] },
            },
            _count: { assignedToId: true },
          }),
        ]);

      // Log counts for debugging/verification
      console.log('[dashboard] totalRequests=', totalRequests);
      console.log('[dashboard] newRequests=', newRequests);
      console.log('[dashboard] inProgressRequests=', inProgressRequests);
      console.log('[dashboard] resolvedRequests=', resolvedRequests);

      const agentIds = activeAssignedCounts.map((row) => row.assignedToId).filter(
        (id): id is string => id !== null,
      );

      const agentNames =
        agentIds.length > 0
          ? await prisma.user.findMany({
              where: { id: { in: agentIds } },
              select: { id: true, name: true },
            })
          : [];

      const agentWorkload = activeAssignedCounts
        .map((row) => ({
          agentId: row.assignedToId as string,
          name: agentNames.find((agent) => agent.id === row.assignedToId)?.name ?? 'Agent',
          activeAssignedRequests: row._count.assignedToId,
        }))
        .sort((a, b) => b.activeAssignedRequests - a.activeAssignedRequests);

      return {
        totalRequests,
        newRequests,
        inProgressRequests,
        resolvedRequests,
        agentWorkload,
      };
    } catch (err) {
      console.error('[dashboard] Failed to compute stats:', err);
      // Return safe zeros so the dashboard can still render in dev environments.
      return {
        totalRequests: 0,
        newRequests: 0,
        inProgressRequests: 0,
        resolvedRequests: 0,
        agentWorkload: [],
      };
    }
  }

  async getUnassignedRequests(limit = 50) {
    return prisma.customerRequest.findMany({
      where: { assignedToId: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        aiClassifications: { orderBy: { createdAt: 'desc' }, take: 1 },
        createdBy: true,
      },
    });
  }

  async getRequestNotificationStats() {
    const [total, newWaiting, assigned, resolved] = await Promise.all([
      prisma.customerRequest.count(),
      prisma.customerRequest.count({
        where: {
          assignedToId: null,
          status: { notIn: [RequestStatus.RESOLVED, RequestStatus.CLOSED] },
        },
      }),
      prisma.customerRequest.count({
        where: {
          assignedToId: { not: null },
          status: { not: RequestStatus.RESOLVED },
        },
      }),
      prisma.customerRequest.count({ where: { status: RequestStatus.RESOLVED } }),
    ]);

    return { total, newWaiting, assigned, resolved };
  }
}

export const requestRepository = new RequestRepository();

