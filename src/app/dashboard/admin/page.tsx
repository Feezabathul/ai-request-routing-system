'use client';

import React from 'react';
import {
  BarChart2,
  Users,
  Bot,
  Sparkles,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Server,
  Cpu,
  HardDrive,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
  Eye,
} from 'lucide-react';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';

/* ── Mock Data ─────────────────────────────────────────────── */

const overviewStats = [
  { label: 'Total Requests', value: '1,284', change: '+12.5%', up: true, icon: <FileText className="h-5 w-5" />, color: 'indigo' },
  { label: 'Active Agents', value: '18', change: '+2', up: true, icon: <Bot className="h-5 w-5" />, color: 'emerald' },
  { label: 'Total Users', value: '342', change: '+28', up: true, icon: <Users className="h-5 w-5" />, color: 'violet' },
  { label: 'AI Accuracy', value: '94.2%', change: '+1.8%', up: true, icon: <Sparkles className="h-5 w-5" />, color: 'amber' },
];

const queueItems = [
  { name: 'General Inquiries', count: 23, priority: 'normal' },
  { name: 'Technical Support', count: 15, priority: 'high' },
  { name: 'Billing Issues', count: 8, priority: 'normal' },
  { name: 'Feature Requests', count: 12, priority: 'low' },
  { name: 'Urgent Escalations', count: 3, priority: 'critical' },
];

const recentActivities = [
  { action: 'Request #1284 routed to Agent Sarah', time: '2 min ago', type: 'route' },
  { action: 'Agent Mike came online', time: '5 min ago', type: 'agent' },
  { action: 'AI classified 12 new requests', time: '8 min ago', type: 'ai' },
  { action: 'User John submitted a new request', time: '12 min ago', type: 'request' },
  { action: 'Queue "Technical Support" cleared', time: '18 min ago', type: 'queue' },
  { action: 'System health check passed', time: '25 min ago', type: 'system' },
  { action: 'Agent Lisa resolved Request #1279', time: '30 min ago', type: 'resolve' },
];

const systemHealth = [
  { name: 'API Server', status: 'healthy', uptime: '99.98%', icon: <Server className="h-4 w-4" /> },
  { name: 'AI Engine', status: 'healthy', uptime: '99.95%', icon: <Cpu className="h-4 w-4" /> },
  { name: 'Database', status: 'healthy', uptime: '99.99%', icon: <HardDrive className="h-4 w-4" /> },
  { name: 'Queue Worker', status: 'warning', uptime: '98.50%', icon: <Zap className="h-4 w-4" /> },
];

const aiProcessingStats = [
  { label: 'Requests Classified', value: 1148, total: 1284 },
  { label: 'Auto-Routed', value: 987, total: 1148 },
  { label: 'Sentiment Analyzed', value: 1284, total: 1284 },
  { label: 'Priority Assigned', value: 1200, total: 1284 },
];

/* ── Color helpers ─────────────────────────────────────────── */

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-200' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-200' },
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
};

const statusColors: Record<string, { dot: string; bg: string; text: string }> = {
  healthy: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  warning: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  critical: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

const activityIcons: Record<string, React.ReactNode> = {
  route: <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />,
  agent: <Bot className="h-3.5 w-3.5 text-emerald-500" />,
  ai: <Sparkles className="h-3.5 w-3.5 text-violet-500" />,
  request: <FileText className="h-3.5 w-3.5 text-indigo-500" />,
  queue: <CheckCircle className="h-3.5 w-3.5 text-teal-500" />,
  system: <Activity className="h-3.5 w-3.5 text-gray-500" />,
  resolve: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
};

/* ── Page ──────────────────────────────────────────────────── */

export default function AdminOverviewPage() {
  return (
    <AdminPageGuard>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor system performance and manage operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            System Online
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => {
          const c = colorMap[stat.color];
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>
                  {stat.icon}
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Queue Monitoring + AI Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Monitoring */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Queue Monitoring
            </h2>
            <span className="text-xs text-gray-400">Live</span>
          </div>
          <div className="space-y-3">
            {queueItems.map((q) => (
              <div key={q.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{q.name}</span>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${priorityColors[q.priority]}`}>
                    {q.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{q.count}</span>
                  <span className="text-xs text-gray-400">items</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Total in queue: <strong className="text-gray-700">{queueItems.reduce((a, b) => a + b.count, 0)}</strong></span>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              <Eye className="h-3 w-3" /> View All
            </button>
          </div>
        </div>

        {/* AI Processing Stats */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              AI Processing Stats
            </h2>
            <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full font-medium">Active</span>
          </div>
          <div className="space-y-4">
            {aiProcessingStats.map((stat) => {
              const pct = Math.round((stat.value / stat.total) * 100);
              return (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{stat.value.toLocaleString()} / {stat.total.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="h-3 w-3 text-violet-400" />
            AI engine processing at normal speed
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activities + System Health + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              Recent Activities
            </h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
          </div>
          <div className="space-y-0">
            {recentActivities.map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-gray-50">
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              System Health
            </h2>
            <span className="text-xs text-emerald-600 font-medium">All Systems OK</span>
          </div>
          <div className="space-y-3">
            {systemHealth.map((sys) => {
              const sc = statusColors[sys.status];
              return (
                <div key={sys.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-50 hover:border-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{sys.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sys.name}</p>
                      <p className="text-xs text-gray-400">Uptime: {sys.uptime}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sys.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Analytics Placeholder */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              Analytics
            </h3>
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6 text-center">
              <BarChart2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Charts & analytics coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Agent', icon: <Bot className="h-5 w-5" />, color: 'indigo' },
            { label: 'View Reports', icon: <BarChart2 className="h-5 w-5" />, color: 'emerald' },
            { label: 'Manage Users', icon: <Users className="h-5 w-5" />, color: 'violet' },
            { label: 'System Settings', icon: <AlertTriangle className="h-5 w-5" />, color: 'amber' },
          ].map((action) => {
            const c = colorMap[action.color];
            return (
              <button
                key={action.label}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 ${c.bg}`}
              >
                <span className={c.text}>{action.icon}</span>
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </AdminPageGuard>
  );
}
