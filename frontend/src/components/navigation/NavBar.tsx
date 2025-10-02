'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, Home, Bell, User } from 'lucide-react';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useAuth } from '@/hooks/useAuth';

export default function NavBar() {
  const pathname = usePathname();
  const { profilePicture } = useProfilePicture();
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Browse',
      href: '/browse',
      icon: (active: boolean) => (
        <Home className={`w-6 h-6 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
      )
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: (active: boolean) => (
        <div className="relative">
          <MessageCircle className={`w-6 h-6 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
          {/* Message notification badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none font-medium shadow-lg">
            3
          </span>
        </div>
      )
    },
    {
      name: 'Search',
      href: '/search',
      icon: (active: boolean) => (
        <Search className={`w-6 h-6 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
      )
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: (active: boolean) => (
        <div className="relative">
          <Bell className={`w-6 h-6 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none font-medium shadow-lg">
            2
          </span>
        </div>
      )
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: (active: boolean) => (
        <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-orange-200 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile"
              width={24}
              height={24}
              className="w-full h-full object-cover"
              unoptimized
              onError={() => {
                console.error('Profile picture load error');
              }}
            />
          ) : (
            <span className={`text-xs font-bold ${active ? 'text-orange-600' : 'text-gray-500'}`}>
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50/95 to-amber-50/95 backdrop-blur-lg border-t border-orange-200 z-50 shadow-lg">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-1 transition-all duration-300 rounded-xl mx-1 ${
                isActive 
                  ? 'bg-orange-100/80 shadow-sm transform scale-105' 
                  : 'hover:bg-orange-50/50 hover:scale-105'
              }`}
            >
              <div className="mb-1">
                {item.icon(isActive)}
              </div>
              <span className={`text-xs font-semibold ${
                isActive ? 'text-orange-700' : 'text-gray-600'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}