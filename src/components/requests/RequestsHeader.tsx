import React from 'react';
import { Button } from '@/components/ui/button';

interface RequestsHeaderProps {
  title?: string;
  description?: string;
  onCreate?: () => void;
}

export const RequestsHeader: React.FC<RequestsHeaderProps> = ({
  title = 'Customer Requests',
  description = 'View and manage all customer requests in one place.',
  onCreate,
}) => (
  <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
    {onCreate && (
      <Button
        onClick={onCreate}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Create Request
      </Button>
    )}
  </header>
);
