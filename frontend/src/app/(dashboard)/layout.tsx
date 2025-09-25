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
      
      {/* Main Content with Profile Completion Check */}
      <main className="pb-20 md:pb-0">
        <ProfileCompletionChecker requireCompleteProfile={requiresProfileCompletion}>
          {children}
        </ProfileCompletionChecker>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <NavBar />
    </div>
  );
}