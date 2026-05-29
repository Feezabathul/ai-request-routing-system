'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

/** Role type for frontend-only role placeholder support */
export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';

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
      { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

/**
 * Dashboard sidebar navigation.
 * Responsive with mobile hamburger menu, grouped nav items,
 * active route highlighting, and role-based visibility.
 */
export const Sidebar: React.FC<{ role?: UserRole }> = ({ role = 'ADMIN' }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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
      if (item.adminOnly && role !== 'ADMIN') return false;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide">AI Router</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
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
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 border border-transparent',
                      )}
                    >
                      <span className={clsx(active ? 'text-indigo-400' : 'text-gray-500')}>
                        {item.icon}
                      </span>
                      {item.name}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
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
      <div className="border-t border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">admin@airouter.io</p>
          </div>
          <button className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
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
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-gray-900 text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 transform transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 min-h-screen bg-gray-950 border-r border-gray-800/50">
        {navContent}
      </aside>
    </>
  );
};
