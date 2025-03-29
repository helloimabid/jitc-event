import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-current"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
        />
        <path
          d="M70 60H130V80H110V140H90V80H70V60Z"
          fill="currentColor"
        />
        <path
          d="M50 100C50 72.3858 72.3858 50 100 50"
          stroke="currentColor"
          strokeWidth="10"
        />
        <path
          d="M100 150C127.614 150 150 127.614 150 100"
          stroke="currentColor"
          strokeWidth="10"
        />
      </svg>
    </div>
  );
}
