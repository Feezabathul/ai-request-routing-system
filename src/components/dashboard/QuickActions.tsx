import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, ListBulletIcon, Squares2X2Icon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="primary" className="flex items-center justify-center space-x-2">
        <PlusIcon className="h-5 w-5" />
        <span>Create Request</span>
      </Button>
      <Button variant="secondary" className="flex items-center justify-center space-x-2">
        <ListBulletIcon className="h-5 w-5" />
        <span>View Requests</span>
      </Button>
      <Button variant="outline" className="flex items-center justify-center space-x-2">
        <Squares2X2Icon className="h-5 w-5" />
        <span>Open Dashboard</span>
      </Button>
      <Button variant="danger" className="flex items-center justify-center space-x-2">
        <Cog6ToothIcon className="h-5 w-5" />
        <span>Manage Agents</span>
      </Button>
    </div>
  );
};
