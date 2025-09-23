// Avatar Component
'use client';

import React from 'react';
import Image from 'next/image';
import { getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl';
  fallbackName?: string;
  isOnline?: boolean;
  className?: string;
}

const Avatar = ({ 
  src, 
  alt, 
  size = 'default',
  fallbackName,
  isOnline = false,
  className
}: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    default: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const onlineIndicatorSizes = {
    sm: 'w-2 h-2',
    default: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-orange-100 flex items-center justify-center relative`}>
        {src ? (
          <Image
            src={src}
            alt={alt || 'Avatar'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <span className="font-medium text-orange-600">
            {fallbackName ? getInitials(fallbackName.split(' ')[0], fallbackName.split(' ')[1]) : '?'}
          </span>
        )}
      </div>
      
      {isOnline && (
        <div className={`absolute bottom-0 right-0 ${onlineIndicatorSizes[size]} bg-green-500 border-2 border-white rounded-full`} />
      )}
    </div>
  );
};

export { Avatar };
