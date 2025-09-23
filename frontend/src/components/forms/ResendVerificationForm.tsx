'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { authApi } from '@/lib/api';

interface ResendVerificationFormProps {
  onSuccess?: () => void;
}

export default function ResendVerificationForm({ onSuccess }: ResendVerificationFormProps) {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    setMessage('');

    try {
      const result = await authApi.resendVerification(email);
      if (result.success) {
        setMessage('Verification email sent successfully! Please check your inbox.');
        onSuccess?.();
      } else {
        setMessage(result.message || 'Failed to send verification email. Please try again.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-start mb-3 sm:mb-4">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2 sm:mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="font-semibold text-yellow-800 text-sm sm:text-base">Email Verification Required</h3>
      </div>
      
      <p className="text-yellow-700 mb-4 text-sm sm:text-base">
        Your account needs to be verified before you can log in. Please check your email for the verification link, or request a new one below.
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full text-sm sm:text-base"
        />
        
        <Button
          variant="primary"
          onClick={handleResendVerification}
          loading={isResending}
          className="w-full text-sm sm:text-base"
          disabled={!email.trim()}
        >
          {isResending ? 'Sending...' : 'Send Verification Email'}
        </Button>

        <p className="text-center text-xs sm:text-sm text-yellow-700">
          Lost your email access? {' '}
          <Link href="/register" className="text-yellow-800 hover:text-yellow-900 underline font-medium">
            Create a new account
          </Link>
        </p>
      </div>
    </div>
  );
}
