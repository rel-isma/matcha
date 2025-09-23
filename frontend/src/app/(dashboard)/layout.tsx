'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavBar } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-secondary-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Desktop and Mobile */}
      <Header />
      
      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <NavBar />
    </div>
  );
}