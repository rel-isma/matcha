'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { validateEmail } from '@/lib/validation';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authApi.forgotPassword(email);
      
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <svg 
              className="w-8 h-8 text-primary-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

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
              Click the password reset link in the email
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Create a new password
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              setEmail('');
              setError('');
            }}
          >
            Send another email
          </Button>
          
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-accent hover:text-primary-600 font-medium underline"
            >
              Back to sign in
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
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </div>
        
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reset password</h2>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we&apos;ll send you a link to reset your password.
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
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
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
