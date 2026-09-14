'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const [adminName, setAdminName] = useState('مدیر');
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setAdminName(data.user.name);
      })
      .catch(() => {});
    fetch('/api/admin/notifications/count')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.count !== undefined) setNotifications(data.count);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-500" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {notifications > 9 ? '۹+' : notifications}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl admin-gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {adminName.charAt(0)}
          </div>
          <span className="text-sm text-slate-700 hidden sm:block max-w-[120px] truncate">{adminName}</span>
        </div>
      </div>
    </header>
  );
}
