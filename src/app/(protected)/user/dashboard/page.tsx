"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bell,
  User,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getCurrentUser, type CurrentUser } from '@/lib/current-user';

interface Request {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: { name: string } | null;
  resolutionNote?: string | null;
}

const statusLabel: Record<string, string> = {
  OPEN: 'Pending',
  IN_PROGRESS: 'In Progress',
  WAITING_ON_CUSTOMER: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const statusStyle: Record<string, string> = {
  OPEN: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  WAITING_ON_CUSTOMER: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-gray-100 text-gray-500',
};

const priorityStyle: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-orange-50 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const formatDate = (v: string) =>
  new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        const all: Request[] = data.data?.requests || [];
        // Only show this user's requests
        setRequests(all.filter((r: any) => r.createdById === userId));
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      router.replace('/admin/dashboard');
      return;
    }
    if (currentUser.role === 'AGENT') {
      router.replace('/agent/dashboard');
      return;
    }
    setUser(currentUser);
    fetchRequests(currentUser.id);
  }, [router, fetchRequests]);

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchRequests(user.id);
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'OPEN').length;
  const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length;
  const resolved = requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
  const recentRequests = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-0.5">{greeting} 👋</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {user.name}&apos;s Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/user/create-request"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-lg transition-all duration-200 shadow-md shadow-indigo-200/50"
            >
              <PlusCircle className="h-4 w-4" />
              New Request
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold text-slate-900">{total}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Total</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold text-slate-900">{pending}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Pending</span>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold text-blue-700">{inProgress}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">In Progress</span>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold text-emerald-700">{resolved}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Resolved</span>
          </div>
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/user/create-request"
              className="group flex items-center gap-4 p-4 rounded-xl ring-1 ring-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-700">Submit Request</p>
                <p className="text-xs text-slate-500">Open a new support ticket</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            <Link
              href="/user/requests"
              className="group flex items-center gap-4 p-4 rounded-xl ring-1 ring-violet-200 bg-violet-50 hover:bg-violet-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-700">My Requests</p>
                <p className="text-xs text-slate-500">View all your tickets</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            <Link
              href="/user/profile"
              className="group flex items-center gap-4 p-4 rounded-xl ring-1 ring-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">My Profile</p>
                <p className="text-xs text-slate-500">Update your account info</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          </div>
        </section>

        {/* Recent requests */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Requests</h2>
                <p className="text-xs text-slate-400">{total} total</p>
              </div>
            </div>
            <Link
              href="/user/requests"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">No requests yet</p>
              <p className="text-xs text-slate-400 mt-1">Submit your first support request</p>
              <Link
                href="/user/create-request"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                New Request
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/user/request/${req.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {req.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{formatDate(req.createdAt)}</span>
                      {req.assignedTo && (
                        <span className="text-xs text-slate-500">· Agent: {req.assignedTo.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[req.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                      {req.priority?.charAt(0) + req.priority?.slice(1).toLowerCase()}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[req.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusLabel[req.status] ?? req.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
