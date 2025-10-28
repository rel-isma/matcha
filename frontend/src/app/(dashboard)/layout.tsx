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
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-[#94a3b8]">Loading...</p>
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
    <div className="min-h-screen bg-[#0f1729]">
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
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(243, 156, 18, 0.1), 0 4px 6px -2px rgba(243, 156, 18, 0.05)',
          },
          success: {
            style: {
              border: '1px solid #F39C12',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
            },
            iconTheme: {
              primary: '#F39C12',
              secondary: '#1e293b',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
          loading: {
            style: {
              border: '1px solid #F39C12',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
            },
            iconTheme: {
              primary: '#F39C12',
              secondary: '#1e293b',
            },
          },
        }}
      />
    </div>
  );
}