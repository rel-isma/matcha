'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
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
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logoAbig.svg"
                alt="Matcha"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/browse" 
              className="text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Browse
            </Link>
            <Link 
              href="/search" 
              className="text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Search
            </Link>
            <Link 
              href="/chat" 
              className="text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 relative"
            >
              Chat
            </Link>
          </nav>

          {/* Right side - Notifications & Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications Button */}
            <Link
              href="/notifications"
              className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center leading-none font-medium">
                2
              </span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-800">
                    {user?.firstName || 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-secondary-600" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}