'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header, NavBar } from '../../components/navigation';
import { ProfileCompletionChecker } from '../../components/ProfileCompletionChecker';
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

  // Routes that don't require profile completion
  const noProfileCheckRoutes = ['/complete-profile'];
  const requiresProfileCompletion = !noProfileCheckRoutes.includes(pathname);

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
          <ProfileCompletionChecker requireCompleteProfile={requiresProfileCompletion}>
            {children}
          </ProfileCompletionChecker>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <NavBar />
    </div>
  );
}