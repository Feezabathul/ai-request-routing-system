import React, { useState, useEffect } from 'react';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileSearch } from 'lucide-react';
import { getUserRole } from '@/lib/role';

interface Request {
  id: string;
  title: string;
  customerName?: string;
  customerEmail?: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed' | 'Open';
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  assignedAgent?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
}

interface CurrentAgent {
  id: string;
}

export const RecentRequests: React.FC<{ className?: string }> = ({ className }) => {
  const [data, setData] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = () => {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem('requests');
      const storedRequests: Request[] = stored ? JSON.parse(stored) : [];
      const currentAgent: CurrentAgent | null = localStorage.getItem('currentAgent')
        ? JSON.parse(localStorage.getItem('currentAgent') || 'null')
        : null;
      const requests = getUserRole() === 'AGENT' && currentAgent
        ? storedRequests.filter((request) => request.assignedAgentId === currentAgent.id)
        : storedRequests;
      
      // Show only the 5 most recent requests
      const sorted = requests
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      setData(sorted);
      setLoading(false);
    };

    loadRequests();
    
    // Listen for storage changes
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  const columns: Array<{ header: string; accessor: keyof Request | ((row: Request) => React.ReactNode); className?: string }> = [
    { header: 'Title', accessor: 'title' },
    {
      header: 'Status',
      accessor: (row: Request) => (
        <Badge
          variant="default"
          className={
            row.status === 'Pending'
              ? 'bg-gray-100 text-gray-800'
              : row.status === 'In Progress'
              ? 'bg-blue-100 text-blue-800'
              : row.status === 'Resolved'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Priority',
      accessor: (row: Request) => (
        <Badge
          variant="default"
          className={
            row.priority === 'Urgent'
              ? 'bg-red-100 text-red-800'
              : row.priority === 'High'
              ? 'bg-orange-100 text-orange-800'
              : row.priority === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }
        >
          {row.priority}
        </Badge>
      ),
    },
    { header: 'Agent', accessor: (row: Request) => row.assignedAgentName ?? row.assignedAgent ?? '-' },
    { header: 'Created', accessor: (row: Request) => new Date(row.createdAt).toLocaleDateString() },
  ];

  if (loading) {
    return (
      <section className={`space-y-4 ${className ?? ''}`}>
        <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
        <Table columns={columns} data={[]} loading={true} />
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className={`space-y-4 ${className ?? ''}`}>
        <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
        <div className="text-center py-8 flex flex-col items-center">
          <FileSearch className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No recent requests available</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`space-y-4 ${className ?? ''}`}>
      <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
      <Table columns={columns} data={data} loading={false} />
    </section>
  );
};
