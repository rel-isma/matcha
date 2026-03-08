import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoadingPage() {
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
              width={0}
              height={0}
              className="w-20 h-20"
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
            Preparing your perfect dating experience
          </p>
        </div>

        {/* Navigation for testing */}
        <div className="pt-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
              Home
            </Link>
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Login
            </Link>
            <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium">
              Register
            </Link>
            <Link href="/browse" className="text-orange-600 hover:text-orange-700 font-medium">
              Browse
            </Link>
            <Link href="/search" className="text-orange-600 hover:text-orange-700 font-medium">
              Search
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="fixed top-40 right-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{animationDelay: '2s'}}></div>
      <div className="fixed bottom-20 left-20 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{animationDelay: '4s'}}></div>
    </div>
  );
}
