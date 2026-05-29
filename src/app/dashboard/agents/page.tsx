'use client';

import React, { useState } from 'react';
import {
  Bot,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/* ── Mock Agents Data ──────────────────────────────────────── */

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  department: string;
  assignedRequests: number;
  resolvedToday: number;
  avgResponseTime: string;
  rating: number;
  joinedDate: string;
  skills: string[];
}

const mockAgents: Agent[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@airouter.io', avatar: 'SJ', status: 'online', department: 'Technical Support', assignedRequests: 8, resolvedToday: 12, avgResponseTime: '4m', rating: 4.8, joinedDate: '2025-01-15', skills: ['API', 'Database', 'Frontend'] },
  { id: '2', name: 'Mike Chen', email: 'mike@airouter.io', avatar: 'MC', status: 'online', department: 'General Inquiries', assignedRequests: 5, resolvedToday: 9, avgResponseTime: '3m', rating: 4.6, joinedDate: '2025-02-20', skills: ['Billing', 'Account', 'General'] },
  { id: '3', name: 'Lisa Patel', email: 'lisa@airouter.io', avatar: 'LP', status: 'away', department: 'Billing', assignedRequests: 3, resolvedToday: 7, avgResponseTime: '5m', rating: 4.9, joinedDate: '2024-11-10', skills: ['Billing', 'Payments', 'Refunds'] },
  { id: '4', name: 'James Wilson', email: 'james@airouter.io', avatar: 'JW', status: 'online', department: 'Technical Support', assignedRequests: 10, resolvedToday: 15, avgResponseTime: '2m', rating: 4.7, joinedDate: '2024-09-05', skills: ['Backend', 'Security', 'DevOps'] },
  { id: '5', name: 'Emma Davis', email: 'emma@airouter.io', avatar: 'ED', status: 'offline', department: 'Feature Requests', assignedRequests: 0, resolvedToday: 0, avgResponseTime: '6m', rating: 4.5, joinedDate: '2025-03-12', skills: ['Product', 'UX', 'Testing'] },
  { id: '6', name: 'Alex Turner', email: 'alex@airouter.io', avatar: 'AT', status: 'online', department: 'Escalations', assignedRequests: 4, resolvedToday: 6, avgResponseTime: '3m', rating: 4.9, joinedDate: '2024-08-22', skills: ['Escalation', 'Management', 'VIP'] },
];

const statusConfig = {
  online: { color: 'bg-emerald-500', label: 'Online', badge: 'bg-emerald-50 text-emerald-700' },
  away: { color: 'bg-amber-500', label: 'Away', badge: 'bg-amber-50 text-amber-700' },
  offline: { color: 'bg-gray-400', label: 'Offline', badge: 'bg-gray-100 text-gray-600' },
};

const avatarGradients = [
  'from-indigo-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
];

/* ── Page ──────────────────────────────────────────────────── */

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = mockAgents.filter((a) => a.status === 'online').length;
  const awayCount = mockAgents.filter((a) => a.status === 'away').length;
  const totalAssigned = mockAgents.reduce((a, b) => a + b.assignedRequests, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor support agents</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{onlineCount}</p>
            <p className="text-xs text-gray-500">Agents Online</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{awayCount}</p>
            <p className="text-xs text-gray-500">Agents Away</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
            <p className="text-xs text-gray-500">Assigned Requests</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Time</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAgents.map((agent, idx) => {
                const sc = statusConfig[agent.status];
                return (
                  <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                          {agent.avatar}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${sc.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-400">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.color}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{agent.department}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-gray-900">{agent.assignedRequests}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {agent.resolvedToday}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm text-gray-600">{agent.avgResponseTime}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {agent.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Agent">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Remove Agent">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="More options">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No agents found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing <strong>{filteredAgents.length}</strong> of <strong>{mockAgents.length}</strong> agents
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md">1</button>
            <button className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">2</button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Skills / Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Agent Skills Distribution</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(mockAgents.flatMap((a) => a.skills))).map((skill) => {
              const count = mockAgents.filter((a) => a.skills.includes(skill)).length;
              return (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-100">
                  {skill}
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Average Response Time', value: '3.8 min', color: 'indigo' },
              { label: 'Average Rating', value: '4.73 / 5', color: 'amber' },
              { label: 'Requests Resolved Today', value: '49', color: 'emerald' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-600">{metric.label}</span>
                <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Agent Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" placeholder="Enter agent name" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" placeholder="agent@company.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                  <option>Technical Support</option>
                  <option>General Inquiries</option>
                  <option>Billing</option>
                  <option>Feature Requests</option>
                  <option>Escalations</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                Add Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
