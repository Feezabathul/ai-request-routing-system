import type {
  AdminNotificationItem,
  AdminNotificationStats,
  AdminNotificationsResponse,
} from '@/types/admin-notification';
import { getRequestCreator } from '@/lib/current-user';

interface StoredRequestLike {
  id: string;
  title: string;
  createdById?: string;
  createdByName?: string;
  createdByEmail?: string;
  customerName?: string;
  customerEmail?: string;
  category?: string;
  aiCategory?: string;
  aiConfidence?: number;
  priority?: string;
  status?: string;
  assignedAgentId?: string;
  createdAt?: string;
}

export function getLocalStorageNotifications(): AdminNotificationItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem('requests');
    if (!raw) return [];
    const requests: StoredRequestLike[] = JSON.parse(raw);
    if (!Array.isArray(requests)) return [];

    return requests
      .filter((request) => !request.assignedAgentId)
      .map((request) => {
        const creator = getRequestCreator(request);
        return {
          id: request.id,
          customerName: creator.name,
          customerEmail: creator.email,
          title: request.title,
          category: request.aiCategory ?? request.category ?? null,
          aiConfidence: request.aiConfidence ?? null,
          priority: request.priority ?? 'Medium',
          status: request.status ?? 'Pending',
          createdAt: request.createdAt ?? new Date().toISOString(),
        };
      })
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch {
    return [];
  }
}

export function getLocalStorageNotificationStats(): AdminNotificationStats {
  if (typeof window === 'undefined') {
    return { newWaiting: 0, assigned: 0, resolved: 0, total: 0 };
  }

  try {
    const raw = localStorage.getItem('requests');
    const requests: StoredRequestLike[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(requests)) {
      return { newWaiting: 0, assigned: 0, resolved: 0, total: 0 };
    }

    return {
      total: requests.length,
      newWaiting: requests.filter((r) => !r.assignedAgentId).length,
      assigned: requests.filter(
        (r) => r.assignedAgentId && r.status !== 'Resolved'
      ).length,
      resolved: requests.filter((r) => r.status === 'Resolved').length,
    };
  } catch {
    return { newWaiting: 0, assigned: 0, resolved: 0, total: 0 };
  }
}

export function mergeAdminNotifications(
  apiData: AdminNotificationsResponse | null,
  localNotifications: AdminNotificationItem[]
): AdminNotificationsResponse {
  const mergedMap = new Map<string, AdminNotificationItem>();

  for (const item of localNotifications) {
    mergedMap.set(item.id, item);
  }

  if (apiData) {
    for (const item of apiData.notifications) {
      mergedMap.set(item.id, item);
    }
  }

  const notifications = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const localStats = getLocalStorageNotificationStats();
  const stats = apiData?.stats ?? localStats;

  if (localNotifications.length > 0 && (!apiData || apiData.notifications.length === 0)) {
    return { notifications, stats: localStats };
  }

  return {
    notifications,
    stats: {
      newWaiting: Math.max(stats.newWaiting, notifications.length),
      assigned: stats.assigned || localStats.assigned,
      resolved: stats.resolved || localStats.resolved,
      total: Math.max(stats.total, localStats.total),
    },
  };
}

export function notifyAdminInboxUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('admin-notifications-updated'));
}

export function getPendingNotificationCount(): number {
  return getLocalStorageNotificationStats().newWaiting;
}
