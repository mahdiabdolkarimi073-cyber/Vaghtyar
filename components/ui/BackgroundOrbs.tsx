'use client';

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 animate-orb"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-15 animate-orb"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(80px)', animationDelay: '5s' }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-10 animate-orb"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(60px)', animationDelay: '10s' }}
      />
    </div>
  );
}
