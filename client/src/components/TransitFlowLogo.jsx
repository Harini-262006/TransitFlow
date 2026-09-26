import React from 'react';

const TransitFlowLogo = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic TransitFlow Emblem */}
      <div
        className={`${iconSizes[size] || iconSizes.md} rounded-xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center text-white shadow-lg shadow-[#10B981]/20 relative overflow-hidden shrink-0`}
      >
        {/* Subtle geometric line effect */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:10px_10px]" />
        
        {/* Modern Vector Transit Flow Mark */}
        <svg
          className="w-3/5 h-3/5 text-white drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Bus body silhouette */}
          <rect x="3" y="3" width="18" height="13" rx="3" />
          <path d="M3 8h18" />
          <circle cx="7" cy="18.5" r="2.5" />
          <circle cx="17" cy="18.5" r="2.5" />
          {/* Flow pulse */}
          <path d="M10 11.5l1.8 1.8 4-4" strokeWidth="2.5" stroke="#FFFFFF" />
        </svg>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-white ${textSizes[size] || textSizes.md} leading-none`}>
            Transit<span className="text-[#10B981]">Flow</span>
          </span>
        </div>
        {showTagline && (
          <p className="text-[10px] text-[#667085] font-semibold tracking-wider uppercase mt-0.5">
            Smarter Staff • Better Shifts • Efficient Operations
          </p>
        )}
      </div>
    </div>
  );
};

export default TransitFlowLogo;
