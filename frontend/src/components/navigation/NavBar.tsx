'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, Home, Bell, User, Settings, LogOut } from 'lucide-react';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/context/NotificationContext2';

export default function NavBar() {
  const pathname = usePathname();
  const { profilePicture } = useProfilePicture();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none font-medium shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )
    },
    {
      name: 'Profile',
      href: '/profile',
      isDropdown: true,
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
      <div className="grid grid-cols-5 py-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isDropdown) {
            return (
              <div key={item.name} className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex flex-col items-center justify-center py-3 px-1 transition-all duration-300 rounded-xl mx-1 w-full ${
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
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-orange-200 py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <div className="border-t border-orange-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          
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