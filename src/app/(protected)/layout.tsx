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
    <div className="flex min-h-screen min-w-0 bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto pl-14 sm:pl-0">
        {children}
      </main>
    </div>
  );
}

