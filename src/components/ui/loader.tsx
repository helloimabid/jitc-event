import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
}

export default function Loader({ fullScreen = false, className = '' }: LoaderProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen && 'fixed inset-0 bg-white dark:bg-black z-50',
        className
      )}
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32 animate-pulse">
        <img 
          src="/images/logo.png" 
          alt="JITC Logo"
          className="w-full h-full object-contain filter grayscale"
        />
      </div>
      <div className="mt-4 relative">
        <svg 
          className="animate-spin h-8 w-8 text-black dark:text-white" 
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
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="mt-4 text-lg font-semibold text-black dark:text-white">Loading...</p>
    </div>
  );
}
