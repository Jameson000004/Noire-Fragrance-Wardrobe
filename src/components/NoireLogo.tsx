import React from 'react';

interface NoireLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showWordmark?: boolean;
  wordmarkOnly?: boolean;
  className?: string;
}

export const NoireLogo: React.FC<NoireLogoProps> = ({
  size = 'md',
  showWordmark = true,
  wordmarkOnly = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: { width: 28, height: 28, font: 'text-xl' },
    md: { width: 44, height: 44, font: 'text-2xl' },
    lg: { width: 68, height: 68, font: 'text-3xl' },
    hero: { width: 92, height: 92, font: 'text-4xl' },
  }[size];

  if (wordmarkOnly) {
    return (
      <span
        className={`font-serif tracking-normal text-[#F4E9E5] select-none ${iconDimensions.font} ${className}`}
        style={{ fontFeatureSettings: '"kern", "liga"' }}
      >
        Noiré
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}>
      {/* SVG Flacon Silhouette with Internal Rose Teardrop */}
      <div
        className="relative flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(216,166,172,0.35)]"
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
      >
        <svg
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Glow gradient for glass contour */}
            <linearGradient id="flaconGlow" x1="20" y1="10" x2="80" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#F4E9E5" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D8A6AC" stopOpacity="0.7" />
            </linearGradient>

            {/* Internal Rose Liquid Swirl */}
            <radialGradient id="liquidSwirl" cx="50%" cy="55%" r="48%" fx="42%" fy="48%">
              <stop offset="0%" stopColor="#D8A6AC" />
              <stop offset="35%" stopColor="#A34F56" />
              <stop offset="75%" stopColor="#55282F" />
              <stop offset="100%" stopColor="#28171B" />
            </radialGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stopper / Cap */}
          <ellipse cx="50" cy="14" rx="18" ry="5.5" fill="url(#flaconGlow)" />
          <path d="M44 14C44 19 46 22 47 24H53C54 22 56 19 56 14Z" fill="url(#flaconGlow)" />

          {/* Flacon Neck Collar */}
          <path d="M42 24C42 25 45 26.5 50 26.5C55 26.5 58 25 58 24C58 23 55 22 50 22C45 22 42 23 42 24Z" fill="#F4E9E5" opacity="0.9" />

          {/* Amphora / Outer Flacon Curvature */}
          <path
            d="M45 26.5C40 32 23 44 21 57C19 69 24 88 35 96C42 101 58 101 65 96C76 88 81 69 79 57C77 44 60 32 55 26.5C52 27.5 48 27.5 45 26.5Z"
            stroke="url(#flaconGlow)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
          />

          {/* Inner Liquid Drop / Scent Swirl (Yin-Yang Essence) */}
          <path
            d="M50 42C41 42 35 48 35 58C35 70 43 78 50 78C57 78 65 72 65 62C65 52 59 42 50 42Z"
            fill="url(#liquidSwirl)"
          />
          <path
            d="M50 42C44 48 40 56 43 64C45 70 51 74 55 70C59 66 61 58 57 50C54 44 51 42 50 42Z"
            fill="#D8A6AC"
            opacity="0.38"
          />

          {/* Base pedestal */}
          <path d="M38 98C42 99.5 46 100 50 100C54 100 58 99.5 62 98" stroke="#F4E9E5" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`font-serif tracking-tight text-[#F4E9E5] ${iconDimensions.font}`}
          style={{ fontFeatureSettings: '"kern", "liga"' }}
        >
          Noiré
        </span>
      )}
    </div>
  );
};
