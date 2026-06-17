'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { type CurrentUser } from '@/lib/current-user';
import { Bot, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface AgentQueueProps {
  user: CurrentUser;
}

type QueueItem = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  customerName: string;
};

export const AgentQueue: React.FC<AgentQueueProps> = ({ user }) => {
  const [requests, setRequests] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/queue`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useRealtimeUpdates(fetchQueue);

  const pending = requests.filter(r => r.status === 'OPEN').length;
  const inProgress = requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'WAITING_ON_CUSTOMER').length;
  const resolved = requests.filter(r => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your assigned requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-sm text-slate-500 font-medium">Assigned</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{requests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-sm text-slate-500 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-sm text-slate-500 font-medium">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgress}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-sm text-slate-500 font-medium">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{resolved}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading queue...</div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Your queue is empty</h3>
            <p className="text-sm text-slate-500 mt-1">You have no pending requests assigned to you.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/dashboard/requests/${req.id}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">{req.subject}</td>
                  <td className="px-6 py-4 text-slate-600">{req.customerName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      req.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                      req.status === 'OPEN' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      req.priority === 'URGENT' ? 'bg-red-50 text-red-700' :
                      req.priority === 'HIGH' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
