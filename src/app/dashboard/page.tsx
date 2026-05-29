"use client";

import React from 'react';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { StatGrid } from '@/components/dashboard/StatGrid';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { AIProcessing } from '@/components/dashboard/AIProcessing';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RealtimeIndicator } from '@/components/dashboard/RealtimeIndicator';
import { BarChart2, Clock, RotateCw, CheckCircle, Sparkles } from 'lucide-react';

// Simple mock statistics – replace with real API later
const stats = [
  { label: 'Total Requests', value: 128, icon: <BarChart2 className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '+5%' },
  { label: 'Pending', value: 42, icon: <Clock className="h-5 w-5 text-indigo-500" />, trend: 'down' as const, trendValue: '-2%' },
  { label: 'In Progress', value: 15, icon: <RotateCw className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '+12%' },
  { label: 'Resolved', value: 68, icon: <CheckCircle className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '+20%' },
  { label: 'AI Processing', value: 3, icon: <Sparkles className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '+8%' },
];

export default function DashboardPage() {
  return (
    <section className="flex-1 p-6 overflow-y-auto">
      <WelcomeSection userName="Demo User" role="Admin" />
      <StatGrid stats={stats} className="my-6" />
      <RealtimeIndicator />
      <AIProcessing className="my-6" />
      <RecentRequests className="my-6" />
      <QuickActions className="my-6" />
    </section>
  );
}
