import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative">
      <BackgroundOrbs />
      <div className="w-full max-w-xl animate-scale-in">
        {children}
      </div>
    </div>
  );
}
