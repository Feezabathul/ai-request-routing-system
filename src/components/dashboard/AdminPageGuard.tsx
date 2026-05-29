'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { getUserRole, isAdminRole, UserRole } from '@/lib/role';

export function AdminPageGuard({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  if (role === null) return null;
  if (!isAdminRole(role)) return <Unauthorized role={role} />;

  return <>{children}</>;
}

function Unauthorized({ role }: { role: UserRole }) {
  const router = useRouter();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-[2rem] border border-gray-200 bg-white px-8 py-12 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-semibold text-gray-900">Access Denied</h1>
        <p className="mt-4 text-center text-sm leading-6 text-gray-500">
          You do not have permission to view this page. Only users with the ADMIN role may access system administration pages.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <span className="text-xs text-gray-400">
            Current role: <strong className="text-gray-700">{role}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
