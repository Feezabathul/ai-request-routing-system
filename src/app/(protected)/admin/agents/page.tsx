'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Check,
  X,
  Mail,
} from 'lucide-react';
import { AdminPageGuard } from '@/components/dashboard/AdminPageGuard';

type Agent = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  status: string;
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  token: string;
  status: string;
  createdAt: string;
};

const statusConfig: Record<string, { color: string; label: string; badge: string }> = {
  ONLINE: { color: 'bg-emerald-500', label: 'Online', badge: 'bg-emerald-50 text-emerald-700' },
  OFFLINE: { color: 'bg-gray-400', label: 'Offline', badge: 'bg-gray-100 text-gray-600' },
  BUSY: { color: 'bg-amber-500', label: 'Busy', badge: 'bg-amber-50 text-amber-700' },
  ON_LEAVE: { color: 'bg-blue-400', label: 'On Leave', badge: 'bg-blue-50 text-blue-700' },
  INVITED: { color: 'bg-indigo-400', label: 'Invited', badge: 'bg-indigo-50 text-indigo-700' }
};

const avatarGradients = [
  'from-indigo-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAgentsAndInvites = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await (res.json() as Promise<{ agents: Agent[]; invitations: Invitation[] }>);
        setAgents(data.agents || []);
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsAndInvites();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleInviteAgent = async () => {
    setInviteError('');
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Invalid email address');
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch('/api/agents/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim() }),
      });

      const data = await (res.json() as Promise<{ success?: boolean; error?: string, setupUrl?: string }>);

      if (!res.ok) {
        setInviteError(data.error || 'Failed to send invite');
        return;
      }

      setSuccessMessage(`Invitation sent to ${inviteEmail}`);
      setShowSuccess(true);
      if (data.setupUrl) {
        setGeneratedInviteLink(data.setupUrl);
      } else {
        setShowInviteModal(false);
        setInviteName('');
        setInviteEmail('');
      }
      fetchAgentsAndInvites();
    } catch (err) {
      setInviteError('Network error');
    } finally {
      setIsInviting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Link copied to clipboard!');
      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteError('');
    setGeneratedInviteLink('');
  };

  // Combine agents and pending invitations for display
  const allItems = [
    ...agents.map(a => ({ ...a, isInvite: false })),
    ...invitations.map(i => ({
      id: i.id,
      name: 'Pending Invite',
      email: i.email,
      department: '-',
      status: 'INVITED',
      createdAt: i.createdAt,
      isInvite: true
    }))
  ];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter || (statusFilter === 'ACTIVE' && item.status === 'ONLINE');
    return matchesSearch && matchesStatus;
  });

  const onlineCount = agents.filter((a) => a.status === 'ONLINE').length;
  const offlineCount = agents.filter((a) => a.status !== 'ONLINE').length;

  return (
    <AdminPageGuard>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg shadow-lg">
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
            <button onClick={() => setShowSuccess(false)} className="ml-2 text-emerald-600 hover:text-emerald-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and invite support agents</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Mail className="h-4 w-4" />
            Invite Agent
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              <p className="text-xs text-gray-500">Registered Agents</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{onlineCount}</p>
              <p className="text-xs text-gray-500">Online Agents</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
              <p className="text-xs text-gray-500">Pending Invites</p>
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
                placeholder="Search agents by name or email..."
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
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="INVITED">Invited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 px-4">
              <p className="text-sm text-gray-500">Loading agents...</p>
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
              <p className="text-sm text-gray-500 mb-6">Invite your first support agent to get started</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Invite Agent
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created/Invited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredItems.map((item, idx) => {
                      const sc = statusConfig[item.status] || { color: 'bg-gray-400', label: item.status, badge: 'bg-gray-100 text-gray-600' };
                      const avatarText = item.isInvite ? '@' : item.name.substring(0, 2).toUpperCase();
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${item.isInvite ? 'from-gray-300 to-gray-400' : avatarGradients[idx % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                                {avatarText}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${item.isInvite ? 'text-gray-500 italic' : 'text-gray-900'}`}>{item.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{item.email}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{item.department || '-'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.color}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Invite Agent Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              {generatedInviteLink ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Invitation Created</h2>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-amber-800 text-sm">
                    <strong>Note:</strong> Email dispatch is currently disabled. Please manually share the secure link below with the agent.
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secure Setup Link</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedInviteLink}
                          className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedInviteLink)}
                          className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={closeInviteModal}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Agent</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Send an invitation link for a new agent to set up their account.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Agent name</label>
                      <input
                        type="text"
                        placeholder="Agent name"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        disabled={isInviting}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="agent@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={isInviting}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors ${
                          inviteError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {inviteError && <p className="text-xs text-red-600 mt-1">{inviteError}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={closeInviteModal}
                      disabled={isInviting}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInviteAgent}
                      disabled={isInviting}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminPageGuard>
  );
}
