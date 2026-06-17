'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequestHeader } from '@/components/request-details/RequestHeader';
import { RequestInfo } from '@/components/request-details/RequestInfo';
import { Shield, Sparkles, UserCheck, CheckCircle } from 'lucide-react';
import { getCurrentUser, type CurrentUser } from '@/lib/current-user';
import { formatAiCategoryLabel } from '@/lib/departments';

export default function RequestDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  
  const [request, setRequest] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchRequest = async () => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      const res = await fetch(`/api/requests/${id}`);
      if (res.ok) {
        const payload = await res.json();
        const reqData = payload.data?.request || payload.request;
        setRequest(reqData);
      } else {
        setError('Request not found or access denied');
      }
      
      if (currentUser?.role === 'ADMIN') {
        const agentsRes = await fetch('/api/agents');
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgents(agentsData.agents || []);
        }
      }
    } catch (err) {
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <RequestHeader
        title={request.subject}
        requestId={request.id}
        createdByName={request.customerName}
        createdByEmail={request.customerEmail}
        createdAt={request.createdAt}
        status={request.status}
        priority={request.priority}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RequestInfo
          request={{
            description: request.message,
            category: formatAiCategoryLabel(request.aiClassifications?.[0]?.label),
            assignedAgent: request.assignedTo?.name || 'Not Assigned',
            assignedAgentDepartment: request.assignedTo?.department,
            assignedAt: request.updatedAt,
            workflowStatus: request.status,
          }}
        />

        <div className="space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-500" /> Assignment
            </h3>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4">
              <p className="text-sm text-slate-500">Currently assigned to:</p>
              <p className="font-medium text-slate-900 mt-1">
                {request.assignedTo ? `${request.assignedTo.name} (${request.assignedTo.department || 'No dept'})` : 'No one'}
              </p>
            </div>

            {user?.role === 'ADMIN' && request.status !== 'RESOLVED' && (
              <div className="flex gap-2">
                <select 
                  value={selectedAgentId} 
                  onChange={e => setSelectedAgentId(e.target.value)}
                  className="flex-1 rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} - {a.department}</option>
                  ))}
                </select>
                <Button onClick={handleAssign} disabled={isAssigning || !selectedAgentId}>
                  Assign
                </Button>
              </div>
            )}
            
            {user?.role === 'AGENT' && request.assignedToId === user.id && request.status !== 'RESOLVED' && (
              <Button onClick={() => setShowResolveModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2" /> Mark as Resolved
              </Button>
            )}

            {request.status === 'RESOLVED' && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" /> Request Resolved
                </h4>
                <p className="text-sm italic">"{request.resolutionNote}"</p>
                <p className="text-xs mt-2 text-emerald-600">Resolved at: {new Date(request.resolvedAt).toLocaleString()}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Resolve Request</h3>
            <p className="text-sm text-slate-500 mb-4">Provide notes on how this was resolved. These will be sent to the customer.</p>
            
            <textarea
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              placeholder="Resolution notes..."
              className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4 resize-none"
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
  );
}
