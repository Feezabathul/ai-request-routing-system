"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtime } from '@/hooks/useRealtime';
import { RequestInfo } from '@/components/requests/RequestInfo';
import { AiClassification } from '@/components/requests/AiClassification';
import { Timeline, TimelineEvent } from '@/components/requests/Timeline';
import { NotesList, Note } from '@/components/requests/NotesList';
import { AddNoteForm } from '@/components/requests/AddNoteForm';
import { RequestActions } from '@/components/requests/RequestActions';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner'; // assume a simple spinner component exists

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [request, setRequest] = useState<any>(null);
  const [classification, setClassification] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Placeholder: simulate fetching initial data
  useEffect(() => {
    // In a real app, replace with API calls
    const fakeRequest = {
      id,
      title: 'Sample Request',
      description: 'Lorem ipsum dolor sit amet.',
      status: 'OPEN',
      priority: 'MEDIUM',
      assignedAgent: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const fakeClassification = {
      predictedCategory: 'Billing',
      confidenceScore: 0.92,
      suggestedPriority: 'HIGH',
      processingStatus: 'COMPLETED',
      processingTimeMs: 1520,
    };
    const fakeTimeline: TimelineEvent[] = [
      { id: '1', type: 'REQUEST_CREATED', createdAt: new Date().toISOString() },
    ];
    const fakeNotes: Note[] = [];
    setRequest(fakeRequest);
    setClassification(fakeClassification);
    setTimeline(fakeTimeline);
    setNotes(fakeNotes);
    setLoading(false);
  }, [id]);

  // Realtime subscription – placeholder handlers update state
  useRealtime(`request_${id}`, {
    onMessage: (msg) => {
      // Expect payload shape { type: 'event', data: {...} }
      const { type, data } = msg as any;
      switch (type) {
        case 'AI_CLASSIFIED':
          setClassification(data);
          break;
        case 'STATUS_CHANGED':
          setRequest((prev: any) => ({ ...prev, status: data.status }));
          break;
        case 'NOTE_ADDED':
          setNotes((prev) => [...prev, data]);
          break;
        case 'EVENT':
          setTimeline((prev) => [...prev, data]);
          break;
        default:
          console.warn('Unhandled realtime type', type);
      }
    },
  });

  const handleRetryClassification = () => {
    // Placeholder – invoke backend endpoint to retry classification
    console.log('Retry classification');
  };

  const handleAddNote = (content: string) => {
    // Placeholder – call API to add note, then realtime will push NOTE_ADDED
    const newNote: Note = {
      id: `${Date.now()}`,
      authorId: 'self',
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar could be added here from dashboard layout */}
      <main className="flex-1 p-6 overflow-auto">
        <section className="mb-8">
          <RequestInfo request={request} />
        </section>

        <section className="mb-8">
          <AiClassification classification={classification} onRetry={handleRetryClassification} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <Timeline events={timeline} />
          </div>
          <div>
            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 p-4">
              <h3 className="mb-2 text-lg font-medium text-white">Internal Notes</h3>
              <NotesList notes={notes} />
              <AddNoteForm onAdd={handleAddNote} />
            </Card>
          </div>
        </section>

        <section className="flex justify-end space-x-4">
          <RequestActions request={request} onUpdate={() => console.log('update request')} />
        </section>
      </main>
    </div>
  );
}
