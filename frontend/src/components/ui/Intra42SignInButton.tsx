'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from './Button';

interface Intra42SignInButtonProps {
  isLogin?: boolean;
}

const Intra42SignInButton: React.FC<Intra42SignInButtonProps> = ({ isLogin = true }) => {
  const handleIntra42SignIn = () => {
    // Redirect to backend 42 Intra OAuth route
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/42`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleIntra42SignIn}
      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
    >
      {/* 42 Logo */}
      <Image 
        src="/42_Logo.svg" 
        alt="42" 
        width={18}
        height={18}
        className="w-[18px] h-[18px] sm:w-5 sm:h-5 flex-shrink-0"
      />
      <span className="text-gray-700 font-medium text-[10px] sm:text-xs md:text-sm truncate">
        {isLogin ? '42 Intra' : '42 Intra'}
      </span>
    </Button>
  );
};

export default Intra42SignInButton;
