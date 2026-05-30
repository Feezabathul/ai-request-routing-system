'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart2, Users, Bot, RefreshCw, FileText, Plus } from 'lucide-react';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';
import { NotificationList } from '@/components/admin/notifications/NotificationList';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { useDashboardStats } from '@/hooks/useDashboardStats';

type RequestStatus = 'Pending' | 'In Progress' | 'AI Processing' | 'Resolved' | 'Closed' | 'Open';
type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
type AgentStatus = 'ACTIVE' | 'INACTIVE';

interface StoredRequest {
  id: string;
  title: string;
  customerName?: string;
  customerEmail?: string;
  category?: string;
  priority?: RequestPriority;
  status?: RequestStatus;
  assignedAgent?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAt?: string;
  createdAt?: string;
}

interface StoredAgent {
  id: string;
  name: string;
  email: string;
  role?: 'AGENT';
  status?: AgentStatus;
  createdAt?: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

interface DashboardData {
  requests: StoredRequest[];
  agents: StoredAgent[];
  users: StoredUser[];
}

const emptyDashboardData: DashboardData = {
  requests: [],
  agents: [],
  users: [],
};

const colorMap: Record<string, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

const priorityColors: Record<RequestPriority, string> = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'AI Processing': 'bg-purple-100 text-purple-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-red-100 text-red-800',
  Open: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

const readStoredArray = <T,>(key: string): T[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to parse ${key} from localStorage:`, error);
    return [];
  }
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const {
    data: notificationData,
    loading: notificationsLoading,
    error: notificationsError,
  } = useAdminNotifications();

  const { stats, loading: statsLoading } = useDashboardStats();

  const loadDashboardData = useCallback(() => {
    setData({
      requests: readStoredArray<StoredRequest>('requests'),
      agents: readStoredArray<StoredAgent>('agents'),
      users: readStoredArray<StoredUser>('users'),
    });
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(loadDashboardData, 0);

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || ['requests', 'agents', 'users'].includes(event.key)) {
        loadDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadDashboardData);
    document.addEventListener('visibilitychange', loadDashboardData);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadDashboardData);
      document.removeEventListener('visibilitychange', loadDashboardData);
    };
  }, [loadDashboardData]);

  return (
    <AdminPageGuard>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Real application data from stored users, requests, and agents</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <NotificationList
          data={notificationData}
          loading={notificationsLoading}
          error={notificationsError}
        />

        <DashboardStats stats={stats} loading={statsLoading} className="my-6" />

        <section className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Agent Workload</h2>
          </div>
          <div className="space-y-3">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))
            ) : stats?.agentWorkload.length ? (
              stats.agentWorkload.map((agent) => (
                <div
                  key={agent.agentId}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4"
                >
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-sm text-gray-500">
                    {agent.activeAssignedRequests} Active Request{agent.activeAssignedRequests === 1 ? '' : 's'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No active assigned agent workload found.
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Requests
              </h2>
              <Link href="/dashboard/requests" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </Link>
            </div>

            {data.requests.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent requests available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="py-3 pr-4">Title</th>
                      <th className="py-3 pr-4">Customer</th>
                      <th className="py-3 pr-4">Priority</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.requests.map((request) => (
                      <tr key={request.id}>
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          <Link href={`/dashboard/requests/${request.id}`} className="text-indigo-600 hover:underline">
                            {request.title || 'Untitled Request'}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-gray-800">{request.customerName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{request.customerEmail || 'N/A'}</p>
                        </td>
                        <td className="py-3 pr-4">
                          {request.priority ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[request.priority]}`}>
                              {request.priority}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[request.status ?? 'Open']}`}>
                            {request.status || 'Open'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{formatDate(request.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-500" />
                Agents
              </h2>
              <Link href="/dashboard/agents" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Manage Agents
              </Link>
            </div>

            {data.agents.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <Bot className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No agents created yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.agents.map((agent) => (
                      <tr key={agent.id}>
                        <td className="py-3 pr-4 font-medium text-gray-900">{agent.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{agent.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[agent.status ?? 'ACTIVE']}`}>
                            {agent.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{formatDate(agent.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/dashboard/agents"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 bg-indigo-50 text-indigo-700 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Agent
            </Link>
            <Link
              href="/dashboard/users"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 bg-violet-50 text-violet-700 text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Link>
            <Link
              href="/dashboard/requests"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 bg-emerald-50 text-emerald-700 text-sm font-medium"
            >
              <FileText className="h-4 w-4" />
              View Requests
            </Link>
          </div>
        </section>
      </div>
    </AdminPageGuard>
  );
}
