'use client';

import React from 'react';

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-800">My Profile</h1>
          <p className="text-secondary-600 mt-2">Manage your profile and preferences</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-secondary-800 mb-2">Profile Content Coming Soon</h2>
          <p className="text-secondary-600">
            We're building your personalized profile management system.
          </p>
        </div>
      </div>
    </div>
  );
}
