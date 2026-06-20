import React from 'react';

interface LogoSvgProps {
  className?: string;
  size?: number | string;
}

export default function LogoSvg({ className = '', size = 48 }: LogoSvgProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      {/* 1. Black overhead circle (O shape) */}
      <circle 
        cx="50" 
        cy="28" 
        r="21" 
        stroke="currentColor" 
        strokeWidth="6.5" 
        fill="none"
      />
      
      {/* 2. Red dynamic triangle pointing down, nested inside the circle's base */}
      <path 
        d="M43.5 37 L56.5 37 L50 46 Z" 
        fill="#EF4444" 
      />
      
      {/* 3. Green dynamic curved crescent smile/line (U shape) framing the circle */}
      <path 
        d="M20 40 C34 56 66 56 80 40 C68 47 32 47 20 40" 
        fill="#22C55E" 
      />
      
      {/* 4. Broad black curved arc/crescent underneath the entire shape */}
      <path 
        d="M5 85 C22 55 78 55 95 85 C78 61 22 61 5 85" 
        fill="currentColor"
      />
    </svg>
  );
}
