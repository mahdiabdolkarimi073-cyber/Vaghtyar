'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Trash2, KeyRound } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleVariantMap: Record<string, 'primary' | 'info' | 'success'> = {
  ADMIN: 'primary', BUSINESS_OWNER: 'info', CUSTOMER: 'success',
};
const roleLabelMap: Record<string, string> = {
  ADMIN: 'مدیر', BUSINESS_OWNER: 'صاحب کسب‌وکار', CUSTOMER: 'مشتری',
};

export default function AdminUsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', phone: '', password: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const d = await res.json();
      setData(Array.isArray(d) ? d : (d.data || []));
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('مدیر جدید اضافه شد');
      setShowAdd(false); setNewUser({ name: '', phone: '', password: '' });
      fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  const changeRole = async (id: string, role: string) => {
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
      toast.success('نقش تغییر کرد');
      fetchData();
    } catch { toast.error('خطا'); }
  };

  const deleteUser = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/users/${deleteId}`, { method: 'DELETE' });
      toast.success('کاربر حذف شد');
      setDeleteId(null); fetchData();
    } catch { toast.error('خطا در حذف'); }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت کاربران" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAdd(true)} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-md shadow-primary/25">
              <UserPlus className="w-4 h-4" /> افزودن مدیر
            </button>
          </div>

          <DataTable
            columns={[
              { key: 'name', header: 'نام' },
              { key: 'phone', header: 'موبایل' },
              { key: 'role', header: 'نقش', render: r => <StatusBadge status={r.role} variant={roleVariantMap[r.role] || 'neutral'}>{roleLabelMap[r.role] || r.role}</StatusBadge> },
              { key: 'createdAt', header: 'تاریخ عضویت', render: r => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.createdAt))}</span> },
              { key: 'actions', header: 'عملیات', render: r => (
                <div className="flex items-center gap-2">
                  <Select onValueChange={v => changeRole(r.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="تغییر نقش" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">مدیر</SelectItem>
                      <SelectItem value="BUSINESS_OWNER">صاحب کسب‌وکار</SelectItem>
                      <SelectItem value="CUSTOMER">مشتری</SelectItem>
                    </SelectContent>
                  </Select>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /></button>
                </div>
              )},
            ]}
            data={data}
            isLoading={loading}
            emptyMessage="کاربری وجود ندارد"
          />
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>افزودن مدیر جدید</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm text-text-secondary mb-1 block">نام</label><input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" /></div>
            <div><label className="text-sm text-text-secondary mb-1 block">موبایل</label><input value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" /></div>
            <div><label className="text-sm text-text-secondary mb-1 block">رمز عبور</label><input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" /></div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="admin-input px-4 py-2 rounded-xl text-sm">انصراف</button>
            <button onClick={addUser} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium">افزودن</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>حذف کاربر</AlertDialogTitle><AlertDialogDescription>آیا از حذف این کاربر اطمینان دارید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={deleteUser} className="bg-error hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
