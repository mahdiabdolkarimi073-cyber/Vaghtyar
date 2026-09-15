import './globals.css';
import { prisma } from '@/lib/prisma';

export async function generateMetadata() {
  let siteName = 'نوبت‌یار';
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    if (setting?.value) siteName = setting.value;
  } catch {}
  return {
    title: `پنل مدیریت | ${siteName}`,
    description: `پنل مدیریت پلتفرم ${siteName}`,
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-body font-vazir antialiased" dir="rtl">
      {children}
    </div>
  );
}
