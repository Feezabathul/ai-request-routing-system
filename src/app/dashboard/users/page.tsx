'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';

/* ── Types & Mock Data ─────────────────────────────────────── */

type Role = 'ADMIN' | 'AGENT' | 'CUSTOMER';
type Status = 'active' | 'inactive' | 'suspended';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: Status;
  createdDate: string;
  lastActive: string;
  requestsCount: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@airouter.io', avatar: 'AU', role: 'ADMIN', status: 'active', createdDate: '2024-06-15', lastActive: '2 min ago', requestsCount: 0 },
  { id: '2', name: 'Agent One', email: 'agent1@airouter.io', avatar: 'A1', role: 'AGENT', status: 'active', createdDate: '2025-01-15', lastActive: '5 min ago', requestsCount: 145 },
  { id: '3', name: 'Agent Two', email: 'agent2@airouter.io', avatar: 'A2', role: 'AGENT', status: 'active', createdDate: '2025-02-20', lastActive: '12 min ago', requestsCount: 98 },
  { id: '4', name: 'John Smith', email: 'john@example.com', avatar: 'JS', role: 'CUSTOMER', status: 'active', createdDate: '2025-03-10', lastActive: '1 hour ago', requestsCount: 23 },
  { id: '5', name: 'Emily Brown', email: 'emily@example.com', avatar: 'EB', role: 'CUSTOMER', status: 'active', createdDate: '2025-04-02', lastActive: '3 hours ago', requestsCount: 15 },
  { id: '6', name: 'David Wilson', email: 'david@example.com', avatar: 'DW', role: 'CUSTOMER', status: 'inactive', createdDate: '2025-01-28', lastActive: '2 days ago', requestsCount: 7 },
  { id: '7', name: 'Agent Three', email: 'agent3@airouter.io', avatar: 'A3', role: 'AGENT', status: 'active', createdDate: '2024-11-10', lastActive: '20 min ago', requestsCount: 210 },
  { id: '8', name: 'Robert Garcia', email: 'robert@example.com', avatar: 'RG', role: 'CUSTOMER', status: 'suspended', createdDate: '2025-02-14', lastActive: '5 days ago', requestsCount: 3 },
  { id: '9', name: 'Anna Taylor', email: 'anna@example.com', avatar: 'AT', role: 'CUSTOMER', status: 'active', createdDate: '2025-05-01', lastActive: '30 min ago', requestsCount: 12 },
  { id: '10', name: 'Agent Four', email: 'agent4@airouter.io', avatar: 'A4', role: 'AGENT', status: 'active', createdDate: '2024-09-05', lastActive: '8 min ago', requestsCount: 178 },
];

/* ── Config ────────────────────────────────────────────────── */

const roleConfig: Record<Role, { icon: React.ReactNode; bg: string; text: string }> = {
  ADMIN: { icon: <ShieldCheck className="h-3 w-3" />, bg: 'bg-red-50', text: 'text-red-700' },
  AGENT: { icon: <Shield className="h-3 w-3" />, bg: 'bg-blue-50', text: 'text-blue-700' },
  CUSTOMER: { icon: <UserCheck className="h-3 w-3" />, bg: 'bg-gray-50', text: 'text-gray-700' },
};

const statusConfig: Record<Status, { dot: string; bg: string; text: string }> = {
  active: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  inactive: { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' },
  suspended: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

const avatarGradients = [
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-pink-500',
  'from-lime-500 to-green-500',
  'from-red-500 to-rose-500',
  'from-blue-500 to-indigo-500',
];

/* ── Page ──────────────────────────────────────────────────── */

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const adminCount = mockUsers.filter((u) => u.role === 'ADMIN').length;
  const agentCount = mockUsers.filter((u) => u.role === 'AGENT').length;
  const customerCount = mockUsers.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <AdminPageGuard>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and roles</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
            <p className="text-xs text-gray-500">Administrators</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{agentCount}</p>
            <p className="text-xs text-gray-500">Agents</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-gray-50 text-gray-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{customerCount}</p>
            <p className="text-xs text-gray-500">Customers</p>
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
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="AGENT">Agent</option>
              <option value="CUSTOMER">Customer</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-3.5 w-3.5" />
              More
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Requests</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user, idx) => {
                const rc = roleConfig[user.role];
                const sc = statusConfig[user.status];
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${rc.bg} ${rc.text}`}>
                        {rc.icon}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(user.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden lg:table-cell">{user.lastActive}</td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-sm font-semibold text-gray-900">{user.requestsCount}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit User">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete User">
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No users found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{mockUsers.length}</strong> users
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

      {/* Role Management Placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Role Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { role: 'ADMIN', desc: 'Full access to all system features, settings, and user management', perms: 12 },
            { role: 'AGENT', desc: 'Manage assigned requests, view queue, and respond to customers', perms: 8 },
            { role: 'CUSTOMER', desc: 'Submit requests, track status, and view responses', perms: 4 },
          ].map((item) => {
            const rc = roleConfig[item.role as Role];
            return (
              <div key={item.role} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${rc.bg} ${rc.text}`}>
                    {rc.icon}
                    {item.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.perms} permissions</span>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Configure</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </AdminPageGuard>
  );
}
