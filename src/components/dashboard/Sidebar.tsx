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
  X,
  ChevronDown,
  Zap,
  LogOut,
} from 'lucide-react';
import { getUserRole, UserRole } from '@/lib/role';
import { getCurrentUser, clearCurrentUser } from '@/lib/current-user';
import { CURRENT_AGENT_KEY } from '@/lib/agents';
import { getPendingNotificationCount } from '@/lib/admin-notifications-client';
import { NotificationBadge } from '@/components/admin/notifications/NotificationBadge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { name: 'Requests', href: '/dashboard/requests', icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Admin Overview', href: '/dashboard/admin', icon: <ShieldCheck className="h-4 w-4" />, adminOnly: true },
      { name: 'Agents', href: '/dashboard/agents', icon: <Bot className="h-4 w-4" />, adminOnly: true },
      { name: 'Users', href: '/dashboard/users', icon: <Users className="h-4 w-4" />, adminOnly: true },
      { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" />, adminOnly: true },
    ],
  },
];

/**
 * Dashboard sidebar navigation.
 * Responsive with mobile hamburger menu, grouped nav items,
 * active route highlighting, and role-based visibility.
 */
export const Sidebar: React.FC<{ role?: UserRole }> = ({ role }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [storedRole, setStoredRole] = useState<UserRole | null>(null);
  const [sessionUser, setSessionUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
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

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const filteredGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.adminOnly && effectiveRole !== 'ADMIN') return false;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200/50">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">AI Router</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            {effectiveRole === 'ADMIN' ? 'Admin Panel' : effectiveRole === 'AGENT' ? 'Agent Panel' : 'Dashboard'}
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
            >
              {group.label}
              <ChevronDown
                className={clsx(
                  'h-3 w-3 transition-transform duration-200',
                  collapsedGroups[group.label] && '-rotate-90'
                )}
              />
            </button>

            {!collapsedGroups[group.label] && (
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                      )}
                    >
                      <span className={clsx(
                        'flex items-center justify-center w-7 h-7 rounded-lg transition-colors',
                        active ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'
                      )}>
                        {item.icon}
                      </span>
                      {item.name}
                      {item.href === '/dashboard/admin' && effectiveRole === 'ADMIN' && (
                        <span className="ml-auto">
                          <NotificationBadge count={pendingNotifications} label="pending requests" />
                        </span>
                      )}
                      {active && item.href !== '/dashboard/admin' && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User area */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-200/50">
            {(sessionUser?.name ?? effectiveRole).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
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
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-white text-slate-600 shadow-lg shadow-slate-200/50 border border-slate-100 hover:bg-slate-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl shadow-slate-300/30 transform transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 min-h-screen bg-white border-r border-slate-100 shadow-sm">
        {navContent}
      </aside>
    </>
  );
};
