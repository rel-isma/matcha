// Button Component
'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const getButtonClasses = (variant: string, size: string, className?: string): string => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg',
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 active:bg-secondary-300',
    ghost: 'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200',
    link: 'text-primary-500 underline-offset-4 hover:underline p-0 h-auto',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-11 px-6 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };
  
  return `${baseClasses} ${variants[variant as keyof typeof variants] || variants.default} ${sizes[size as keyof typeof sizes] || sizes.default} ${className || ''}`;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant = 'default',
  size = 'default',
  children,
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  return (
    <button
      className={getButtonClasses(variant, size, className)}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
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
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
