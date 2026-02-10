// Card Component
'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div 
      className={`bg-[#1e293b] rounded-xl shadow-md border border-[#334155] ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
  return (
    <div 
      className={`p-6 pb-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }: CardTitleProps) => {
  return (
    <h3 
      className={`text-lg font-semibold text-[#f1f5f9] ${className || ''}`}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div 
      className={`px-6 pb-6 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }: CardFooterProps) => {
  return (
    <div 
      className={`px-6 py-4 bg-[#0f1729] rounded-b-xl border-t border-[#334155] ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
