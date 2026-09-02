/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestHeader } from '@/components/request-details/RequestHeader';
import { RequestInfo } from '@/components/request-details/RequestInfo';
import { Shield, UserCheck, CheckCircle } from 'lucide-react';
import { getCurrentUser, type CurrentUser } from '@/lib/current-user';
import { formatAiCategoryLabel } from '@/lib/departments';

interface RequestDetail {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: string;
  priority: string;
  message: string;
  aiClassifications?: Array<{ label?: string }>; 
  assignedTo?: { name?: string; department?: string | null };
  assignedToId?: string;
  updatedAt?: string;
  resolutionNote?: string;
  resolvedAt?: string;
}

interface AgentOption {
  id: string;
  name: string;
  department?: string | null;
}

export default function RequestDetailPage() {
  const { id } = useParams();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchRequest = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      const res = await fetch(`/api/requests/${id}`);
      if (res.ok) {
        const payload = await res.json();
        const reqData = payload.data?.request || payload.request;
        setRequest(reqData as RequestDetail);
      } else {
        setError('Request not found or access denied');
      }

      if (currentUser?.role === 'ADMIN') {
        const agentsRes = await fetch('/api/agents');
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgents((agentsData.agents || []) as AgentOption[]);
        }
      }
    } catch {
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchRequest();
  }, [fetchRequest]);

  const handleAssign = async () => {
    if (!selectedAgentId) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/requests/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId })
      });
      if (res.ok) {
        fetchRequest(); // Refresh
      } else {
        alert('Failed to assign request');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) return;
    setIsResolving(true);
    try {
      const res = await fetch(`/api/requests/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNote })
      });
      if (res.ok) {
        setShowResolveModal(false);
        fetchRequest(); // Refresh
      } else {
        alert('Failed to resolve request');
      }
    } finally {
      setIsResolving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (error || !request) return <div className="p-8 text-center text-red-500">{error || 'Not found'}</div>;

  const statusTone =
    request.status === 'RESOLVED'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : request.status === 'IN_PROGRESS'
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : request.status === 'PENDING'
          ? 'bg-amber-100 text-amber-700 border border-amber-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200';

  const priorityTone =
    request.priority === 'Urgent'
      ? 'bg-rose-100 text-rose-700 border border-rose-200'
      : request.priority === 'High'
        ? 'bg-orange-100 text-orange-700 border border-orange-200'
        : request.priority === 'Medium'
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          : 'bg-emerald-100 text-emerald-700 border border-emerald-200';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <RequestHeader
            title={request.subject}
            requestId={request.id}
            createdByName={request.customerName}
            createdByEmail={request.customerEmail}
            createdAt={request.createdAt}
            status={request.status}
            priority={request.priority}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-6">
            <Card className="border border-slate-200 bg-white p-0 shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Request Overview</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                      {request.status}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <RequestInfo
                  request={{
                    description: request.message,
                    category: formatAiCategoryLabel(request.aiClassifications?.[0]?.label),
                    assignedAgent: request.assignedTo?.name || 'Not Assigned',
                    assignedAgentDepartment: request.assignedTo?.department ?? undefined,
                    assignedAt: request.updatedAt,
                    workflowStatus: request.status,
                  }}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-slate-200 bg-white p-0 shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <UserCheck className="h-5 w-5 text-indigo-600" /> Assignment & Status
                </h3>
              </div>

              <div className="space-y-5 p-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assigned agent</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {request.assignedTo ? `${request.assignedTo.name} (${request.assignedTo.department || 'No dept'})` : 'No one assigned yet'}
                  </p>
                </div>

                {user?.role === 'ADMIN' && request.status !== 'RESOLVED' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Choose agent</label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={selectedAgentId}
                        onChange={e => setSelectedAgentId(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Select Agent...</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name} - {a.department}</option>
                        ))}
                      </select>
                      <Button onClick={handleAssign} disabled={isAssigning || !selectedAgentId} className="whitespace-nowrap">
                        Assign
                      </Button>
                    </div>
                  </div>
                )}

                {user?.role === 'AGENT' && request.assignedToId === user.id && request.status !== 'RESOLVED' && (
                  <Button onClick={() => setShowResolveModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                  </Button>
                )}

                {request.status === 'RESOLVED' && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <div className="mb-2 flex items-center gap-2 font-semibold">
                      <CheckCircle className="h-4 w-4" /> Request Resolved
                    </div>
                    <p className="text-sm italic text-emerald-700">{request.resolutionNote ?? ''}</p>
                    <p className="mt-3 text-xs text-emerald-600">Resolved at: {request.resolvedAt ? new Date(request.resolvedAt).toLocaleString() : ''}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {showResolveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="text-xl font-bold">Resolve Request</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">Provide notes on how this was resolved. These will be sent to the customer.</p>

              <textarea
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Resolution notes..."
                className="mb-4 h-32 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowResolveModal(false)}>Cancel</Button>
                <Button onClick={handleResolve} disabled={isResolving || !resolutionNote.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                  Confirm Resolution
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
