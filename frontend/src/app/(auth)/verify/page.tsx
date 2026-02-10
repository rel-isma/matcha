'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { authApi } from '@/lib/api';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('loading');
    try {
      const result = await authApi.verifyEmail(verificationToken);
      if (result.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now log in.');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Email verification failed. The link may be expired or invalid.');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        );
      case 'success':
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-100';
      case 'error': return 'bg-red-100';
      default: return 'bg-primary-100';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading': return 'Verifying your email...';
      case 'success': return 'Email verified!';
      case 'error': return 'Verification failed';
      default: return token ? 'Verifying...' : 'Check your email';
    }
  };

  const getDescription = () => {
    if (message) return message;
    if (!token) {
      return "We've sent a verification link to your email address. Please click the link to verify your account.";
    }
    return 'Please wait while we verify your email address...';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        {/* Matcha Logo */}
        <div className="mb-6 flex justify-center">
          <Image 
            src="/logo/logoAbig.svg" 
            alt="Matcha" 
            width={120}
            height={40}
            className="h-10 w-auto mb-8"
            unoptimized
            priority
          />
        </div>
        
        <div className={`mx-auto flex items-center justify-center w-16 h-16 ${getStatusColor()} rounded-full mb-6`}>
          {getStatusIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{getTitle()}</h2>
        <p className="text-muted-foreground text-sm">
          {getDescription()}
        </p>
      </div>

      {status === 'success' && (
        <div className="bg-accent/10 rounded-lg p-6 text-center">
          <p className="text-foreground mb-4">
            Redirecting you to the login page in a few seconds...
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Go to Login Now
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <p className="text-destructive mb-4">
            {message}
          </p>
          <div className="space-y-3">
            <Link href="/register">
              <Button variant="outline" className="w-full">
                Try Registering Again
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!token && status === 'waiting' && (
        <>
          {/* Instructions */}
          <div className="bg-accent/10 rounded-lg p-6">
            <h2 className="font-semibold text-foreground mb-2">What&apos;s next?</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Check your email inbox (and spam folder)
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Click the verification link in the email
              </li>
              <li className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Complete your profile setup
              </li>
            </ul>
          </div>

          {/* Simple actions */}
          <div className="text-center space-y-4">
            <Link 
              href="/login" 
              className="text-sm text-accent hover:text-primary-600 font-medium underline block"
            >
              Back to sign in
            </Link>
            
            <div className="text-xs text-muted-foreground">
              Having trouble? {' '}
              <Link href="/support" className="text-accent hover:text-primary-600 underline">
                Contact support
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
