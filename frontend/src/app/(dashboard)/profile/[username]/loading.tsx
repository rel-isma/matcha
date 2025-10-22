import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="py-8 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Profile Header Skeleton */}
      <div className="relative mb-8">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-amber-100 to-orange-200 rounded-2xl opacity-30"></div>

        <div className="relative p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Profile Picture Skeleton */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 ring-4 ring-orange-200"></div>
              {/* Online Status */}
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gray-400 border-4 border-white"></div>
            </div>

            {/* Profile Info Skeleton */}
            <div className="flex-1 text-center md:text-left space-y-3">
              {/* Username */}
              <div className="h-4 w-24 bg-gray-300 rounded mx-auto md:mx-0"></div>
              
              {/* Full Name & Age */}
              <div className="h-8 w-48 bg-gray-300 rounded mx-auto md:mx-0"></div>
              
              {/* Status & Location */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>

              {/* Bio Skeleton */}
              <div className="space-y-2 max-w-2xl">
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-300 rounded"></div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-4">
                <div className="h-11 w-32 bg-gray-300 rounded-full"></div>
                <div className="h-11 w-32 bg-gray-300 rounded-full"></div>
                <div className="h-11 w-32 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Profile Stats - Desktop */}
            <div className="hidden md:flex flex-col gap-4 text-center">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 min-w-[120px]">
                <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-3 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
                <div className="h-3 w-16 bg-gray-300 rounded mx-auto"></div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
                <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-3 w-12 bg-gray-300 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Profile Stats - Mobile */}
          <div className="md:hidden mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center">
              <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-3 w-20 bg-gray-300 rounded mx-auto"></div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center">
              <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-gray-300 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="mb-8">
        <div className="border-b border-orange-200">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <div className="py-4 px-1 border-b-2 border-orange-500">
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="py-4 px-1">
              <div className="h-5 w-20 bg-gray-300 rounded"></div>
            </div>
          </nav>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden mb-4">
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-28 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg"></div>
              <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections Skeleton */}
      <div className="space-y-12">
        
        {/* Information Section Skeleton */}
        <div>
          <div className="h-8 w-40 bg-gray-300 rounded mb-8"></div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
            {/* Left Column */}
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Interests Tags Skeleton */}
          <div className="mt-12">
            <div className="h-6 w-32 bg-gray-300 rounded mb-6"></div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-9 w-24 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 bg-white rounded-full p-4 shadow-lg">
        <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
