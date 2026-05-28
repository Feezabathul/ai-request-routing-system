"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Placeholder enums – replace with actual values from your schema.
const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function RequestsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // TODO: replace with real data fetching (e.g., SWR, TanStack Query).
  // For now we simulate a loading state.
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Placeholder rows – in production fetch from API.
  const rows = [
    { id: '1', subject: 'Billing Issue', status: 'OPEN', priority: 'HIGH' },
    { id: '2', subject: 'Login Bug', status: 'IN_PROGRESS', priority: 'MEDIUM' },
    { id: '3', subject: 'Feature Request', status: 'RESOLVED', priority: 'LOW' },
  ].filter((r) =>
    (statusFilter ? r.status === statusFilter : true) &&
    (priorityFilter ? r.priority === priorityFilter : true)
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">All Requests</h1>
          <button
            onClick={() => router.back()}
            className="btn btn-secondary btn-sm"
          >
            Back to Dashboard
          </button>
        </header>

        {/* Filters */}
        <section className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </section>

        {/* Table */}
        <section className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-sm overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Subject</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Priority</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                    <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
                    <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded w-1/3" /></td>
                    <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded w-1/4" /></td>
                  </tr>
                ))
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-800">{row.subject}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.status}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{row.priority}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/dashboard/requests/${row.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Pagination placeholder */}
        <nav className="flex justify-center space-x-2 mt-4">
          <button className="btn btn-secondary btn-sm disabled:opacity-50" disabled>
            Prev
          </button>
          <span className="text-sm text-gray-600">Page 1 of 1</span>
          <button className="btn btn-secondary btn-sm" disabled>
            Next
          </button>
        </nav>
      </div>
    </main>
  );
}
