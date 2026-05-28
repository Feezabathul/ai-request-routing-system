import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface TimelineEvent {
  id: string;
  type: 'REQUEST_CREATED' | 'AI_CLASSIFIED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'ASSIGNED_CHANGED' | 'PRIORITY_CHANGED';
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Renders a chronological timeline of request events.
 * Each event shows a type badge, timestamp and optional metadata.
 */
export const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 p-4 space-y-4">
      <h3 className="mb-2 text-lg font-medium text-white">Timeline</h3>
      <ul className="space-y-3">
        {events.map((e) => (
          <li key={e.id} className="flex items-start space-x-3">
            <Badge variant="status" className="flex-shrink-0 mt-0.5">
              {e.type.replace('_', ' ')}
            </Badge>
            <div className="text-sm text-gray-300">
              <p>{new Date(e.createdAt).toLocaleString()}</p>
              {e.metadata && (
                <pre className="mt-1 rounded bg-gray-800 p-1 text-xs text-gray-100 overflow-x-auto">
                  {JSON.stringify(e.metadata, null, 2)}
                </pre>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
