import React from 'react';
import { Badge } from '@/components/ui/badge';

export const RealtimeIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-block h-3 w-3 rounded-full bg-green-500" />
      </span>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Live activity
      </Badge>
    </div>
  );
};
