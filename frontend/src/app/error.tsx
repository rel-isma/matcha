'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Error Icon */}
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Oops! Something went wrong</h1>
          <p className="text-gray-600 leading-relaxed">
            We encountered an unexpected error. Don't worry, our team has been notified and we're working to fix it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-red-50 rounded-lg text-left">
              <summary className="cursor-pointer font-medium text-red-800 mb-2">
                Error Details (Development Mode)
              </summary>
              <pre className="text-xs text-red-700 overflow-auto max-h-40">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="px-6 py-3 border border-orange-600 text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors text-center"
          >
            Go Home
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500">
          Still having issues?{' '}
          <Link href="/support" className="text-orange-600 hover:text-orange-700 font-medium">
            Contact Support
          </Link>
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="fixed top-40 right-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{animationDelay: '2s'}}></div>
    </div>
  );
}
