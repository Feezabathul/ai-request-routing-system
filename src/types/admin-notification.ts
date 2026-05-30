export interface AdminNotificationItem {
  id: string;
  customerName: string;
  customerEmail: string;
  title: string;
  category: string | null;
  aiConfidence: number | null;
  priority: string;
  status: string;
  createdAt: string;
}

export interface AdminNotificationStats {
  newWaiting: number;
  assigned: number;
  resolved: number;
  total: number;
}

export interface AdminNotificationsResponse {
  notifications: AdminNotificationItem[];
  stats: AdminNotificationStats;
}
