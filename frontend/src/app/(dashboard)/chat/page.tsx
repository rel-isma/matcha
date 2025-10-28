'use client';

import React from 'react';

export default function ChatPage() {
  return (
    <div className="py-4 md:py-6">      
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-[#1e293b] border border-[#334155] rounded-full mx-auto mb-4">
          <svg className="w-8 h-8 text-[#F39C12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-2">Chat Content Coming Soon</h2>
        <p className="text-[#94a3b8]">
          We&apos;re developing a seamless messaging experience for you and your matches.
        </p>
      </div>
    </div>
  );
}
