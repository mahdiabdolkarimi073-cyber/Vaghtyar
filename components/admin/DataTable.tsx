'use client';

import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey?: (row: T) => string;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, isLoading, emptyMessage = 'داده‌ای موجود نیست', rowKey,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="admin-card rounded-2xl overflow-hidden">
        <div className="h-12 admin-skeleton" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 border-b border-border admin-skeleton" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="admin-card rounded-2xl p-12 text-center">
        <Inbox className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="admin-card rounded-2xl overflow-hidden overflow-x-auto">
      <table className="w-full admin-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={cn('text-right px-4 py-3 font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={rowKey ? rowKey(row) : i} className="border-b border-border last:border-0">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-text-secondary">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
