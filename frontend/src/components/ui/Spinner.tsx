// Spinner Component
'use client';

import React from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
}

interface LoadingProps {
  text?: string;
  className?: string;
}

const Spinner = ({ size = 'default', className, ...props }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className || ''}`} {...props}>
      <svg
        className="animate-spin text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

// Loading component with text
const Loading = ({ text = 'Loading...', className }: LoadingProps) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className || ''}`}>
      <div className="text-center">
        <Spinner size="lg" className="text-orange-500 mb-3" />
        <p className="text-secondary-600 text-sm">{text}</p>
      </div>
    </div>
  );
};

export { Spinner, Loading };
