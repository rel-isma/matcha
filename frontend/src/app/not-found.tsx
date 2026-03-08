import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-orange-500">404</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
            <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '4s'}}></div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-center"
          >
            Go Home
          </Link>
          <Link 
            href="/browse"
            className="px-6 py-3 border border-orange-600 text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors text-center"
          >
            Browse Profiles
          </Link>
        </div>

        {/* Popular Pages */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-3">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Link href="/search" className="text-orange-600 hover:text-orange-700">Search</Link>
            <span className="text-gray-300">•</span>
            <Link href="/chat" className="text-orange-600 hover:text-orange-700">Messages</Link>
            <span className="text-gray-300">•</span>
            <Link href="/notifications" className="text-orange-600 hover:text-orange-700">Notifications</Link>
            <span className="text-gray-300">•</span>
            <Link href="/profile/edit" className="text-orange-600 hover:text-orange-700">Edit Profile</Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
      <div className="fixed top-40 right-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" style={{animationDelay: '2s'}}></div>
      <div className="fixed bottom-20 left-20 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" style={{animationDelay: '4s'}}></div>
    </div>
  );
}
