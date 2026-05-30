'use client';

import React from 'react';
import { Bell, Loader2, Inbox } from 'lucide-react';
import type { AdminNotificationsResponse } from '@/types/admin-notification';
import { NotificationBadge } from './NotificationBadge';
import { NotificationCard } from './NotificationCard';

interface NotificationListProps {
  data: AdminNotificationsResponse | null;
  loading: boolean;
  error?: string | null;
}

export function NotificationList({ data, loading, error }: NotificationListProps) {
  const notifications = data?.notifications ?? [];
  const stats = data?.stats;

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              New Request Notifications
            </h2>
            <p className="text-sm text-gray-500">
              Unassigned customer requests waiting for admin review
            </p>
          </div>
          <NotificationBadge count={notifications.length} label="pending" />
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3">
            {[
              { label: 'New Waiting', value: stats.newWaiting },
              { label: 'Assigned', value: stats.assigned },
              { label: 'Resolved', value: stats.resolved },
              { label: 'Total', value: stats.total },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-gray-50 px-3 py-2"
              >
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            Loading notifications…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">Inbox is clear</p>
            <p className="mt-1 text-sm text-gray-500">
              No unassigned requests right now. New customer requests will appear here instantly.
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
