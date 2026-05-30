"use client";

import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { AIProcessing } from '@/components/dashboard/AIProcessing';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RealtimeIndicator } from '@/components/dashboard/RealtimeIndicator';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

export default function DashboardPage() {
  return (
    <section className="flex-1 p-6 overflow-y-auto">
      <WelcomeSection userName="User" role="Admin" />
      <div className="my-6">
        <DashboardStats />
      </div>
      <RealtimeIndicator />
      <AIProcessing className="my-6" />
      <RecentRequests className="my-6" />
      <QuickActions className="my-6" />
    </section>
  );
}
