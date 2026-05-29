"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { RequestHeader } from '@/components/request-details/RequestHeader';
import { RequestInfo } from '@/components/request-details/RequestInfo';
import { AIClassification } from '@/components/request-details/AIClassification';
import { Timeline, TimelineEvent } from '@/components/requests/Timeline';
import { PlusCircle } from 'lucide-react';

// Simple notes UI – defined inline for brevity
const Notes: React.FC<{ requestId: string }> = ({ requestId }) => {
  const [notes, setNotes] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`notes_${requestId}`) : null;
    if (stored) setNotes(JSON.parse(stored));
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
    <Card className="p-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white/20">
      <h3 className="mb-2 text-lg font-medium text-white">Notes</h3>
      <div className="flex flex-col gap-2 mb-4">
        <textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full bg-white text-gray-900 placeholder-gray-400 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
          rows={3}
        />
        <Button onClick={addNote} variant="primary" className="flex items-center gap-1">
          <PlusCircle className="w-4 h-4" /> Add
        </Button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-gray-400">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="text-sm text-gray-300">
              <p>{n.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// Status update component – simple dropdown
const StatusUpdate: React.FC<{ request: any; onUpdate: (status: string) => void }> = ({ request, onUpdate }) => {
  const statuses = ['Pending', 'In Progress', 'AI Processing', 'Resolved', 'Closed'];
  return (
    <Card className="p-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white/20">
      <h3 className="mb-2 text-lg font-medium text-white">Update Status</h3>
      <div className="flex flex-col gap-2">
        <select
          className="w-full rounded border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          value={request.status}
          onChange={(e) => onUpdate(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button onClick={() => onUpdate(request.status)} variant="primary" className="mt-2 w-full">Save</Button>
      </div>
    </Card>
  );
};

export default function RequestDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load request from localStorage (or fallback mock data)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('requests') : null;
    let data: any[] = [];
    if (stored) {
      data = JSON.parse(stored);
    } else {
      // fallback to mock (same as list page) – minimal example
      data = [];
    }
    const found = data.find((r) => r.id === id);
    if (found) setRequest(found);
    setLoading(false);
  }, [id]);

  const handleStatusUpdate = (newStatus: string) => {
    if (!request) return;
    const updated = { ...request, status: newStatus };
    setRequest(updated);
    // Update persisted list
    const stored = localStorage.getItem('requests');
    if (stored) {
      const list = JSON.parse(stored) as any[];
      const idx = list.findIndex((r) => r.id === id);
      if (idx !== -1) {
        list[idx] = updated;
        localStorage.setItem('requests', JSON.stringify(list));
      }
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-600">Loading...</p>;
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

  // Mock timeline events – could be extended later
  const timelineEvents: TimelineEvent[] = [
    { id: '1', type: 'REQUEST_CREATED', createdAt: request.createdAt },
    { id: '2', type: 'AI_CLASSIFIED', metadata: { classification: request.category, confidence: 92 }, createdAt: new Date().toISOString() },
    { id: '3', type: 'STATUS_CHANGED', metadata: { from: request.status, to: request.status }, createdAt: new Date().toISOString() },
  ];

  return (
    <section className="max-w-4xl mx-auto p-4 space-y-6">
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
        <RequestInfo request={request} />
        <AIClassification
          classification={request.category}
          confidence={92}
          status="completed"
          summary="AI confidently categorized the request."
        />
      </div>

      <Timeline events={timelineEvents} />
      <Notes requestId={request.id} />
      <StatusUpdate request={request} onUpdate={handleStatusUpdate} />
    </section>
  );
}
