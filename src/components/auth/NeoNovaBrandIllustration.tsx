import React from 'react';

/**
 * NeoNovaBrandIllustration
 * A bespoke, precision-crafted vector illustration representing focused learning:
 * - A clean, open hardbound study notebook / textbook with ruled lines and bookmarks
 * - Balanced geometric instruments (drafting compass, ruler, Cartesian coordinate grid)
 * - Subtle mathematical and scientific notation (∑, ∫, π, E=mc², Δt)
 * - An integrated geometric 'N' monogram mark with the radiant Nova spark
 * - Subtle, restrained cyan -> blue -> violet accents on clean white/soft-slate geometry
 * 
 * Engineered without random AI neon particles or glow rings.
 */
export default function NeoNovaBrandIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-md mx-auto aspect-4/3 flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 460 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle signature transition for the engineered path */}
          <linearGradient id="brandSigGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />   {/* Cyan */}
            <stop offset="50%" stopColor="#2563EB" />  {/* Blue */}
            <stop offset="100%" stopColor="#7C3AED" /> {/* Violet */}
          </linearGradient>

          {/* Soft surface gradient for open book pages */}
          <linearGradient id="pageGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="pageGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>

          {/* Subtle card shadow */}
          <filter id="softPlateShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* 1. Underlying Architectural Grid Pattern (Engineering / Geometry Desk) */}
        <g opacity="0.45">
          {/* Grid lines */}
          <path
            d="M 60 70 H 400 M 60 110 H 400 M 60 150 H 400 M 60 190 H 400 M 60 230 H 400 M 60 270 H 400"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M 90 50 V 290 M 140 50 V 290 M 190 50 V 290 M 240 50 V 290 M 290 50 V 290 M 340 50 V 290 M 390 50 V 290"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </g>

        {/* 2. Abstract Geometric Canvas / Desk Surface Base Plate */}
        <rect
          x="70"
          y="65"
          width="320"
          height="220"
          rx="20"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          filter="url(#softPlateShadow)"
        />

        {/* 3. Coordinate Axes & Calibration Ticks (Academic Rigor) */}
        <g opacity="0.8">
          {/* X and Y baseline */}
          <line x1="95" y1="250" x2="210" y2="250" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="95" y1="250" x2="95" y2="155" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Axis arrowheads */}
          <path d="M 92 158 L 95 152 L 98 158" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
          <path d="M 207 247 L 213 250 L 207 253" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
          {/* Sine / Sigmoid curve representing mathematics and growth */}
          <path
            d="M 95 245 Q 125 245 145 205 T 195 165"
            stroke="#0284C7"
            strokeWidth="2"
            fill="none"
          />
          {/* Critical Point */}
          <circle cx="145" cy="205" r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
        </g>

        {/* 4. Centerpiece: The Academic Open Book (Real Study Metaphor) */}
        <g transform="translate(145, 120)">
          {/* Book Spine Shadow */}
          <ellipse cx="85" cy="115" rx="75" ry="10" fill="#0F172A" opacity="0.05" />

          {/* Book Cover Base (Indigo / Slate binding) */}
          <path
            d="M 10 98 Q 85 108 85 108 Q 85 108 160 98 L 165 104 Q 85 114 85 114 Q 85 114 5 104 Z"
            fill="#1E293B"
          />

          {/* Left Page Leaf */}
          <path
            d="M 12 95 Q 50 92 84 98 L 84 25 Q 50 18 12 24 Z"
            fill="url(#pageGradLeft)"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />

          {/* Right Page Leaf */}
          <path
            d="M 86 98 Q 120 92 158 95 L 158 24 Q 120 18 86 25 Z"
            fill="url(#pageGradRight)"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />

          {/* Center Spine Crease */}
          <line x1="85" y1="23" x2="85" y2="100" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Left Page Text Lines & Formula */}
          <g opacity="0.6">
            <line x1="24" y1="36" x2="72" y2="38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="46" x2="68" y2="48" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="56" x2="74" y2="58" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="66" x2="58" y2="68" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="76" x2="66" y2="78" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Right Page: Verified Academic Theorem Highlight */}
          <g>
            <rect x="96" y="34" width="52" height="18" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
            <text x="122" y="46" fontSize="9" fontWeight="bold" fill="#1D4ED8" textAnchor="middle" fontFamily="ui-monospace, monospace">
              E = mc²
            </text>
            <line x1="96" y1="60" x2="148" y2="58" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            <line x1="96" y1="70" x2="136" y2="68" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            <line x1="96" y1="80" x2="144" y2="78" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Precision Ribbon Bookmark in Signature Violet */}
          <path
            d="M 85 24 V 85 L 90 80 L 95 85 V 24 Z"
            fill="#6366F1"
            opacity="0.9"
          />
        </g>

        {/* 5. Precision Drafting Ruler with Ticks */}
        <g transform="translate(95, 95) rotate(-14)">
          <rect x="0" y="0" width="85" height="16" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="10" y1="0" x2="10" y2="6" stroke="#94A3B8" strokeWidth="1" />
          <line x1="20" y1="0" x2="20" y2="9" stroke="#64748B" strokeWidth="1" />
          <line x1="30" y1="0" x2="30" y2="6" stroke="#94A3B8" strokeWidth="1" />
          <line x1="40" y1="0" x2="40" y2="9" stroke="#64748B" strokeWidth="1" />
          <line x1="50" y1="0" x2="50" y2="6" stroke="#94A3B8" strokeWidth="1" />
          <line x1="60" y1="0" x2="60" y2="9" stroke="#64748B" strokeWidth="1" />
          <line x1="70" y1="0" x2="70" y2="6" stroke="#94A3B8" strokeWidth="1" />
        </g>

        {/* 6. Scientific Flask / Atom Orbit Token (Science & Discovery) */}
        <g transform="translate(325, 90)">
          {/* Subtle Orbit Ring */}
          <ellipse cx="20" cy="20" rx="26" ry="10" transform="rotate(-30 20 20)" stroke="#E0E7FF" strokeWidth="1.2" fill="none" />
          {/* Flask Body */}
          <path
            d="M 16 6 H 24 V 14 L 34 28 C 36 31 34 35 30 35 H 10 C 6 35 4 31 6 28 L 16 14 Z"
            fill="#F0FDFA"
            stroke="#0D9488"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Fluid Level */}
          <path
            d="M 8 30 Q 14 27 20 29 Q 26 31 32 30 C 33 32 32 35 30 35 H 10 C 7 35 7 32 8 30 Z"
            fill="#CCFBF1"
          />
          {/* Tiny reactant bubble */}
          <circle cx="20" cy="22" r="1.5" fill="#0D9488" opacity="0.6" />
        </g>

        {/* 7. Discreet Floating Academic Notation Badges (Clean, no clutter) */}
        {/* Delta / Triangle */}
        <g transform="translate(105, 185)">
          <rect x="0" y="0" width="26" height="26" rx="7" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="13" y="17" fontSize="12" fontWeight="600" fill="#64748B" textAnchor="middle" fontFamily="serif">Δ</text>
        </g>

        {/* Integral / Calculus */}
        <g transform="translate(345, 175)">
          <rect x="0" y="0" width="26" height="26" rx="7" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="13" y="18" fontSize="13" fontWeight="bold" fill="#6366F1" textAnchor="middle" fontFamily="serif">∫</text>
        </g>

        {/* Pi Symbol */}
        <g transform="translate(315, 230)">
          <rect x="0" y="0" width="24" height="24" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="12" y="16" fontSize="11" fontWeight="bold" fill="#0284C7" textAnchor="middle" fontFamily="serif">π</text>
        </g>

        {/* 8. Integrated Geometric NeoNova "N" Identity Mark with Radiant Nova Spark */}
        {/* Subtle branded hallmark stamp in bottom-left */}
        <g transform="translate(90, 80)">
          <rect x="0" y="0" width="32" height="32" rx="9" fill="#0B1120" />
          {/* Geometric N */}
          <path
            d="M 8 24 V 8 H 11.5 L 20.5 20.5 V 8 H 24 V 24 H 20.5 L 11.5 11.5 V 24 Z"
            fill="#FFFFFF"
          />
          {/* Tiny Cyan Nova Spark */}
          <path
            d="M 23 6 Q 23 9 26 9 Q 23 9 23 12 Q 23 9 20 9 Q 23 9 23 6 Z"
            fill="#38BDF8"
          />
        </g>

        {/* 9. The Engineered Flowing Signature Line: Travelling toward the Auth Panel */}
        {/* Restrained Cyan -> Blue -> Violet hairline starting from the plate */}
        <path
          d="M 125 96 C 200 96 260 75 350 78 C 390 79 425 92 455 105"
          stroke="url(#brandSigGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <circle cx="455" cy="105" r="3" fill="#7C3AED" />
      </svg>
    </div>
  );
}
