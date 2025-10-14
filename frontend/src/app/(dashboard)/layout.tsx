'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Header, NavBar } from '../../components/navigation';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && !user.isVerified) {
      router.push('/verify');
    }
  }, [user, isLoading, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }

  // Redirect to verification if email not verified
  if (!user.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header - Desktop and Mobile */}
      <Header />
      
      {/* Main Content with Profile Completion Check */}
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <NavBar />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #fed7aa',
            borderRadius: '0.75rem',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.1), 0 4px 6px -2px rgba(249, 115, 22, 0.05)',
          },
          success: {
            style: {
              border: '1px solid #f97316',
              backgroundColor: '#fff7ed',
              color: '#9a3412',
            },
            iconTheme: {
              primary: '#f97316',
              secondary: '#fff7ed',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
          },
          loading: {
            style: {
              border: '1px solid #f59e0b',
              backgroundColor: '#fffbeb',
              color: '#92400e',
            },
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#fffbeb',
            },
          },
        }}
      />
    </div>
  );
}