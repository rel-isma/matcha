// Profile Completion Checker - redirects users to complete profile if needed
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { ROUTES } from '../lib/constants';

interface ProfileCompletionCheckerProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
}

export const ProfileCompletionChecker: React.FC<ProfileCompletionCheckerProps> = ({
  children,
  requireCompleteProfile = true,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { profile, loading, isProfileComplete } = useProfile();

  useEffect(() => {
    // Only check if user is authenticated and we require complete profile
    if (!requireCompleteProfile || !isAuthenticated || loading) {
      return;
    }

    // If profile is loaded and incomplete, redirect to complete profile page
    if (profile && !isProfileComplete()) {
      router.push(ROUTES.COMPLETE_PROFILE);
    }
  }, [isAuthenticated, profile, loading, isProfileComplete, requireCompleteProfile, router]);

  // Show loading while checking
  if (isAuthenticated && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
