import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cog6ToothIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ProcessingItem {
  id: string;
  title: string;
  confidence: number; // 0-100
  status: 'processing' | 'completed' | 'failed';
}

export const AIProcessing: React.FC<{ className?: string }> = ({ className }) => {
  const mock: ProcessingItem[] = [
    { id: '1', title: 'Ticket #12345', confidence: 87, status: 'processing' },
    { id: '2', title: 'Ticket #12346', confidence: 92, status: 'processing' },
    { id: '3', title: 'Ticket #12347', confidence: 78, status: 'processing' },
  ];

  const statusIcon = (status: ProcessingItem['status']) => {
    switch (status) {
      case 'processing':
        return <Cog6ToothIcon className="h-5 w-5 text-indigo-400 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <section className={`space-y-4 ${className ?? ''}`}>
      <h2 className="text-xl font-semibold text-gray-800">AI Processing</h2>
      <Card className="p-4 space-y-3 bg-white bg-opacity-10 backdrop-blur-xl">
        {mock.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {statusIcon(item.status)}
              <p className="text-sm text-white">{item.title}</p>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              Confidence: {item.confidence}%
            </Badge>
          </div>
        ))}
      </Card>
    </section>
  );
};
