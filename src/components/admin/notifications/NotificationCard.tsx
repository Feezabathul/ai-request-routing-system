'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, User, Mail, Sparkles } from 'lucide-react';
import type { AdminNotificationItem } from '@/types/admin-notification';

interface NotificationCardProps {
  notification: AdminNotificationItem;
}

const priorityStyles: Record<string, string> = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const priorityClass =
    priorityStyles[notification.priority] ?? 'bg-gray-100 text-gray-800';

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {notification.title}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityClass}`}>
              {notification.priority} Priority
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-gray-400" />
              {notification.customerName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              {notification.customerEmail}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>ID: {notification.id}</span>
            {notification.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                <Sparkles className="h-3 w-3" />
                {notification.category}
                {notification.aiConfidence != null && (
                  <span className="text-indigo-500">({notification.aiConfidence}%)</span>
                )}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Created {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:w-40">
          <Link
            href={`/dashboard/requests/${notification.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View Request
          </Link>
          <Link
            href={`/dashboard/requests/${notification.id}?assign=1`}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Assign Agent
          </Link>
        </div>
      </div>
    </article>
  );
}
