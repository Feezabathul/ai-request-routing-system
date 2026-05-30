"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RequestsHeader } from '@/components/requests/RequestsHeader';
import { SearchBar } from '@/components/requests/SearchBar';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, FileSearch } from 'lucide-react';
import { getUserRole, UserRole } from '@/lib/role';
import { getCurrentAgent } from '@/lib/agents';

interface Request {
  id: string;
  title: string;
  customerName: string;
  customerEmail: string;
  category: string;
  aiCategory?: string;
  aiConfidence?: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'AI Processing' | 'Resolved' | 'Closed';
  assignedAgent?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdAt: string;
}

interface CurrentAgent {
  id: string;
  name: string;
  email: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', agent: '' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Request[]>([]);
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentAgent, setCurrentAgent] = useState<CurrentAgent | null>(null);

  // Load requests from localStorage
  useEffect(() => {
    const loadRequests = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("requests");
        setData(stored ? JSON.parse(stored) : []);
      }
      setLoading(false);
    };

    loadRequests();
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  useEffect(() => {
    const loadSessionTimer = window.setTimeout(() => {
      setRole(getUserRole());
      setCurrentAgent(getCurrentAgent());
    }, 0);

    return () => window.clearTimeout(loadSessionTimer);
  }, []);

  const visibleData = role === 'AGENT' && currentAgent
    ? data.filter((request) => request.assignedAgentId === currentAgent.id)
    : data;

  const filtered = visibleData.filter((r) => {
    const matchesQuery =
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = !filters.status || r.status === filters.status;
    const matchesPriority = !filters.priority || r.priority === filters.priority;
    const matchesCategory = !filters.category || r.category === filters.category;
    const matchesAgent = !filters.agent || r.assignedAgentId === filters.agent || r.assignedAgentName === filters.agent;
    return matchesQuery && matchesStatus && matchesPriority && matchesCategory && matchesAgent;
  });

  const columns: Array<{ header: string; accessor: keyof Request | ((row: Request) => React.ReactNode); className?: string }> = [
    {
      header: 'Title',
      accessor: (row: Request) => (
        <Link href={`/dashboard/requests/${row.id}`} className="text-indigo-600 hover:underline">
          {row.title}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessor: (row: Request) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{row.customerName}</p>
          <p className="text-xs text-gray-600">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'AI Category',
      accessor: (row: Request) => (
        <div>
          <span className="text-sm text-gray-800">{row.aiCategory ?? row.category}</span>
          {row.aiConfidence != null && (
            <span className="ml-1 text-xs text-gray-500">({row.aiConfidence}%)</span>
          )}
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: (row: Request) => (
        <Badge
          variant="default"
          className={
            row.priority === 'Low'
              ? 'bg-green-100 text-green-800'
              : row.priority === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : row.priority === 'High'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {row.priority}
        </Badge>
      ),
    },
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
              : row.status === 'AI Processing'
              ? 'bg-purple-100 text-purple-800'
              : row.status === 'Resolved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    { header: 'Agent', accessor: (row: Request) => row.assignedAgentName ?? row.assignedAgent ?? '-' },
    {
      header: 'Created',
      accessor: (row: Request) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];
  return (
    <section className="max-w-7xl mx-auto p-4">
      <RequestsHeader onCreate={() => router.push('/dashboard/requests/create')} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <SearchBar query={query} onChange={setQuery} />
      </div>
      <RequestsFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <Table columns={columns} data={[]} loading={true} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <FileSearch className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {role === 'AGENT' ? 'No requests assigned to you yet' : 'No requests found'}
          </p>
          {role !== 'AGENT' && (
            <Button onClick={() => router.push('/dashboard/requests/create')} variant="primary" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Request
            </Button>
          )}
        </div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </section>
  );

}

