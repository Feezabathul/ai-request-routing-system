import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface AIClassificationProps {
  classification: string;
  confidence: number; // 0-100
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
}

export const AIClassification: React.FC<AIClassificationProps> = ({
  classification,
  confidence,
  status,
  summary = 'No summary available.',
}) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-200 text-gray-800',
    processing: 'bg-purple-200 text-purple-800',
    completed: 'bg-green-200 text-green-800',
    failed: 'bg-red-200 text-red-800',
  };

  const statusIcon = {
    pending: <CheckCircle className="w-4 h-4" />,
    processing: <CheckCircle className="w-4 h-4 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />, // simple icon for failure
  }[status];

  return (
    <Card className="p-6 bg-white bg-opacity-10 backdrop-blur-sm border border-white/20">
      <div className="flex items-center mb-4">
        <Badge variant="default" className={statusColors[status] || ''}>
          {statusIcon} {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
      <h3 className="mb-2 text-lg font-medium text-white">AI Classification</h3>
      <p className="mb-2 text-sm text-gray-300">Category: {classification}</p>
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded h-2">
          <div
            className="bg-indigo-600 h-2 rounded"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-300">{summary}</p>
    </Card>
  );
};
