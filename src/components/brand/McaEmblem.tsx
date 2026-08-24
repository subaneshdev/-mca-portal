import React from 'react';

export function AshokaEmblem({ className = "w-10 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Government of India Emblem"
    >
      {/* Three Lions Representation */}
      <g stroke="#1A2B4C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#1A2B4C">
        {/* Central Lion Head */}
        <path d="M50 18 C50 10, 70 10, 70 18 C74 14, 82 18, 80 26 C84 30, 82 40, 76 44 C76 52, 68 58, 60 58 C52 58, 44 52, 44 44 C38 40, 36 30, 40 26 C38 18, 46 14, 50 18 Z" fill="#F8F9FA" />
        
        {/* Mane Details Central */}
        <path d="M48 28 Q60 36 72 28" fill="none" strokeWidth="2" />
        <path d="M46 36 Q60 46 74 36" fill="none" strokeWidth="2" />
        <path d="M52 44 Q60 50 68 44" fill="none" strokeWidth="2" />
        
        {/* Left Lion Profile */}
        <path d="M38 24 C30 20, 20 28, 22 38 C16 42, 16 52, 24 58 C20 66, 28 72, 36 70 C42 66, 44 58, 40 50 Z" fill="#F8F9FA" />
        <path d="M26 34 Q34 40 38 32" fill="none" strokeWidth="1.8" />
        <path d="M22 46 Q32 50 36 44" fill="none" strokeWidth="1.8" />
        
        {/* Right Lion Profile */}
        <path d="M82 24 C90 20, 100 28, 98 38 C104 42, 104 52, 96 58 C100 66, 92 72, 84 70 C78 66, 76 58, 80 50 Z" fill="#F8F9FA" />
        <path d="M94 34 Q86 40 82 32" fill="none" strokeWidth="1.8" />
        <path d="M98 46 Q88 50 84 44" fill="none" strokeWidth="1.8" />

        {/* Central Torso & Paws */}
        <path d="M42 58 L42 86 Q42 90 48 90 L72 90 Q78 90 78 86 L78 58 Z" fill="#F8F9FA" />
        <path d="M48 70 L48 88" strokeWidth="2" />
        <path d="M72 70 L72 88" strokeWidth="2" />
        <path d="M54 62 L54 88" strokeWidth="1.5" />
        <path d="M66 62 L66 88" strokeWidth="1.5" />

        {/* Abacus / Base Platform */}
        <rect x="18" y="92" width="84" height="18" rx="2" fill="#FFFFFF" strokeWidth="2.5" />
        
        {/* Ashoka Chakra in Center of Abacus */}
        <circle cx="60" cy="101" r="7" fill="none" stroke="#1A2B4C" strokeWidth="1.8" />
        <circle cx="60" cy="101" r="1.5" fill="#1A2B4C" />
        {/* Spokes */}
        <line x1="60" y1="94" x2="60" y2="108" strokeWidth="1" />
        <line x1="53" y1="101" x2="67" y2="101" strokeWidth="1" />
        <line x1="55" y1="96" x2="65" y2="106" strokeWidth="1" />
        <line x1="55" y1="106" x2="65" y2="96" strokeWidth="1" />

        {/* Galloping Horse (Left) & Bull (Right) Figures on Abacus */}
        <path d="M26 103 Q30 96 36 100 Q40 104 34 105 Z" fill="#1A2B4C" />
        <path d="M84 103 Q88 96 94 100 Q98 104 92 105 Z" fill="#1A2B4C" />

        {/* Bell Lotus Base */}
        <path d="M22 110 Q60 118 98 110 L94 122 Q60 128 26 122 Z" fill="#F8F9FA" strokeWidth="2" />
        <line x1="38" y1="113" x2="36" y2="123" strokeWidth="1.5" />
        <line x1="48" y1="115" x2="47" y2="125" strokeWidth="1.5" />
        <line x1="60" y1="116" x2="60" y2="126" strokeWidth="1.5" />
        <line x1="72" y1="115" x2="73" y2="125" strokeWidth="1.5" />
        <line x1="82" y1="113" x2="84" y2="123" strokeWidth="1.5" />

        {/* Plinth Base */}
        <rect x="20" y="124" width="80" height="6" fill="#1A2B4C" />
      </g>

      {/* Satyameva Jayate (Devanagari Script) */}
      <text
        x="60"
        y="146"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="#1A2B4C"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

export function McaLogoBadge({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MCA Emblem"
    >
      <rect width="100" height="100" rx="8" fill="#0A2A5C" />
      {/* 2x2 Grid Badge */}
      <text x="24" y="42" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">M</text>
      {/* Top right geometric graphic */}
      <polygon points="76,16 54,42 76,42" fill="#0088FF" />
      <text x="24" y="86" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">C</text>
      <text x="74" y="86" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">A</text>
    </svg>
  );
}
