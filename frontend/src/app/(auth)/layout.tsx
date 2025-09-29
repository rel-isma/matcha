'use client';

import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCompleteProfile = pathname === '/complete-profile';
  
  if (isCompleteProfile) {
    // For complete-profile, return children without auth card wrapper
    return <>{children}</>;
  }

  // For other auth pages, use the card wrapper
  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 rounded-3xl"></div>
          <div className="relative z-10">
            {children}
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>
  );
}
