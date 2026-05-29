import React from 'react';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Request {
  title: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  agent: string;
  created: string;
}

// Columns with badge rendering for status and priority
const columns: Array<{ header: string; accessor: keyof Request | ((row: Request) => React.ReactNode); className?: string }> = [
  { header: 'Title', accessor: 'title' },
  {
    header: 'Status',
    accessor: (row: Request) => (
      <Badge
        variant="default"
        className={
          row.status === 'Open'
            ? 'bg-green-100 text-green-800'
            : row.status === 'In Progress'
            ? 'bg-yellow-100 text-yellow-800'
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
          row.priority === 'High'
            ? 'bg-red-100 text-red-800'
            : row.priority === 'Medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }
      >
        {row.priority}
      </Badge>
    ),
  },
  { header: 'Agent', accessor: 'agent' },
  { header: 'Created', accessor: 'created' },
];

// Placeholder data – to be replaced by real API
const data: Request[] = [
  { title: 'Unable to login', status: 'Open', priority: 'High', agent: '—', created: '2024-11-02' },
  { title: 'Payment processing error', status: 'In Progress', priority: 'Medium', agent: 'Alice', created: '2024-11-01' },
  { title: 'Feature request: Dark mode', status: 'Resolved', priority: 'Low', agent: 'Bob', created: '2024-10-28' },
];

export const RecentRequests: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <section className={`space-y-4 ${className ?? ''}`}>
      <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
      <Table columns={columns} data={data} loading={false} />
    </section>
  );
};
