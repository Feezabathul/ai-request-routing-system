"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequestHeader } from '@/components/request-details/RequestHeader';
import { RequestInfo } from '@/components/request-details/RequestInfo';
import { Timeline, TimelineEvent } from '@/components/requests/Timeline';
import { PlusCircle, Shield, UserCheck, Sparkles } from 'lucide-react';
import { getUserRole, UserRole } from '@/lib/role';
import { getActiveAgentsByDepartment } from '@/lib/agents';
import { getRequestDepartment, type Department } from '@/lib/departments';
import {
  assignAgentToRequest,
  getRequestById,
  StoredRequest,
  updateRequest,
  type RequestStatus,
} from '@/lib/request-storage';
import { getCurrentAgent } from '@/lib/agents';

const Notes: React.FC<{ requestId: string }> = ({ requestId }) => {
  const [notes, setNotes] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const loadNotesTimer = window.setTimeout(() => {
      const stored = localStorage.getItem(`notes_${requestId}`);
      if (stored) setNotes(JSON.parse(stored));
    }, 0);

    return () => window.clearTimeout(loadNotesTimer);
  }, [requestId]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now().toString(), text: newNote.trim(), createdAt: new Date().toISOString() };
    const updated = [note, ...notes];
    setNotes(updated);
    setNewNote('');
    localStorage.setItem(`notes_${requestId}`, JSON.stringify(updated));
  };

  return (
    <Card className="border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <h3 className="mb-2 text-lg font-medium text-white">Notes</h3>
      <div className="mb-4 flex flex-col gap-2">
        <textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(event) => setNewNote(event.target.value)}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          rows={3}
        />
        <Button onClick={addNote} variant="primary" className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" /> Add
        </Button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-gray-400">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="text-sm text-gray-300">
              <p>{note.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const StatusUpdate: React.FC<{
  request: StoredRequest;
  onUpdate: (status: RequestStatus) => void;
}> = ({ request, onUpdate }) => {
  const statuses: RequestStatus[] = ['Pending', 'In Progress', 'AI Processing', 'Resolved', 'Closed'];

  return (
    <Card className="border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <h3 className="mb-2 text-lg font-medium text-white">Update Status</h3>
      <div className="flex flex-col gap-2">
        <select
          className="w-full rounded border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          value={request.status}
          onChange={(event) => onUpdate(event.target.value as RequestStatus)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button onClick={() => onUpdate(request.status)} variant="primary" className="mt-2 w-full">
          Save
        </Button>
      </div>
    </Card>
  );
};

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Shield className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-sm text-gray-500">
        Agents can only view requests assigned to them.
      </p>
      <Button onClick={onBack} variant="primary" className="mt-6">
        Back to Requests
      </Button>
    </section>
  );
}

export default function RequestDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<StoredRequest | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const loadRequestTimer = window.setTimeout(() => {
      const found = getRequestById(id);
      const userRole = getUserRole();
      setRole(userRole);

      if (!found) {
        setLoading(false);
        return;
      }

      if (userRole === 'AGENT') {
        const currentAgent = getCurrentAgent();
        if (!currentAgent || found.assignedAgentId !== currentAgent.id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }

      setRequest(found);
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(loadRequestTimer);
  }, [id]);

  const handleStatusUpdate = (newStatus: RequestStatus) => {
    if (!request) return;
    const updated = updateRequest(id, { status: newStatus });
    if (updated) setRequest(updated);
  };

  const requestDepartment: Department = request
    ? getRequestDepartment(request)
    : 'General Support';

  const aiCategory = request?.aiCategory ?? requestDepartment;
  const aiConfidence = request?.aiConfidence;

  const matchingAgents = getActiveAgentsByDepartment(requestDepartment);

  const handleSaveAssignment = () => {
    if (!request || !selectedAgentId || role !== 'ADMIN') return;

    const agent = matchingAgents.find((item) => item.id === selectedAgentId);
    if (!agent) return;

    const updated = assignAgentToRequest(request.id, {
      id: agent.id,
      name: agent.name,
      department: agent.department,
    });

    if (updated) {
      setRequest(updated);
      setShowAssignment(false);
      setSelectedAgentId('');
    }
  };

  const openAssignment = () => {
    setSelectedAgentId(request?.assignedAgentId ?? '');
    setShowAssignment(true);
  };

  if (loading) {
    return <p className="p-4 text-gray-600">Loading...</p>;
  }

  if (accessDenied) {
    return <AccessDenied onBack={() => router.push('/dashboard/requests')} />;
  }

  if (!request) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Request not found.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-2">
          Go Back
        </Button>
      </div>
    );
  }

  const timelineEvents: TimelineEvent[] = [
    { id: '1', type: 'REQUEST_CREATED', createdAt: request.createdAt },
    {
      id: '2',
      type: 'AI_CLASSIFIED',
      createdAt: request.createdAt,
      metadata: { classification: aiCategory, confidence: aiConfidence },
    },
    ...(request.assignedAt
      ? [{ id: '3', type: 'ASSIGNED_CHANGED' as const, createdAt: request.assignedAt }]
      : []),
  ];

  const assignedName = request.assignedAgentName ?? request.assignedAgent;

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-4">
      <RequestHeader
        title={request.title}
        requestId={request.id}
        customerName={request.customerName}
        customerEmail={request.customerEmail}
        createdAt={request.createdAt}
        status={request.status}
        priority={request.priority}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RequestInfo
          request={{
            description: request.description,
            category: aiCategory,
            assignedAgent: assignedName ?? 'Not Assigned',
            assignedAgentDepartment: request.assignedAgentDepartment,
            assignedAt: request.assignedAt,
            workflowStatus: request.status,
          }}
        />

        <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">AI Classification</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Category</span>
              <Badge className="bg-indigo-100 text-indigo-800">{aiCategory}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Confidence</span>
              <span className="font-semibold text-gray-900">
                {aiConfidence != null ? `${aiConfidence}%` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-indigo-100 pt-3">
              <span className="text-gray-600">Assigned Agent</span>
              <span className="font-medium text-gray-900">
                {assignedName ?? 'Not Assigned'}
              </span>
            </div>
            {role === 'ADMIN' && (
              <p className="text-xs text-gray-500">
                Assign Agent shows only agents in {aiCategory}.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assigned Agent</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Assigned Agent:</span>{' '}
                  {assignedName ?? 'Not Assigned'}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Department:</span>{' '}
                  {request.assignedAgentDepartment ?? (assignedName ? requestDepartment : '—')}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Assigned Date:</span>{' '}
                  {request.assignedAt ?? 'Not Assigned'}
                </p>
              </div>
            </div>
          </div>

          {role === 'ADMIN' && (
            <Button onClick={openAssignment} variant="primary">
              {assignedName ? 'Change Agent' : 'Assign Agent'}
            </Button>
          )}
        </div>

        {role === 'ADMIN' && showAssignment && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm text-gray-600">
              AI category: <strong>{aiCategory}</strong> — showing matching agents only
            </p>

            {matchingAgents.length === 0 ? (
              <p className="text-sm text-amber-700">
                No agents available in {aiCategory} department
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedAgentId}
                  onChange={(event) => setSelectedAgentId(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select agent</option>
                  {matchingAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} — {agent.department}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleSaveAssignment}
                  variant="primary"
                  disabled={!selectedAgentId}
                >
                  Save Assignment
                </Button>
                <Button
                  onClick={() => setShowAssignment(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Timeline events={timelineEvents} />
      <Notes requestId={request.id} />
      <StatusUpdate request={request} onUpdate={handleStatusUpdate} />
    </section>
  );
}
