'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useChatUnread } from '@/hooks/useChatUnread';

export default function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { profilePicture } = useProfilePicture();
  const { unreadCount: chatUnreadCount } = useChatUnread();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close menus when clicking outside
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
    } catch {
      // ignore
    }
  };

  return (
    <header className="hidden md:block bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logoAbig.svg"
                alt="Matcha"
                width={0}
                height={0}
                className="w-32 h-32"
                unoptimized
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/browse" 
              className="text-muted-foreground hover:text-accent font-medium transition-colors duration-200"
            >
              Browse
            </Link>
            <Link 
              href="/search" 
              className="text-muted-foreground hover:text-accent font-medium transition-colors duration-200"
            >
              Search
            </Link>
            <Link 
              href="/chat" 
              className="text-muted-foreground hover:text-accent font-medium transition-colors duration-200 relative"
            >
              <span className="flex items-center gap-2">
                Chat
                {chatUnreadCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center leading-none font-medium">
                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                  </span>
                )}
              </span>
            </Link>
          </nav>

          {/* Right side - Notifications & Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications Button */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border/40 bg-muted flex items-center justify-center">
                  {profilePicture ? (
                    <Image
                      src={profilePicture}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={() => {
                        // ignore image load error
                      }}
                    />
                  ) : (
                    <span className="text-foreground font-medium text-sm">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {user?.firstName || 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
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
          </div>
        </div>
      </div>
    </header>
  );
}