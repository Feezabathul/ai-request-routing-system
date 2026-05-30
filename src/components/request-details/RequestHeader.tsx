import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface RequestHeaderProps {
  title: string;
  requestId: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  status: string;
  priority: string;
}

export const RequestHeader: React.FC<RequestHeaderProps> = ({
  title,
  requestId,
  createdByName,
  createdByEmail,
  createdAt,
  status,
  priority,
}) => {
  const statusColors: Record<string, string> = {
    Pending: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'AI Processing': 'bg-purple-100 text-purple-800',
    Resolved: 'bg-green-100 text-green-800',
    Closed: 'bg-red-100 text-red-800',
  };

  const priorityColors: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Urgent: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="bg-white bg-opacity-20 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">ID: {requestId}</p>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Created By:</span> {createdByName}
            </p>
            <p>
              <span className="font-medium text-gray-800">Email:</span> {createdByEmail}
            </p>
          </div>
          <p className="mt-1 flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-2 flex space-x-2 sm:mt-0">
          <Badge variant="default" className={statusColors[status] || ''}>
            {status}
          </Badge>
          <Badge variant="default" className={priorityColors[priority] || ''}>
            {priority}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
