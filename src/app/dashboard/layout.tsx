'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

/**
 * Shared layout for all /dashboard/* pages.
 * Renders the sidebar and wraps the page content.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
