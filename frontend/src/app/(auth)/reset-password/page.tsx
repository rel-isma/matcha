'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { validatePassword } from '@/lib/validation';
import { authApi } from '@/lib/api';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Password does not meet requirements');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authApi.resetPassword(token, password);
      
      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.message || 'Password reset failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset Successful!</h1>
          <p className="text-muted-foreground text-sm">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
        </div>

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
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground text-sm">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <p className="text-destructive mb-4">
            Please request a new password reset link.
          </p>
          <div className="space-y-3">
            <Link href="/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        {/* Matcha Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo/logoAbig.svg"
            alt="Matcha"
            width={0}
            height={0}
            className="w-32 h-8"
            unoptimized
            priority
          />
        </div>
        
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Create New Password</h2>
          <p className="text-muted-foreground text-sm">
            Please enter your new password below.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          required
        />

        <div className="bg-accent/10 rounded-lg p-4 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Password Requirements:</h3>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
            <li>Contains at least one special character</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link 
          href="/login" 
          className="text-sm text-accent hover:text-primary-600 font-medium underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
