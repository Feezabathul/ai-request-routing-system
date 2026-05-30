import { ClassificationLabel, type CustomerRequest } from '@/generated/prisma/client';
import { requestRepository } from '@/repositories/request.repository';
import type {
  AdminNotificationItem,
  AdminNotificationsResponse,
  AdminNotificationStats,
} from '@/types/admin-notification';

const classificationLabelToCategory: Record<ClassificationLabel, string> = {
  BILLING: 'Billing',
  TECHNICAL: 'Technical Support',
  ACCOUNT: 'Account Management',
  FEATURE_REQUEST: 'General Support',
  GENERAL: 'General Support',
};

const formatPriority = (priority: string) =>
  priority.charAt(0) + priority.slice(1).toLowerCase();

type RequestWithRelations = CustomerRequest & {
  aiClassifications?: Array<{ label: ClassificationLabel; confidence: unknown }>;
  createdBy?: { name: string; email: string } | null;
};

export function mapRequestToNotification(request: RequestWithRelations): AdminNotificationItem {
  const latestClassification = request.aiClassifications?.[0];
  const category = latestClassification
    ? classificationLabelToCategory[latestClassification.label]
    : null;
  const aiConfidence = latestClassification
    ? Math.round(Number(latestClassification.confidence) * 100)
    : null;

  return {
    id: request.id,
    customerName: request.customerName,
    customerEmail: request.customerEmail,
    title: request.subject,
    category,
    aiConfidence,
    priority: formatPriority(String(request.priority)),
    status: String(request.status),
    createdAt: request.createdAt.toISOString(),
  };
}

export async function getAdminNotifications(): Promise<AdminNotificationsResponse> {
  const [requests, stats] = await Promise.all([
    requestRepository.getUnassignedRequests(),
    requestRepository.getRequestNotificationStats(),
  ]);

  return {
    notifications: requests.map(mapRequestToNotification),
    stats: stats satisfies AdminNotificationStats,
  };
}
