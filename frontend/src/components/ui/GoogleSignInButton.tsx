'use client';

import React from 'react';
import { Button } from './Button';

interface GoogleSignInButtonProps {
  isLogin?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ isLogin = true }) => {
  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth route
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
    >
      {/* Google Icon SVG */}
      <svg 
        width="18" 
        height="18"
        className="sm:w-5 sm:h-5 flex-shrink-0"
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span className="text-gray-700 font-medium text-[10px] sm:text-xs md:text-sm truncate">
        {isLogin ? 'Google' : 'Google'}
      </span>
    </Button>
  );
};

export default GoogleSignInButton;
