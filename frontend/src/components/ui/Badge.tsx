// Badge Component
'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className,
  ...props 
}: BadgeProps) => {
  const variants = {
    default: 'bg-orange-100 text-orange-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'border border-secondary-200 text-secondary-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
