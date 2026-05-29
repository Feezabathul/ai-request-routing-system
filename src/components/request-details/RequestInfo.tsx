import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


interface RequestInfoProps {
  request: {
    description?: string;
    category: string;
    assignedAgent?: string;
    workflowStatus?: string;
    // any other fields ignored
  };
}

export const RequestInfo: React.FC<RequestInfoProps> = ({ request }) => {
  const { description = 'No description provided.', category, assignedAgent, workflowStatus = 'N/A' } = request;
  return (
    <Card className="bg-white bg-opacity-20 backdrop-blur-sm p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Request Information</h2>
      <div className="grid gap-2">
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Category:</span>
          <Badge variant="default" className="bg-gray-100 text-gray-800">{category}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Assigned:</span>
          <Badge variant="default" className="bg-indigo-100 text-indigo-800">
            {assignedAgent ?? 'Unassigned'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Workflow:</span>
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            {workflowStatus}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
