import React, { useId } from 'react';

export interface NeoNovaLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'badge' | 'icon' | 'full';
  showSparkle?: boolean;
  glow?: boolean;
}

/**
 * NeoNova Official Brand Logo
 * Geometric modern educational prism 'N' crowned with the celestial Nova spark.
 */
export default function NeoNovaLogo({
  size = 32,
  className = '',
  variant = 'badge',
  showSparkle = true,
  glow = false
}: NeoNovaLogoProps) {
  const gradId = useId();
  const bgGradId = useId();
  const novaGradId = useId();
  const filterId = useId();

  const isFull = variant === 'full';
  const isIcon = variant === 'icon';

  const markSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${glow ? 'drop-shadow-[0_4px_12px_rgba(79,70,229,0.35)]' : ''}`}
      aria-label="NeoNova Brand Logo"
    >
      <defs>
        {/* Background Squircle Gradient (Obsidian to Deep Galactic Navy) */}
        <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1120" />
          <stop offset="50%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        {/* Dynamic Energy Gradient across the 'N' Diagonal */}
        <linearGradient id={gradId} x1="22%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#C7D2FE" />
          <stop offset="70%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Radiant Nova Star Gradient */}
        <radialGradient id={novaGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#67E8F9" />
          <stop offset="70%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </radialGradient>

        {/* Soft specular glow filter for the spark */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {!isIcon && (
        <>
          {/* Outer Squircle Container */}
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="24"
            fill={`url(#${bgGradId})`}
          />
          {/* Subtle Inner Glass Specular Border */}
          <rect
            x="3.75"
            y="3.75"
            width="92.5"
            height="92.5"
            rx="23.25"
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.5"
          />
          {/* Ambient Corner Accent */}
          <circle cx="85" cy="15" r="28" fill="#6366F1" opacity="0.18" filter="blur(10px)" />
        </>
      )}

      {/* Main Geometric 'N' Monogram */}
      <g id="neonova-monogram">
        {/* Left Vertical Stem */}
        <path
          d="M 22 75 V 25 C 22 23.9 22.9 23 24 23 H 33 C 34.5 23 35.8 23.8 36.5 25.1 L 63.5 64.5 V 25 C 63.5 23.9 64.4 23 65.5 23 H 74.5 C 75.6 23 76.5 23.9 76.5 25 V 75 C 76.5 76.1 75.6 77 74.5 77 H 65.5 C 64 77 62.7 76.2 62 74.9 L 35 35.5 V 75 C 35 76.1 34.1 77 33 77 H 24 C 22.9 77 22 76.1 22 75 Z"
          fill={isIcon ? '#1E1B4B' : `url(#${gradId})`}
        />

        {/* Diagonal Energy Accent Facet */}
        <path
          d="M 36.5 25.1 L 63.5 64.5 L 62 74.9 L 35 35.5 Z"
          fill={isIcon ? '#4F46E5' : 'url(#nova-grad-diagonal)'}
          opacity="0.9"
        />

        {/* The Radiant Nova Star (Spark of Knowledge) */}
        {showSparkle && (
          <g transform="translate(0, 0)">
            {/* Soft Ambient Sparkle Halo */}
            <circle cx="75" cy="20" r="7" fill="#38BDF8" opacity="0.3" filter="blur(2px)" />
            {/* 4-Pointed Precision Nova Diamond */}
            <path
              d="M 75 11 Q 75 20 84 20 Q 75 20 75 29 Q 75 20 66 20 Q 75 20 75 11 Z"
              fill={`url(#${novaGradId})`}
              filter={`url(#${filterId})`}
            />
            {/* Intense Stellar Core */}
            <circle cx="75" cy="20" r="1.8" fill="#FFFFFF" />
          </g>
        )}
      </g>
    </svg>
  );

  if (!isFull) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{markSvg}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {markSvg}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-black text-slate-900 tracking-tight text-base">
            <span>Neo</span>
            <span className="text-indigo-600 ml-[1px]">Nova</span>
          </span>
          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded font-sans uppercase">
            EDU
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
          AI-Powered Learning
        </span>
      </div>
    </div>
  );
}
