'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { Header, NavBar } from '../../components/navigation';
import { useAuth } from '../../context/AuthContext';

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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          {/* Logo and Loading Animation - Centered */}
          <div className="flex flex-col items-center justify-center space-y-8 mb-8">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <Image 
                src="/logo/logoSmall.svg" 
                alt="Matcha Logo" 
                width={80} 
                height={80}
                unoptimized
                priority
              />
            </div>

            {/* Loading Animation */}
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800">Loading...</h2>
            <p className="text-gray-600">
              Preparing your dating experience
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="fixed top-40 right-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="fixed bottom-20 left-20 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{animationDelay: '4s'}}></div>
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