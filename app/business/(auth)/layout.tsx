import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundOrbs />
      <div className="w-full max-w-md animate-scale-in">
        {children}
      </div>
    </div>
  );
}
