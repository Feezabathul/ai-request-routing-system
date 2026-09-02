import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail, UserRound } from 'lucide-react';

interface RequestHeaderProps {
  title: string;
  requestId: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  status: string;
  priority: string;
}

export const RequestHeader: React.FC<RequestHeaderProps> = ({
  title,
  requestId,
  createdByName,
  createdByEmail,
  createdAt,
  status,
  priority,
}) => {
  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-700 border border-blue-200',
    'AI Processing': 'bg-violet-100 text-violet-700 border border-violet-200',
    Resolved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Closed: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const priorityColors: Record<string, string> = {
    Low: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    High: 'bg-orange-100 text-orange-700 border border-orange-200',
    Urgent: 'bg-rose-100 text-rose-700 border border-rose-200',
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">Request</span>
            <span># {requestId}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className={statusColors[status] || 'bg-slate-100 text-slate-700 border border-slate-200'}>
            {status}
          </Badge>
          <Badge variant="default" className={priorityColors[priority] || 'bg-slate-100 text-slate-700 border border-slate-200'}>
            {priority}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <UserRound className="h-4 w-4 text-indigo-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Customer</p>
            <p className="mt-0.5 font-medium text-slate-800">{createdByName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <Mail className="h-4 w-4 text-indigo-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Email</p>
            <p className="mt-0.5 truncate font-medium text-slate-800">{createdByEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <Clock className="h-4 w-4 text-indigo-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Submitted</p>
            <p className="mt-0.5 font-medium text-slate-800">{new Date(createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
