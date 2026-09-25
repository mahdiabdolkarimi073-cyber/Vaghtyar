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
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between h-16 pr-14 lg:pr-4">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-text-primary truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-text-secondary" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">
              {notifications > 9 ? '۹+' : notifications}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl admin-gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {adminName.charAt(0)}
          </div>
          <span className="text-sm text-text-primary hidden sm:block max-w-[120px] truncate">{adminName}</span>
        </div>
      </div>
    </header>
  );
}
