import './globals.css';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const metadata = {
  title: 'پنل مدیریت | نوبت‌یار',
  description: 'پنل مدیریت پلتفرم نوبت‌یار',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-body font-vazir antialiased" dir="rtl">
      {children}
    </div>
  );
}
