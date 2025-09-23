'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, Home, Bell, User } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Browse',
      href: '/browse',
      icon: (active: boolean) => (
        <Home className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
      )
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: (active: boolean) => (
        <div className="relative">
          <MessageCircle className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
          {/* Message notification badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
            3
          </span>
        </div>
      )
    },
    {
      name: 'Search',
      href: '/search',
      icon: (active: boolean) => (
        <Search className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
      )
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: (active: boolean) => (
        <div className="relative">
          <Bell className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
            2
          </span>
        </div>
      )
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: (active: boolean) => (
        <User className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 px-1 transition-colors duration-200"
            >
              <div className="mb-1">
                {item.icon(isActive)}
              </div>
              <span className={`text-xs font-medium ${
                isActive ? 'text-primary-600' : 'text-secondary-400'
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