'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, Home, Bell, User, Settings, LogOut } from 'lucide-react';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/context/NotificationContext2';
import { useChatUnread } from '@/hooks/useChatUnread';

export default function NavBar() {
  const pathname = usePathname();
  const { profilePicture } = useProfilePicture();
  const { user, logout } = useAuth();
  const { unreadCount: notificationCount } = useNotifications();
  const { unreadCount: chatUnreadCount } = useChatUnread();
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
        <Home className={`w-6 h-6 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
      )
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: (active: boolean) => (
        <div className="relative">
          <MessageCircle className={`w-6 h-6 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
          {/* Message notification badge */}
          {chatUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F39C12] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none font-medium shadow-lg">
              {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
            </span>
          )}
        </div>
      )
    },
    {
      name: 'Search',
      href: '/search',
      icon: (active: boolean) => (
        <Search className={`w-6 h-6 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
      )
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: (active: boolean) => (
        <div className="relative">
          <Bell className={`w-6 h-6 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
          {/* Notification badge */}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none font-medium shadow-lg">
              {notificationCount > 9 ? '9+' : notificationCount}
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
        <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-border bg-gradient-to-br from-accent/20 to-primary-600/10 flex items-center justify-center">
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
            <span className={`text-xs font-bold ${active ? 'text-accent' : 'text-muted-foreground'}`}>
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 shadow-lg">
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
                      ? 'bg-muted/80 shadow-sm transform scale-105' 
                      : 'hover:bg-muted/50 hover:scale-105'
                  }`}
                >
                  <div className="mb-1">
                    {item.icon(isActive)}
                  </div>
                  <span className={`text-xs font-semibold ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`}>
                    {item.name}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute bottom-full mb-2 right-0 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <div className="border-t border-border mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors duration-200"
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
                  ? 'bg-muted/80 shadow-sm transform scale-105' 
                  : 'hover:bg-muted/50 hover:scale-105'
              }`}
            >
              <div className="mb-1">
                {item.icon(isActive)}
              </div>
              <span className={`text-xs font-semibold ${
                isActive ? 'text-accent' : 'text-muted-foreground'
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