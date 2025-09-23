'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResendVerificationForm } from '@/components/forms';

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="text-center">
        {/* Matcha Logo */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <Image 
            src="/logo/logoAbig.svg" 
            alt="Matcha" 
            width={120}
            height={40}
            className="h-8 sm:h-10 w-auto mb-4 sm:mb-8"
            priority
          />
        </div>
        
        <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-4 sm:mb-6">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-800 mb-2">Account Not Verified</h2>
        <p className="text-secondary-600 text-sm sm:text-base px-2 sm:px-0">
          You need to verify your email address before you can log in to your account.
        </p>
      </div>

      {/* Resend Verification Form */}
      <div className="max-w-md mx-auto">
        <ResendVerificationForm />
      </div>

      {/* Alternative Actions */}
      <div className="text-center space-y-3 max-w-md mx-auto">
        <Link 
          href="/login" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium underline block"
        >
          ← Back to sign in
        </Link>
        
        <div className="text-xs text-gray-500 px-4 sm:px-0">
          Having trouble? {' '}
          <Link href="/support" className="text-primary-600 hover:text-primary-700 underline">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
