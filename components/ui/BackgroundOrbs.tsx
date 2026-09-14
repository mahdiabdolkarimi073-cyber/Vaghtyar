'use client';

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-10 animate-orb"
        style={{ background: 'radial-gradient(circle, #0D7377, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-8 animate-orb"
        style={{ background: 'radial-gradient(circle, #14A8AD, transparent 70%)', filter: 'blur(80px)', animationDelay: '5s' }}
      />
    </div>
  );
}
