import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cog6ToothIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { getUserRole } from '@/lib/role';

interface Request {
  id: string;
  title: string;
  aiStatus?: 'Processing' | 'Completed' | 'Failed';
  aiConfidence?: number;
  assignedAgentId?: string;
}

interface CurrentAgent {
  id: string;
}

interface ProcessingItem {
  id: string;
  title: string;
  confidence: number;
  status: 'processing' | 'completed' | 'failed';
}

export const AIProcessing: React.FC<{ className?: string }> = ({ className }) => {
  const [items, setItems] = useState<ProcessingItem[]>([]);

  useEffect(() => {
    const loadProcessingItems = () => {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem('requests');
      const storedRequests: Request[] = stored ? JSON.parse(stored) : [];
      const currentAgent: CurrentAgent | null = localStorage.getItem('currentAgent')
        ? JSON.parse(localStorage.getItem('currentAgent') || 'null')
        : null;
      const requests = getUserRole() === 'AGENT' && currentAgent
        ? storedRequests.filter((request) => request.assignedAgentId === currentAgent.id)
        : storedRequests;
      
      // Filter requests that are currently processing or have completed/failed
      const processing = requests
        .filter(r => r.aiStatus && ['Processing', 'Completed', 'Failed'].includes(r.aiStatus))
        .map(r => ({
          id: r.id,
          title: r.title,
          confidence: r.aiConfidence || 0,
          status: (r.aiStatus?.toLowerCase() || 'processing') as 'processing' | 'completed' | 'failed',
        }));
      
      setItems(processing);
    };

    loadProcessingItems();
    
    // Listen for storage changes
    window.addEventListener('storage', loadProcessingItems);
    return () => window.removeEventListener('storage', loadProcessingItems);
  }, []);

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
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No AI processing in progress</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {statusIcon(item.status)}
                <p className="text-sm text-white">{item.title}</p>
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Confidence: {item.confidence}%
              </Badge>
            </div>
          ))
        )}
      </Card>
    </section>
  );
};
