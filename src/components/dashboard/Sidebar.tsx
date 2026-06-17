'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  Bot,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { getUserRole, UserRole } from '@/lib/role';
import { getCurrentUser, clearCurrentUser } from '@/lib/current-user';
import { CURRENT_AGENT_KEY } from '@/lib/agents';
import { getPendingNotificationCount } from '@/lib/admin-notifications-client';
import { NotificationBadge } from '@/components/admin/notifications/NotificationBadge';

interface NavItemType {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  agentOnly?: boolean;
  userOnly?: boolean;
}

const navItems: NavItemType[] = [
  // Admin Routes
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, adminOnly: true },
  { name: 'Requests', href: '/admin/requests', icon: <FileText className="h-5 w-5" />, adminOnly: true },
  { name: 'Agents', href: '/admin/agents', icon: <Bot className="h-5 w-5" />, adminOnly: true },
  { name: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" />, adminOnly: true },
  { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" />, adminOnly: true },

  // Agent Routes
  { name: 'Agent Dashboard', href: '/agent/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, agentOnly: true },
  { name: 'Agent Queue', href: '/agent/queue', icon: <FileText className="h-5 w-5" />, agentOnly: true },
  { name: 'Assigned', href: '/agent/assigned', icon: <ShieldCheck className="h-5 w-5" />, agentOnly: true },
  { name: 'Resolved', href: '/agent/resolved', icon: <ShieldCheck className="h-5 w-5" />, agentOnly: true },
  { name: 'Profile', href: '/agent/profile', icon: <Settings className="h-5 w-5" />, agentOnly: true },

  // User Routes
  { name: 'User Dashboard', href: '/user/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, userOnly: true },
  { name: 'My Requests', href: '/user/requests', icon: <FileText className="h-5 w-5" />, userOnly: true },
  { name: 'Submit Request', href: '/user/create-request', icon: <FileText className="h-5 w-5" />, userOnly: true },
  { name: 'Notifications', href: '/user/notifications', icon: <FileText className="h-5 w-5" />, userOnly: true },
  { name: 'Profile', href: '/user/profile', icon: <Settings className="h-5 w-5" />, userOnly: true },
];

export const Sidebar: React.FC<{ role?: UserRole }> = ({ role }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [storedRole, setStoredRole] = useState<UserRole | null>(null);
  const [sessionUser, setSessionUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState(0);

  useEffect(() => {
    const loadRoleTimer = window.setTimeout(() => {
      setStoredRole(role ?? getUserRole());
      setSessionUser(getCurrentUser());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(loadRoleTimer);
  }, [role, pathname]);

  useEffect(() => {
    const refreshPending = () => setPendingNotifications(getPendingNotificationCount());

    refreshPending();
    window.addEventListener('storage', refreshPending);
    window.addEventListener('admin-notifications-updated', refreshPending);
    window.addEventListener('focus', refreshPending);

    return () => {
      window.removeEventListener('storage', refreshPending);
      window.removeEventListener('admin-notifications-updated', refreshPending);
      window.removeEventListener('focus', refreshPending);
    };
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    localStorage.removeItem('userRole');
    localStorage.removeItem(CURRENT_AGENT_KEY);
    router.push('/login');
  };

  if (!mounted || !storedRole) {
    return null;
  }

  const effectiveRole = storedRole;

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && effectiveRole !== 'ADMIN') return false;
    if (item.agentOnly && effectiveRole !== 'AGENT') return false;
    if (item.userOnly && effectiveRole !== 'USER') return false;
    return true;
  });

  return (
    <aside
      className={clsx(
        "flex flex-col min-h-screen bg-white border-r border-slate-200 shadow-sm transition-all duration-300 relative z-30",
        sidebarOpen ? "w-[260px]" : "w-[70px]"
      )}
    >
      {/* Header */}
      <div className={clsx(
        "flex items-center h-[76px] border-b border-slate-100",
        sidebarOpen ? "px-5 justify-between" : "justify-center"
      )}>
        {!sidebarOpen ? (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Expand sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        ) : (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200/50 flex-shrink-0 text-sm">
                {effectiveRole === 'ADMIN' ? 'AD' : effectiveRole === 'AGENT' ? 'AG' : 'US'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-tight truncate">
                  {effectiveRole === 'ADMIN' ? 'Admin Portal' : effectiveRole === 'AGENT' ? 'Agent Portal' : 'User Portal'}
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-0.5 truncate">
                  {effectiveRole === 'ADMIN' ? 'Platform Control' : effectiveRole === 'AGENT' ? 'Agent Workspace' : 'User Dashboard'}
                </p>
              </div>
          </div>
        )}

        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 ml-2"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Items and User Area - only show when open */}
      {sidebarOpen && (
        <>
          <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden px-3">
            {filteredItems.map((item) => {
              const active = isActive(item.href);

              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'w-full flex items-center rounded-xl transition-all duration-200 group relative',
                      "px-3 py-3",
                      active
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    <span className={clsx(
                      'flex items-center justify-center transition-colors flex-shrink-0',
                      active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}>
                      {item.icon}
                    </span>
                    
                    <div className="flex flex-1 items-center justify-between ml-3 overflow-hidden transition-all duration-300 opacity-100">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium">{item.name}</span>
                      {item.href === '/admin/dashboard' && effectiveRole === 'ADMIN' && (
                         <span className="ml-auto flex-shrink-0">
                           <NotificationBadge count={pendingNotifications} label="pending requests" />
                         </span>
                       )}
                      {active && item.href !== '/admin/dashboard' && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* User Area */}
          <div className="border-t border-slate-100 py-4 px-5 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-indigo-200/50 flex-shrink-0">
                {(sessionUser?.name ?? effectiveRole).charAt(0).toUpperCase()}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {sessionUser?.name ?? (effectiveRole === 'ADMIN' ? 'Administrator' : effectiveRole === 'AGENT' ? 'Agent' : 'User')}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {sessionUser?.email ?? effectiveRole}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};
