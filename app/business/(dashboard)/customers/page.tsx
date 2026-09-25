'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, Ban, Plus, X, Phone, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import GradientButton from '@/components/ui/GradientButton';
import GlassBadge from '@/components/ui/GlassBadge';
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
    } catch {
      toast.error('خطا در ثبت یادداشت');
    }
    finally { setSavingNote(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">مشتریان</h2>
        <p className="text-sm text-text-secondary mt-0.5">مدیریت مشتریان و یادداشت‌ها</p>
      </div>

      <div className="relative">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام یا موبایل..." className="premium-input w-full px-4 py-3 pr-11 text-sm" />
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
      </div>

      {loading ? (
        <div className="bg-surface border border-border rounded-2xl h-96 glass-shimmer" />
      ) : customers.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">مشتری‌ای یافت نشد</h3>
          <p className="text-sm text-text-secondary">با جستجوی دیگری امتحان کنید</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary text-xs bg-muted/30">
                  <th className="p-3 text-right font-medium">نام</th>
                  <th className="p-3 text-right font-medium">موبایل</th>
                  <th className="p-3 text-center font-medium">نوبت‌ها</th>
                  <th className="p-3 text-right font-medium">آخرین مراجعه</th>
                  <th className="p-3 text-center font-medium">وضعیت</th>
                  <th className="p-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => openDetail(c.id)}>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">{c.name.charAt(0)}</div>
                        <span className="text-text-primary font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-text-secondary ltr-text">{toPersianDigits(c.mobile)}</td>
                    <td className="p-3 text-center text-text-primary font-medium">{toPersianDigits(c.totalAppointments)}</td>
                    <td className="p-3 text-text-secondary text-xs">{c.lastVisitDate ? formatDateShortFA(new Date(c.lastVisitDate)) : '-'}</td>
                    <td className="p-3 text-center">{c.isBlocked ? <GlassBadge variant="danger">مسدود</GlassBadge> : <GlassBadge variant="success">فعال</GlassBadge>}</td>
                    <td className="p-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); toggleBlock(c.id); }} className={`p-1.5 rounded-lg transition-colors ${c.isBlocked ? 'hover:bg-secondary/10 text-secondary' : 'hover:bg-error/10 text-error'}`}>
                        {c.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-border bg-muted/20">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg bg-surface border border-border text-xs text-text-secondary disabled:opacity-30 hover:bg-muted transition-colors">قبلی</button>
              <span className="text-xs text-text-secondary">صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg bg-surface border border-border text-xs text-text-secondary disabled:opacity-30 hover:bg-muted transition-colors">بعدی</button>
            </div>
          )}
        </div>
      )}

      {selectedId && detail && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setSelectedId(null); setDetail(null); }} />
          <div className="relative w-full max-w-md h-full bg-surface border-l border-border overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">پروفایل مشتری</h3>
                <button onClick={() => { setSelectedId(null); setDetail(null); }} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text-secondary"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-soft">{detail.name.charAt(0)}</div>
                <div>
                  <h4 className="text-base font-bold text-text-primary">{detail.name}</h4>
                  <p className="text-sm text-text-secondary flex items-center gap-1 mt-0.5"><Phone className="w-3.5 h-3.5" /> <span className="ltr-text">{toPersianDigits(detail.mobile)}</span></p>
                  {detail.isBlocked && <GlassBadge variant="danger" className="mt-1">مسدود</GlassBadge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-muted/40 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{toPersianDigits(detail.totalAppointments)}</div>
                  <div className="text-xs text-text-secondary mt-1">کل نوبت‌ها</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 text-center">
                  <div className="text-sm font-bold text-text-primary">{detail.lastVisitDate ? formatDateShortFA(new Date(detail.lastVisitDate)) : '-'}</div>
                  <div className="text-xs text-text-secondary mt-1">آخرین مراجعه</div>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-bold text-text-primary mb-3">یادداشت‌ها</h4>
                <div className="flex gap-2 mb-3">
                  <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} placeholder="یادداشت جدید..." className="premium-input flex-1 px-3 py-2.5 text-sm" />
                  <GradientButton onClick={addNote} loading={savingNote} size="sm" className="shrink-0"><Plus className="w-4 h-4" /></GradientButton>
                </div>
                <div className="space-y-2">
                  {detail.notes.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-muted/30">
                      <p className="text-sm text-text-primary">{n.content}</p>
                      <p className="text-xs text-text-muted mt-1">{formatDateShortFA(new Date(n.createdAt))}</p>
                    </div>
                  ))}
                  {detail.notes.length === 0 && <p className="text-xs text-text-secondary text-center py-3">یادداشتی ثبت نشده</p>}
                </div>
              </div>
              <button onClick={() => toggleBlock(detail.id)} className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${detail.isBlocked ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' : 'bg-error/10 text-error hover:bg-error/20'}`}>
                {detail.isBlocked ? 'رفع مسدودیت' : 'مسدود کردن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
