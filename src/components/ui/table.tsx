import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  className?: string;
}

/**
 * Generic responsive table component.
 * Renders a loading skeleton when `loading` is true.
 */
export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  className,
}: TableProps<T>) {
  return (
    <div className={twMerge(clsx('overflow-x-auto rounded-lg border border-gray-200', className))}>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={twMerge(
                  'px-4 py-2 text-left text-sm font-medium text-gray-600',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row, idx) => (
                <tr key={idx} className="border-t">
                  {columns.map((col, i) => {
                    const content =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor as keyof T]);
                    return (
                      <td key={i} className="px-4 py-2 text-sm text-gray-800">
                        {content as React.ReactNode}
                      </td>
                    );
                  })}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
