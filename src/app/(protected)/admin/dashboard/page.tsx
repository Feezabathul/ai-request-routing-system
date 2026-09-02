'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Bot,
  FileText,
  Plus,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';
// Notification imports removed as they are no longer needed
import { useDashboardStats } from '@/hooks/useDashboardStats';

type RequestStatus = 'Pending' | 'In Progress' | 'AI Processing' | 'Resolved' | 'Closed' | 'Open';
type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
type AgentStatus = 'ACTIVE' | 'INACTIVE';

interface StoredRequest {
  id: string;
  title: string;
  customerName?: string;
  customerEmail?: string;
  priority?: RequestPriority;
  status?: RequestStatus;
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

const emptyDashboardData: DashboardData = { requests: [], agents: [], users: [] };

const priorityConfig: Record<RequestPriority, { label: string; className: string }> = {
  Low:    { label: 'Low',    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  Medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  High:   { label: 'High',   className: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  Urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
};

const statusConfig: Record<string, { className: string; dot: string }> = {
  Open:           { className: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',   dot: 'bg-slate-400' },
  Pending:        { className: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',   dot: 'bg-slate-400' },
  'In Progress':  { className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',      dot: 'bg-blue-500' },
  'AI Processing':{ className: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',dot: 'bg-violet-500' },
  Resolved:       { className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  Closed:         { className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',     dot: 'bg-gray-400' },
  ACTIVE:         { className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  INACTIVE:       { className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',     dot: 'bg-gray-400' },
};

const readStoredArray = <T,>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

const getAvatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const quickActions = [
  {
    label: 'Add Agent',
    description: 'Onboard a new support agent',
    href: '/admin/agents',
    icon: <Bot className="h-5 w-5" />,
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    text: 'text-indigo-700',
    ring: 'ring-indigo-200',
  },
  {
    label: 'Manage Users',
    description: 'View and manage user accounts',
    href: '/admin/users',
    icon: <Users className="h-5 w-5" />,
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 hover:bg-violet-100',
    text: 'text-violet-700',
    ring: 'ring-violet-200',
  },
  {
    label: 'View Requests',
    description: 'Browse all customer requests',
    href: '/admin/requests',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
  {
    label: 'Settings',
    description: 'Configure system settings',
    href: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
  },
];

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);

  // Admin notifications hook removed as they are no longer needed
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats();

  const loadDashboardData = useCallback(() => {
    setData({
      requests: readStoredArray<StoredRequest>('requests'),
      agents: readStoredArray<StoredAgent>('agents'),
      users: readStoredArray<StoredUser>('users'),
    });
  }, []);


  // State to track selected agent for each request
  const [selectedAgentMap, setSelectedAgentMap] = useState<Record<string, string>>({});

  const handleAssignRequest = async (requestId: string) => {
    const agentId = selectedAgentMap[requestId];
    if (!agentId) {
      alert('Please select an agent to assign.');
      return;
    }
    try {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) throw new Error('Assign failed');
      // Refresh dashboard data after successful assignment
      // Re-fetch requests from API to sync localStorage
      const freshRes = await fetch('/api/requests');
      if (freshRes.ok) {
        const data = await freshRes.json();
        // Assuming API returns { requests: [...] }
        if (data.requests) {
          localStorage.setItem('requests', JSON.stringify(data.requests));
        }
      }
      loadDashboardData();
    } catch (e) {
      console.error(e);
      alert('Failed to assign agent.');
    }
  };


  useEffect(() => {
    const t = window.setTimeout(loadDashboardData, 0);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || ['requests', 'agents', 'users'].includes(e.key)) loadDashboardData();
    };
    const onFocus = () => { if (document.visibilityState === 'visible') loadDashboardData(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [loadDashboardData]);


// const hour = new Date().getHours();
// const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AdminPageGuard>
      <div className="min-h-screen bg-slate-50">
        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>

              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your team, requests, and system settings
              </p>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">



          {/* ── Stat Cards ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded bg-slate-200 animate-pulse" />
                  ) : (
                    stats?.newRequests ?? 0
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  New Waiting
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded bg-slate-200 animate-pulse" />
                  ) : (
                    stats?.inProgressRequests ?? 0
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  Assigned
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded bg-slate-200 animate-pulse" />
                  ) : (
                    stats?.resolvedRequests ?? 0
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  Resolved
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded bg-slate-200 animate-pulse" />
                  ) : (
                    stats?.totalRequests ?? 0
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl ring-1 ${action.ring} ${action.bg} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-sm`}>
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${action.text}`}>{action.label}</p>
                    <p className="text-xs text-slate-500 truncate">{action.description}</p>
                  </div>
                  <ArrowRight className={`ml-auto h-4 w-4 ${action.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200`} />
                </Link>
              ))}
            </div>
          </section>

          </div>

        </div>
      
    </AdminPageGuard>
  );
}
