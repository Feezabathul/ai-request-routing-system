"use client";

import React, { useState, useEffect } from 'react';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { StatGrid } from '@/components/dashboard/StatGrid';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { AIProcessing } from '@/components/dashboard/AIProcessing';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RealtimeIndicator } from '@/components/dashboard/RealtimeIndicator';
import { BarChart2, Clock, RotateCw, CheckCircle, Sparkles } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  aiStatus?: 'Processing' | 'Completed' | 'Failed';
  [key: string]: any;
}

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: 'Total Requests', value: 0, icon: <BarChart2 className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '+0%' },
    { label: 'Pending', value: 0, icon: <Clock className="h-5 w-5 text-indigo-500" />, trend: 'down' as const, trendValue: '0%' },
    { label: 'In Progress', value: 0, icon: <RotateCw className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '0%' },
    { label: 'Resolved', value: 0, icon: <CheckCircle className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '0%' },
    { label: 'AI Processing', value: 0, icon: <Sparkles className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '0%' },
  ]);

  useEffect(() => {
    const updateStats = () => {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem('requests');
      const requests: Request[] = stored ? JSON.parse(stored) : [];
      
      const totalCount = requests.length;
      const pendingCount = requests.filter(r => r.status === 'Pending').length;
      const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
      const resolvedCount = requests.filter(r => r.status === 'Resolved').length;
      const aiProcessingCount = requests.filter(r => r.aiStatus === 'Processing').length;
      
      setStats([
        { label: 'Total Requests', value: totalCount, icon: <BarChart2 className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '+0%' },
        { label: 'Pending', value: pendingCount, icon: <Clock className="h-5 w-5 text-indigo-500" />, trend: 'down' as const, trendValue: '0%' },
        { label: 'In Progress', value: inProgressCount, icon: <RotateCw className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '0%' },
        { label: 'Resolved', value: resolvedCount, icon: <CheckCircle className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '0%' },
        { label: 'AI Processing', value: aiProcessingCount, icon: <Sparkles className="h-5 w-5 text-indigo-500" />, trend: 'up' as const, trendValue: '0%' },
      ]);
    };

    updateStats();
    
    // Listen for storage changes
    window.addEventListener('storage', updateStats);
    return () => window.removeEventListener('storage', updateStats);
  }, []);

  return (
    <section className="flex-1 p-6 overflow-y-auto">
      <WelcomeSection userName="User" role="Admin" />
      <StatGrid stats={stats} className="my-6" />
      <RealtimeIndicator />
      <AIProcessing className="my-6" />
      <RecentRequests className="my-6" />
      <QuickActions className="my-6" />
    </section>
  );
}
