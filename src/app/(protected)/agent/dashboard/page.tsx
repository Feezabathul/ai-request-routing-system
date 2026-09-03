"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AgentQueue } from '@/components/dashboard/AgentQueue';
import { getCurrentUser, type CurrentUser } from '@/lib/current-user';

export default function AgentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    // Wrong role redirects
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      router.replace('/admin/dashboard');
      return;
    }
    if (currentUser.role === 'USER') {
      router.replace('/user/dashboard');
      return;
    }
    // Agent lands here
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading agent dashboard...</div>
      </div>
    );
  }

  return (
    <section className="min-w-0 flex-1 p-4 sm:p-6 overflow-y-auto">
      <AgentQueue user={user} />
    </section>
  );
}
