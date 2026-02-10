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
    default: 'bg-[#F39C12] text-white',
    secondary: 'bg-[#334155] text-[#f1f5f9]',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    outline: 'border border-[#334155] text-[#f1f5f9]',
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
