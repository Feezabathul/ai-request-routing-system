import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface RequestInfoProps {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignedAgent?: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Displays core request information in a glass‑styled card.
 */
export const RequestInfo: React.FC<RequestInfoProps> = ({ request }) => {
  return (
    <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 p-6">
      <h2 className="mb-4 text-xl font-semibold text-white">Request Details</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-300">Title</p>
          <p className="text-lg font-medium text-white">{request.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">Status</p>
          <Badge variant="secondary" className="mt-1">
            {request.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-300">Priority</p>
          <Badge variant="default" className="mt-1">
            {request.priority}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-300">Assigned Agent</p>
          <p className="text-white">{request.assignedAgent ?? 'Unassigned'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-300">Description</p>
          <p className="text-white">{request.description}</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">Created</p>
          <p className="text-white">{new Date(request.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">Updated</p>
          <p className="text-white">{new Date(request.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
};
