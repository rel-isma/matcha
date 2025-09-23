'use client';

import React from 'react';

export default function SearchPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-800">Search</h1>
          <p className="text-secondary-600 mt-2">Find exactly who you're looking for</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-secondary-800 mb-2">Search Content Coming Soon</h2>
          <p className="text-secondary-600">
            We're building advanced search filters to help you find your perfect match.
          </p>
        </div>
      </div>
    </div>
  );
}
