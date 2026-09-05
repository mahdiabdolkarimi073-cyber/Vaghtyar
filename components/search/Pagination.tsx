'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function toFa(n: number): string {
  return n.toLocaleString('fa-IR');
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Build page number list with ellipsis
  const pages: (number | '...')[] = [];
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col items-center gap-4" dir="rtl">
      <Separator />
      <span className="text-sm text-slate-500">
        نمایش {toFa(start)}–{toFa(end)} از {toFa(total)} نتیجه
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous (in RTL, previous is on the right) */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            aria-label="صفحه قبل"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="px-2 text-slate-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors ${
                  page === p
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {toFa(p)}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            aria-label="صفحه بعد"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
