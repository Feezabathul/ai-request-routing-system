import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface RequestHeaderProps {
  title: string;
  requestId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: string;
  priority: string;
}

export const RequestHeader: React.FC<RequestHeaderProps> = ({
  title,
  requestId,
  customerName,
  customerEmail,
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
    <Card className="p-6 bg-white bg-opacity-20 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">ID: {requestId}</p>
          <p className="text-sm text-gray-600">
            {customerName} &lt;{customerEmail}&gt;
          </p>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
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
