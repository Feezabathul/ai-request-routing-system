'use client';

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  label?: string;
  variant?: 'default' | 'urgent';
}

export function NotificationBadge({
  count,
  label = 'New',
  variant = 'default',
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const styles =
    variant === 'urgent'
      ? 'bg-red-600 text-white'
      : 'bg-indigo-600 text-white';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}
      aria-label={`${count} ${label} notifications`}
    >
      {count}
      <span className="sr-only">{label}</span>
    </span>
  );
}
