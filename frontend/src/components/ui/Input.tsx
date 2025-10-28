// Input Component
'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  className, 
  type = 'text',
  label,
  error,
  icon,
  ...props 
}, ref) => {
  const baseClasses = 'flex h-11 w-full rounded-lg border border-[#334155] bg-[#1e293b] px-3 py-2 text-sm text-[#f1f5f9] ring-offset-[#0f1729] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#94a3b8] focus:border-[#F39C12] focus:outline-none focus:ring-2 focus:ring-[#F39C12]/20 disabled:cursor-not-allowed disabled:opacity-50';
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[#f1f5f9]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`${baseClasses} ${errorClasses} ${icon ? 'pl-10' : ''} ${className || ''}`}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
