'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  Trash2,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';

type Role = 'AGENT' | 'CUSTOMER';
type Source = 'agents' | 'users';

interface StoredCustomer {
  id: string;
  name: string;
  email: string;
  role?: 'CUSTOMER';
  createdAt?: string;
}

interface StoredAgent {
  id: string;
  name: string;
  email: string;
  role?: 'AGENT';
  createdAt?: string;
}

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  source: Source;
}

interface StoredPeople {
  customers: StoredCustomer[];
  agents: StoredAgent[];
}

const emptyPeople: StoredPeople = {
  customers: [],
  agents: [],
};

const roleConfig: Record<Role, { icon: React.ReactNode; bg: string; text: string }> = {
  AGENT: { icon: <Shield className="h-3 w-3" />, bg: 'bg-blue-50', text: 'text-blue-700' },
  CUSTOMER: { icon: <UserCheck className="h-3 w-3" />, bg: 'bg-gray-50', text: 'text-gray-700' },
};

const avatarGradients = [
  'from-indigo-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
];

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

const writeStoredArray = <T,>(key: string, value: T[]) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const initialsFor = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

const formatDate = (value?: string) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function UsersPage() {
  const [people, setPeople] = useState<StoredPeople>(emptyPeople);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  const loadPeople = useCallback(() => {
    setPeople({
      customers: readStoredArray<StoredCustomer>('users'),
      agents: readStoredArray<StoredAgent>('agents'),
    });
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(loadPeople, 0);

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || event.key === 'users' || event.key === 'agents') {
        loadPeople();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadPeople);
    document.addEventListener('visibilitychange', loadPeople);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadPeople);
      document.removeEventListener('visibilitychange', loadPeople);
    };
  }, [loadPeople]);

  const allUsers = useMemo<DisplayUser[]>(
    () => [
      ...people.customers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'CUSTOMER' as const,
        createdAt: user.createdAt,
        source: 'users' as const,
      })),
      ...people.agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: 'AGENT' as const,
        createdAt: agent.createdAt,
        source: 'agents' as const,
      })),
    ],
    [people.agents, people.customers]
  );

  const filteredUsers = allUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const customerCount = people.customers.length;
  const agentCount = people.agents.length;

  const handleDeleteUser = (user: DisplayUser) => {
    const label = user.role === 'AGENT' ? 'agent' : 'user';
    if (!confirm(`Delete this ${label}?`)) return;

    if (user.source === 'agents') {
      const updatedAgents = people.agents.filter((agent) => agent.id !== user.id);
      writeStoredArray('agents', updatedAgents);
      setPeople((current) => ({ ...current, agents: updatedAgents }));
      return;
    }

    const updatedCustomers = people.customers.filter((customer) => customer.id !== user.id);
    writeStoredArray('users', updatedCustomers);
    setPeople((current) => ({ ...current, customers: updatedCustomers }));
  };

  const isFreshEmpty = allUsers.length === 0;

  return (
    <AdminPageGuard>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Real registered customers and admin-created agents</p>
          </div>
          <button
            onClick={loadPeople}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
              <p className="text-xs text-gray-500">Total Users</p>
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
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{customerCount}</p>
              <p className="text-xs text-gray-500">Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'all' | Role)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="AGENT">Agent</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user, index) => {
                  const role = roleConfig[user.role];
                  return (
                    <tr key={`${user.source}-${user.id}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                            {initialsFor(user.name)}
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${role.bg} ${role.text}`}>
                          {role.icon}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title={`Delete ${user.role.toLowerCase()}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              {isFreshEmpty ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">No users found</p>
                  <p className="text-sm text-gray-500">No agents created yet</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No users found</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <strong>{filteredUsers.length}</strong> of <strong>{allUsers.length}</strong> users
            </p>
          </div>
        </div>
      </div>
    </AdminPageGuard>
  );
}
