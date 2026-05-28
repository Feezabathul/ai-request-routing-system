import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
}

interface SidebarProps {
  items: NavItem[];
}

/**
 * Dashboard sidebar navigation.
 * Highlights the active route and collapses on mobile.
 */
export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 bg-gray-900 text-white md:block">
      <nav className="flex flex-col h-full p-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'px-4 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
