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
  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Magical floating gradient orbs */}
        <div className="absolute top-10 left-[5%] w-40 h-40 bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 rounded-full opacity-25 animate-float blur-sm" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-[20%] right-[8%] w-32 h-32 bg-gradient-to-br from-purple-300 via-violet-300 to-indigo-300 rounded-full opacity-30 animate-float blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-[15%] left-[12%] w-36 h-36 bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-300 rounded-full opacity-25 animate-float blur-sm" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-[30%] right-[20%] w-28 h-28 bg-gradient-to-br from-emerald-300 via-green-300 to-lime-300 rounded-full opacity-35 animate-float blur-sm" style={{animationDelay: '1s'}}></div>
        
        {/* Sparkling medium bubbles */}
        <div className="absolute top-[60%] left-[25%] w-24 h-24 bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-300 rounded-full opacity-30 animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-[25%] right-[15%] w-20 h-20 bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 rounded-full opacity-35 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-[45%] left-[35%] w-18 h-18 bg-gradient-to-br from-lime-400 via-green-400 to-emerald-400 rounded-full opacity-25 animate-float" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-[40%] right-[35%] w-22 h-22 bg-gradient-to-br from-rose-400 via-pink-400 to-red-400 rounded-full opacity-30 animate-float" style={{animationDelay: '3.8s'}}></div>
        
        {/* Glowing small particles */}
        <div className="absolute top-[25%] left-[45%] w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full opacity-40 animate-float shadow-lg shadow-pink-300/50" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-[35%] left-[55%] w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full opacity-45 animate-float shadow-lg shadow-cyan-300/50" style={{animationDelay: '3.5s'}}></div>
        <div className="absolute top-[65%] right-[25%] w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-35 animate-float shadow-lg shadow-yellow-300/50" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-[60%] right-[45%] w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-50 animate-float shadow-lg shadow-indigo-300/50" style={{animationDelay: '2.8s'}}></div>
        
        {/* Floating love elements */}
        <div className="absolute top-[35%] left-[65%] w-6 h-6 text-pink-500 opacity-60 animate-float" style={{animationDelay: '4.2s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute bottom-[45%] left-[15%] w-5 h-5 text-rose-600 opacity-70 animate-float" style={{animationDelay: '1.2s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute top-[55%] right-[55%] w-4 h-4 text-purple-500 opacity-65 animate-float" style={{animationDelay: '3.1s'}}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-lg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        {/* Magical sparkles */}
        <div className="absolute top-[15%] left-[75%] w-3 h-3 bg-yellow-400 rounded-full opacity-80 animate-pulse shadow-lg shadow-yellow-400/50" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-[20%] right-[5%] w-2 h-2 bg-pink-400 rounded-full opacity-90 animate-pulse shadow-lg shadow-pink-400/50" style={{animationDelay: '2.3s'}}></div>
        <div className="absolute top-[40%] left-[5%] w-3 h-3 bg-cyan-400 rounded-full opacity-75 animate-pulse shadow-lg shadow-cyan-400/50" style={{animationDelay: '4.5s'}}></div>
        
        {/* Dreamy wave pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ec4899' fillOpacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='3'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}></div>
      </div>

      {/* Centered Auth Container */}
      <div className="w-full max-w-md mx-4 relative z-10">

        {/* Glass Morphism Auth Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 relative overflow-hidden">
          {/* Card background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 rounded-3xl"></div>
          
          {/* Form content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Decorative corner elements */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>
  );
}
