'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Bot,
  RefreshCw,
  FileText,
  Plus,
  ArrowRight,
  Settings,
  LayoutList,
  Clock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';
import { NotificationList } from '@/components/admin/notifications/NotificationList';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

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
    href: '/dashboard/agents',
    icon: <Bot className="h-5 w-5" />,
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    text: 'text-indigo-700',
    ring: 'ring-indigo-200',
  },
  {
    label: 'Manage Users',
    description: 'View and manage user accounts',
    href: '/dashboard/users',
    icon: <Users className="h-5 w-5" />,
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 hover:bg-violet-100',
    text: 'text-violet-700',
    ring: 'ring-violet-200',
  },
  {
    label: 'View Requests',
    description: 'Browse all customer requests',
    href: '/dashboard/requests',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
  {
    label: 'Settings',
    description: 'Configure system settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
  },
];

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: notificationData, loading: notificationsLoading, error: notificationsError } =
    useAdminNotifications();

  const loadDashboardData = useCallback(() => {
    setData({
      requests: readStoredArray<StoredRequest>('requests'),
      agents: readStoredArray<StoredAgent>('agents'),
      users: readStoredArray<StoredUser>('users'),
    });
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    loadDashboardData();
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
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

  const { stats, loading: statsLoading } = useDashboardStats();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    {
      label: 'Total',
      description: 'All requests',
      value: stats?.totalRequests ?? 0,
      icon: <LayoutList className="h-5 w-5" />,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      valueBg: 'bg-indigo-600',
    },
    {
      label: 'New Waiting',
      description: 'Awaiting assignment',
      value: stats?.newRequests ?? 0,
      icon: <Clock className="h-5 w-5" />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueBg: 'bg-amber-500',
    },
    {
      label: 'Assigned',
      description: 'Being handled',
      value: stats?.inProgressRequests ?? 0,
      icon: <UserCheck className="h-5 w-5" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueBg: 'bg-blue-600',
    },
    {
      label: 'Resolved',
      description: 'Completed requests',
      value: stats?.resolvedRequests ?? 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueBg: 'bg-emerald-600',
    },
  ];

  return (
    <AdminPageGuard>
      <div className="min-h-screen bg-slate-50">
        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-0.5">{greeting} 👋</p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your team, requests, and system settings
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── Notifications ── */}
          <NotificationList
            data={notificationData}
            loading={notificationsLoading}
            error={notificationsError}
          />

          {/* ── Stat Cards ── */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                      {card.icon}
                    </div>
                    {statsLoading ? (
                      <div className="h-8 w-10 rounded-lg bg-slate-100 animate-pulse" />
                    ) : (
                      <span className={`text-2xl font-bold text-slate-900`}>
                        {card.value}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{card.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

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

          {/* ── Requests & Agents tables ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Requests */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Recent Requests</h2>
                    <p className="text-xs text-slate-400">
                      {data.requests.length} total
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/requests"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {data.requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No requests yet</p>
                  <p className="text-xs text-slate-400 mt-1">Customer requests will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.requests.slice(0, 6).map((req) => {
                    const sc = statusConfig[req.status ?? 'Open'];
                    const pc = req.priority ? priorityConfig[req.priority] : null;
                    return (
                      <Link
                        key={req.id}
                        href={`/dashboard/requests/${req.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                      >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(req.customerName ?? 'U')}`}>
                          {getInitials(req.customerName ?? 'Unknown')}
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {req.title || 'Untitled Request'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {req.customerName ?? '—'} · {formatDate(req.createdAt)}
                          </p>
                        </div>
                        {/* Badges */}
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          {pc && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pc.className}`}>
                              {pc.label}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {req.status ?? 'Open'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Agents */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Agents</h2>
                    <p className="text-xs text-slate-400">
                      {data.agents.filter((a) => a.status !== 'INACTIVE').length} active
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/agents"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {data.agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Bot className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No agents yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first support agent to get started</p>
                  <Link
                    href="/dashboard/agents"
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Agent
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.agents.slice(0, 6).map((agent) => {
                    const sc = statusConfig[agent.status ?? 'ACTIVE'];
                    const isActive = agent.status !== 'INACTIVE';
                    return (
                      <div key={agent.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(agent.name)}`}>
                            {getInitials(agent.name)}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{agent.name}</p>
                          <p className="text-xs text-slate-400 truncate">{agent.email}</p>
                        </div>
                        {/* Status badge */}
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </AdminPageGuard>
  );
}
