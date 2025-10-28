'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getAuthHeroContent } from '@/lib/authHeroContent';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const heroContent = getAuthHeroContent(pathname);
  const isCompleteProfile = pathname === '/complete-profile';
  
  if (isCompleteProfile) {
    // For complete-profile, return children with the Matcha Midnight background
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0f1729]">
        {/* Enhanced Animated Background with subtle orange accents */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle floating gradient orbs with muted colors */}
          <div className="absolute top-10 left-[5%] w-40 h-40 bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-full opacity-20 animate-float blur-xl" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-[20%] right-[8%] w-32 h-32 bg-gradient-to-br from-[#334155] to-[#475569] rounded-full opacity-15 animate-float blur-xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-[15%] left-[12%] w-36 h-36 bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-full opacity-20 animate-float blur-xl" style={{animationDelay: '4s'}}></div>
          
          {/* Orange accent particles */}
          <div className="absolute top-[60%] left-[25%] w-24 h-24 bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/10 rounded-full opacity-40 animate-float blur-lg" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-[65%] right-[25%] w-14 h-14 bg-gradient-to-br from-[#F39C12]/30 to-[#e08e0b]/20 rounded-full opacity-35 animate-float shadow-lg shadow-[#F39C12]/10" style={{animationDelay: '1.8s'}}></div>
          
          {/* Floating love elements with theme colors */}
          <div className="absolute top-[35%] left-[65%] w-6 h-6 text-[#F39C12] opacity-40 animate-float" style={{animationDelay: '4.2s'}}>
            <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="absolute bottom-[45%] left-[15%] w-5 h-5 text-[#F39C12] opacity-30 animate-float" style={{animationDelay: '1.2s'}}>
            <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          
          {/* Subtle sparkles */}
          <div className="absolute top-[15%] left-[75%] w-2 h-2 bg-[#F39C12] rounded-full opacity-60 animate-pulse shadow-lg shadow-[#F39C12]/30" style={{animationDelay: '0.8s'}}></div>
          <div className="absolute bottom-[20%] right-[5%] w-2 h-2 bg-[#F39C12] rounded-full opacity-50 animate-pulse shadow-lg shadow-[#F39C12]/20" style={{animationDelay: '2.3s'}}></div>
        </div>

        {/* Content with relative positioning */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // For other auth pages, use the card wrapper with Matcha Midnight theme
  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-[#0f1729]">
      {/* Enhanced Animated Background with subtle theme colors */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle floating gradient orbs */}
        <div className="absolute top-10 left-[5%] w-40 h-40 bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-full opacity-20 animate-float blur-xl" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-[20%] right-[8%] w-32 h-32 bg-gradient-to-br from-[#334155] to-[#475569] rounded-full opacity-15 animate-float blur-xl" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-[15%] left-[12%] w-36 h-36 bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-full opacity-20 animate-float blur-xl" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-[30%] right-[20%] w-28 h-28 bg-gradient-to-br from-[#334155] to-[#475569] rounded-full opacity-15 animate-float blur-xl" style={{animationDelay: '1s'}}></div>
        
        {/* Orange accent particles */}
        <div className="absolute top-[60%] left-[25%] w-24 h-24 bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/10 rounded-full opacity-40 animate-float blur-lg" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-[25%] right-[15%] w-20 h-20 bg-gradient-to-br from-[#F39C12]/15 to-[#e08e0b]/10 rounded-full opacity-35 animate-float blur-lg" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-[65%] right-[25%] w-14 h-14 bg-gradient-to-br from-[#F39C12]/30 to-[#e08e0b]/20 rounded-full opacity-35 animate-float shadow-lg shadow-[#F39C12]/10" style={{animationDelay: '1.8s'}}></div>
        
        {/* Multiple Floating Hearts with different sizes and positions */}
        <div className="absolute top-[35%] left-[65%] w-7 h-7 text-[#F39C12] opacity-40 animate-float" style={{animationDelay: '4.2s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute bottom-[45%] left-[15%] w-6 h-6 text-[#F39C12] opacity-30 animate-float" style={{animationDelay: '1.2s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute top-[55%] right-[55%] w-5 h-5 text-[#F39C12] opacity-35 animate-float" style={{animationDelay: '3.1s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        {/* Additional Hearts - More prominent */}
        <div className="absolute top-[12%] left-[25%] w-8 h-8 text-[#F39C12]/50 animate-float" style={{animationDelay: '2.5s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-xl">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute bottom-[30%] right-[8%] w-7 h-7 text-[#e08e0b]/45 animate-float" style={{animationDelay: '5s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute top-[72%] left-[8%] w-6 h-6 text-[#F39C12]/38 animate-float" style={{animationDelay: '3.8s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute top-[25%] right-[35%] w-5 h-5 text-[#F39C12]/42 animate-float" style={{animationDelay: '4.7s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute bottom-[18%] left-[38%] w-4 h-4 text-[#e08e0b]/40 animate-float" style={{animationDelay: '2.2s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-md">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        
        {/* Love-themed Stars */}
        <div className="absolute top-[42%] right-[72%] w-6 h-6 text-[#F39C12]/38 animate-float" style={{animationDelay: '6s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute bottom-[35%] right-[18%] w-5 h-5 text-[#F39C12]/35 animate-float" style={{animationDelay: '3.5s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        {/* Subtle sparkles - Love vibes */}
        <div className="absolute top-[15%] left-[75%] w-2 h-2 bg-[#F39C12] rounded-full opacity-60 animate-pulse shadow-lg shadow-[#F39C12]/30" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-[20%] right-[5%] w-2 h-2 bg-[#F39C12] rounded-full opacity-50 animate-pulse shadow-lg shadow-[#F39C12]/20" style={{animationDelay: '2.3s'}}></div>
        <div className="absolute top-[40%] left-[5%] w-2 h-2 bg-[#F39C12] rounded-full opacity-45 animate-pulse shadow-lg shadow-[#F39C12]/15" style={{animationDelay: '4.5s'}}></div>
        <div className="absolute top-[68%] right-[12%] w-2 h-2 bg-[#e08e0b] rounded-full opacity-55 animate-pulse shadow-lg shadow-[#F39C12]/25" style={{animationDelay: '1.3s'}}></div>
        <div className="absolute bottom-[42%] left-[28%] w-2 h-2 bg-[#F39C12] rounded-full opacity-48 animate-pulse shadow-lg shadow-[#F39C12]/18" style={{animationDelay: '3.6s'}}></div>
        <div className="absolute top-[88%] left-[52%] w-2 h-2 bg-[#F39C12] rounded-full opacity-52 animate-pulse shadow-lg shadow-[#F39C12]/22" style={{animationDelay: '5.2s'}}></div>
      </div>

      {/* Centered Auth Container */}
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 relative z-10">
        {/* Dark themed Auth Card */}
        <div className="bg-[#1e293b] backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#334155] p-6 sm:p-8 md:p-10 relative overflow-hidden">
          {/* Card subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#1e293b] to-[#334155]/50 rounded-2xl sm:rounded-3xl"></div>
          
          {/* Form content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Decorative corner elements with orange accent */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#F39C12]/40 to-[#F39C12]/20 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-[#F39C12]/30 to-[#e08e0b]/20 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>
  );
}
