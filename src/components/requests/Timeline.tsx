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
  const renderMessage = (event: TimelineEvent) => {
    switch (event.type) {
      case 'REQUEST_CREATED':
        return 'Request created';
      case 'AI_CLASSIFIED':
        return `AI classified request as ${event.metadata?.classification ?? ''} with ${event.metadata?.confidence ?? ''}% confidence`;
      case 'STATUS_CHANGED':
        return `Status changed from ${event.metadata?.from ?? ''} to ${event.metadata?.to ?? ''}`;
      case 'NOTE_ADDED':
        return `Note added`;
      default:
        return event.type.replace('_', ' ');
    }
  };

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
              <p>{renderMessage(e)}</p>
              <p className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
