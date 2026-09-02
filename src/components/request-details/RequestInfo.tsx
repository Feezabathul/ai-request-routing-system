import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RequestInfoProps {
  request: {
    description?: string;
    category: string;
    assignedAgent?: string;
    assignedAgentDepartment?: string;
    assignedAt?: string;
    workflowStatus?: string;
  };
}

export const RequestInfo: React.FC<RequestInfoProps> = ({ request }) => {
  const {
    description = 'No description provided.',
    category,
    assignedAgent,
    assignedAgentDepartment,
    assignedAt,
    workflowStatus = 'N/A',
  } = request;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {description}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Category</p>
          <div className="mt-2">
            <Badge variant="default" className="bg-indigo-100 text-indigo-700 border border-indigo-200">
              {category}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Workflow</p>
          <div className="mt-2">
            <Badge variant="default" className="bg-violet-100 text-violet-700 border border-violet-200">
              {workflowStatus}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assigned agent</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="bg-emerald-100 text-emerald-700 border border-emerald-200">
              {assignedAgent ?? 'Not Assigned'}
            </Badge>
            {assignedAgentDepartment && (
              <Badge variant="default" className="bg-blue-100 text-blue-700 border border-blue-200">
                {assignedAgentDepartment}
              </Badge>
            )}
          </div>
        </div>

        {assignedAt && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assigned at</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{new Date(assignedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
