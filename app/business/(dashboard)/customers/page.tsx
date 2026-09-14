'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, Ban, Plus, X, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GlassBadge from '@/components/ui/GlassBadge';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  isBlocked: boolean;
  totalAppointments: number;
  lastVisitDate: string | null;
  createdAt: string;
}

interface CustomerDetail extends Customer {
  notes: { id: string; content: string; createdAt: string }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await businessFetch<{ customers: Customer[]; totalPages: number }>(`/api/business/customers?search=${encodeURIComponent(search)}&page=${page}`);
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
    } catch { toast.error('خطا'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    try {
      const d = await businessFetch<CustomerDetail>(`/api/business/customers/${id}`);
      setDetail(d);
    } catch { toast.error('خطا'); }
  };

  const toggleBlock = async (id: string) => {
    try {
      await businessFetch(`/api/business/customers/${id}/block`, { method: 'PATCH' });
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, isBlocked: !c.isBlocked } : c));
      if (detail && detail.id === id) setDetail({ ...detail, isBlocked: !detail.isBlocked });
      toast.success('وضعیت تغییر کرد');
    } catch { toast.error('خطا'); }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedId) return;
    setSavingNote(true);
    try {
      const note = await businessFetch<{ id: string; content: string; createdAt: string }>(`/api/business/customers/${selectedId}/notes`, { method: 'POST', body: JSON.stringify({ content: newNote }) });
      if (detail) setDetail({ ...detail, notes: [note, ...detail.notes] });
      setNewNote('');
      toast.success('یادداشت اضافه شد');
    } catch { toast.error('خطا'); }
    finally { setSavingNote(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text-primary">مدیریت مشتریان</h2>

      <div className="relative">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام یا موبایل..." className="glass-input w-full px-4 py-2.5 pr-11 text-sm" />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
      </div>

      {loading ? (
        <div className="glass h-96 rounded-2xl glass-shimmer" />
      ) : customers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">مشتری‌ای یافت نشد</h3>
          <p className="text-sm text-text-secondary">با جستجوی دیگری امتحان کنید</p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary text-xs">
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">موبایل</th>
                <th className="p-3 text-center">نوبت‌ها</th>
                <th className="p-3 text-right">آخرین مراجعه</th>
                <th className="p-3 text-center">وضعیت</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-border hover:bg-surface/3 cursor-pointer" onClick={() => openDetail(c.id)}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">{c.name.charAt(0)}</div>
                      <span className="text-text-primary">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary">{toPersianDigits(c.mobile)}</td>
                  <td className="p-3 text-center text-text-primary">{toPersianDigits(c.totalAppointments)}</td>
                  <td className="p-3 text-text-secondary text-xs">{c.lastVisitDate ? formatDateShortFA(new Date(c.lastVisitDate)) : '-'}</td>
                  <td className="p-3 text-center">{c.isBlocked ? <GlassBadge variant="danger">مسدود</GlassBadge> : <GlassBadge variant="success">فعال</GlassBadge>}</td>
                  <td className="p-3 text-center">
                    <button onClick={(e) => { e.stopPropagation(); toggleBlock(c.id); }} className={`p-1.5 rounded-lg ${c.isBlocked ? 'hover:bg-emerald-500/10 text-secondary' : 'hover:bg-error/10 text-error'}`}>
                      {c.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-border">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg glass text-xs text-text-secondary disabled:opacity-30">قبلی</button>
              <span className="text-xs text-text-secondary">صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg glass text-xs text-text-secondary disabled:opacity-30">بعدی</button>
            </div>
          )}
        </GlassCard>
      )}

      {selectedId && detail && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedId(null); setDetail(null); }} />
          <div className="relative w-full max-w-md h-full glass-strong border-l border-border overflow-y-auto animate-slide-in-right p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">پروفایل مشتری</h3>
              <button onClick={() => { setSelectedId(null); setDetail(null); }} className="text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">{detail.name.charAt(0)}</div>
              <div>
                <h4 className="text-base font-bold text-text-primary">{detail.name}</h4>
                <p className="text-sm text-text-secondary flex items-center gap-1"><Phone className="w-3 h-3" /> {toPersianDigits(detail.mobile)}</p>
                {detail.isBlocked && <GlassBadge variant="danger" className="mt-1">مسدود</GlassBadge>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass p-3 rounded-xl text-center">
                <div className="text-lg font-bold text-text-primary">{toPersianDigits(detail.totalAppointments)}</div>
                <div className="text-xs text-text-secondary">کل نوبت‌ها</div>
              </div>
              <div className="glass p-3 rounded-xl text-center">
                <div className="text-lg font-bold text-text-primary">{detail.lastVisitDate ? formatDateShortFA(new Date(detail.lastVisitDate)) : '-'}</div>
                <div className="text-xs text-text-secondary">آخرین مراجعه</div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-bold text-text-primary mb-2">یادداشت‌ها</h4>
              <div className="flex gap-2 mb-3">
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="یادداشت جدید..." className="glass-input flex-1 px-3 py-2 text-sm" />
                <GradientButton onClick={addNote} loading={savingNote} size="sm"><Plus className="w-4 h-4" /></GradientButton>
              </div>
              <div className="space-y-2">
                {detail.notes.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-surface/5">
                    <p className="text-sm text-text-primary">{n.content}</p>
                    <p className="text-xs text-text-muted mt-1">{formatDateShortFA(new Date(n.createdAt))}</p>
                  </div>
                ))}
                {detail.notes.length === 0 && <p className="text-xs text-text-secondary text-center py-3">یادداشتی ثبت نشده</p>}
              </div>
            </div>
            <button onClick={() => toggleBlock(detail.id)} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${detail.isBlocked ? 'bg-secondary/10 text-emerald-300 hover:bg-emerald-500/25' : 'bg-red-500/15 text-red-300 hover:bg-red-500/25'}`}>
              {detail.isBlocked ? 'رفع مسدودیت' : 'مسدود کردن'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
