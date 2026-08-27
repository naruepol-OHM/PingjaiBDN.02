import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface SchoolEmblemProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'watermark';
  showBanner?: boolean;
  variant?: 'full' | 'shield' | 'glow' | 'minimal';
  overrideLogoUrl?: string;
  forceVector?: boolean;
  shape?: 'circle' | 'rounded' | 'original' | 'auto';
  fit?: 'contain' | 'cover';
  padding?: 'none' | 'small' | 'medium';
}

export const SchoolEmblem: React.FC<SchoolEmblemProps> = ({
  className = '',
  size = 'md',
  showBanner = false,
  variant = 'full',
  overrideLogoUrl,
  forceVector = false,
  shape = 'auto',
  fit,
  padding
}) => {
  const { schoolInfo } = useApp();
  const [imageError, setImageError] = useState(false);

  const sizeDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    hero: 'w-44 h-44 sm:w-52 sm:h-52',
    watermark: 'w-96 h-96'
  };

  const isWatermark = size === 'watermark';
  const customLogo = overrideLogoUrl || (schoolInfo?.customLogoType === 'image' ? schoolInfo?.logoUrl : null);

  // Determine effective shape, fit, padding
  const effectiveShape = shape !== 'auto' 
    ? shape 
    : schoolInfo?.logoShape || (size === 'xl' || size === '2xl' || size === 'hero' || variant === 'glow' ? 'circle' : 'rounded');

  const effectiveFit = fit || schoolInfo?.logoFit || 'contain';
  const effectivePadding = padding || schoolInfo?.logoPadding || (effectiveShape === 'circle' ? 'small' : 'none');

  const getShapeClass = () => {
    if (isWatermark) return '';
    switch (effectiveShape) {
      case 'circle':
        return 'rounded-full overflow-hidden';
      case 'rounded':
        return size === 'xs' || size === 'sm' ? 'rounded-lg overflow-hidden' : 'rounded-2xl overflow-hidden';
      case 'original':
      default:
        return 'rounded-xl overflow-hidden';
    }
  };

  const getPaddingClass = () => {
    if (isWatermark || effectiveFit === 'cover') return 'p-0';
    switch (effectivePadding) {
      case 'none':
        return 'p-0';
      case 'medium':
        return size === 'xs' || size === 'sm' ? 'p-0.5' : size === 'md' || size === 'lg' ? 'p-1.5' : 'p-2.5';
      case 'small':
      default:
        return size === 'xs' || size === 'sm' ? 'p-0.5' : size === 'md' ? 'p-1' : 'p-1.5';
    }
  };

  // If custom uploaded image logo is selected and available
  if (customLogo && !imageError && !forceVector) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${sizeDimensions[size]} ${className}`}
        title={schoolInfo?.schoolName || "ตราสัญลักษณ์ศูนย์พิงใจ"}
      >
        {/* Ambient Glow for hero/glow variants */}
        {(variant === 'glow' || size === 'hero' || size === '2xl') && (
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-sky-400/25 to-pink-500/30 rounded-full blur-xl -z-10 animate-pulse" />
        )}

        {/* Clean Frame with rounded clipping and white backing to fit any dark or light background */}
        <div
          className={`w-full h-full flex items-center justify-center bg-white shadow-2xs transition-all duration-300 ${getShapeClass()} ${getPaddingClass()} ${
            isWatermark ? 'bg-transparent shadow-none' : ''
          }`}
        >
          <img
            src={customLogo}
            alt={schoolInfo?.schoolName || "School Logo"}
            onError={() => setImageError(true)}
            className={`w-full h-full ${
              effectiveFit === 'cover' ? 'object-cover' : 'object-contain'
            } transition-transform duration-300 ${
              isWatermark ? 'opacity-10' : ''
            }`}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeDimensions[size]} ${className}`}
      title="ตราสัญลักษณ์โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี"
    >
      {/* Ambient Glow for hero/glow variants */}
      {(variant === 'glow' || size === 'hero' || size === '2xl') && (
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-sky-400/25 to-pink-500/30 rounded-full blur-xl -z-10 animate-pulse" />
      )}

      {/* SVG Royal Phra Kiao Emblem */}
      <svg
        viewBox="0 0 240 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md transition-transform duration-300 ${
          isWatermark ? 'opacity-10' : ''
        }`}
      >
        <defs>
          {/* Gold Radiant Gradients */}
          <linearGradient id="phraKiaoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>

          {/* School Theme Trio Gradients (Blue - Sky - Pink) */}
          <linearGradient id="bdnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />    {/* Royal Blue */}
            <stop offset="50%" stopColor="#0284C7" />   {/* Sky Blue */}
            <stop offset="100%" stopColor="#E11D48" />  {/* Pink / Rose */}
          </linearGradient>

          <linearGradient id="pinkAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>

          <linearGradient id="blueRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Radial Aura */}
          <radialGradient id="auraGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>

          {/* Shadow Filter */}
          <filter id="emblemShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Aura Background */}
        <circle cx="120" cy="115" r="95" fill="url(#auraGlow)" />

        {/* Sun Ray Beams behind Phra Kiao */}
        <g stroke="#FCD34D" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="3 3">
          <line x1="120" y1="15" x2="120" y2="40" />
          <line x1="155" y1="25" x2="140" y2="50" />
          <line x1="185" y1="55" x2="160" y2="70" />
          <line x1="85" y1="25" x2="100" y2="50" />
          <line x1="55" y1="55" x2="80" y2="70" />
        </g>

        {/* Outer Circular Rim with School Colors (Blue - Cyan - Pink) */}
        <circle
          cx="120"
          cy="115"
          r="86"
          fill="none"
          stroke="url(#bdnGrad)"
          strokeWidth="3.5"
          className="drop-shadow-xs"
        />
        <circle
          cx="120"
          cy="115"
          r="80"
          fill="white"
          fillOpacity="0.85"
          stroke="#F59E0B"
          strokeWidth="1.2"
        />

        {/* Phra Kiao (พระเกี้ยว) Coronet Structure */}
        <g id="phra-kiao" filter="url(#emblemShadow)">
          {/* Top Radiance Spear / Pinnacle (ยอดพุ่มข้าวบิณฑ์ / กรรเจียกจอน) */}
          <path
            d="M 120 28 L 123 48 L 126 58 L 120 62 L 114 58 L 117 48 Z"
            fill="url(#phraKiaoGold)"
            stroke="#92400E"
            strokeWidth="0.8"
          />
          {/* Central Top Diamond */}
          <polygon points="120,24 123,32 120,40 117,32" fill="#FEF08A" />

          {/* Upper Crown Flairs (รัศมีพระเกี้ยวซ้าย-ขวา) */}
          <path
            d="M 120 55 C 132 45 148 48 156 60 C 146 64 135 63 120 68 C 105 63 94 64 84 60 C 92 48 108 45 120 55 Z"
            fill="url(#phraKiaoGold)"
            stroke="#92400E"
            strokeWidth="0.8"
          />

          {/* Secondary Tier Wings */}
          <path
            d="M 120 68 C 138 60 160 65 170 82 C 154 85 140 82 120 88 C 100 82 86 85 70 82 C 80 65 102 60 120 68 Z"
            fill="url(#goldShine)"
            stroke="#B45309"
            strokeWidth="0.8"
          />

          {/* Main Tier Coronet Body (วงเกล้าพระเกี้ยว) */}
          <path
            d="M 72 88 C 90 82 110 80 120 80 C 130 80 150 82 168 88 C 172 108 162 124 120 128 C 78 124 68 108 72 88 Z"
            fill="url(#phraKiaoGold)"
            stroke="#78350F"
            strokeWidth="1"
          />

          {/* Royal Coronet Ornaments & Gems (ลวดลายประดับกระจังตาอ้อย) */}
          {/* Center Pink/Rose Sacred Gem */}
          <circle cx="120" cy="100" r="7" fill="url(#pinkAccent)" stroke="#FFF" strokeWidth="1" />
          <circle cx="120" cy="100" r="3.5" fill="#FFE4E6" />

          {/* Flanking Blue Gems */}
          <circle cx="98" cy="98" r="4.5" fill="#0284C7" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="142" cy="98" r="4.5" fill="#0284C7" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="82" cy="94" r="3.5" fill="#1E40AF" stroke="#FEF08A" strokeWidth="0.6" />
          <circle cx="158" cy="94" r="3.5" fill="#1E40AF" stroke="#FEF08A" strokeWidth="0.6" />

          {/* Filigree Garland Dots on Crown */}
          <circle cx="109" cy="88" r="2" fill="#FEF08A" />
          <circle cx="131" cy="88" r="2" fill="#FEF08A" />
          <circle cx="120" cy="76" r="2.5" fill="#FEF08A" />

          {/* Pedestal Base (ฐานพระเกี้ยว / พานรอง) */}
          <path
            d="M 88 124 C 104 128 136 128 152 124 L 158 136 C 142 142 98 142 82 136 Z"
            fill="url(#goldShine)"
            stroke="#78350F"
            strokeWidth="0.8"
          />
          <path
            d="M 94 136 C 108 140 132 140 146 136 L 150 144 C 134 148 106 148 90 144 Z"
            fill="url(#phraKiaoGold)"
            stroke="#78350F"
            strokeWidth="0.8"
          />
        </g>

        {/* Central Monogram / Text: บ.ด.น. */}
        <g filter="url(#emblemShadow)">
          <rect
            x="76"
            y="148"
            width="88"
            height="24"
            rx="12"
            fill="url(#blueRibbon)"
            stroke="#FDE047"
            strokeWidth="1.2"
          />
          <text
            x="120"
            y="164.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13"
            fontWeight="900"
            letterSpacing="1.5"
            fontFamily="sans-serif"
          >
            บ.ด.น.
          </text>
        </g>

        {/* Lower Banner Ribbon with School Name */}
        <g filter="url(#emblemShadow)">
          {/* Ribbon Tails */}
          <path
            d="M 32 188 L 18 198 L 32 208 L 48 198 Z"
            fill="#1E3A8A"
            stroke="#F59E0B"
            strokeWidth="0.6"
          />
          <path
            d="M 208 188 L 222 198 L 208 208 L 192 198 Z"
            fill="#1E3A8A"
            stroke="#F59E0B"
            strokeWidth="0.6"
          />

          {/* Main Curved Banner */}
          <path
            d="M 36 190 C 76 180 164 180 204 190 C 200 208 160 216 120 216 C 80 216 40 208 36 190 Z"
            fill="url(#blueRibbon)"
            stroke="#FDE047"
            strokeWidth="1.4"
          />

          {/* Banner Text - Bodindecha Nonthaburi */}
          <text
            x="120"
            y="203"
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            บดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี
          </text>
        </g>

        {/* Bottom Pink Ribbon Bow Highlight */}
        <path
          d="M 112 216 C 116 222 124 222 128 216 L 132 226 C 124 228 116 228 108 226 Z"
          fill="url(#pinkAccent)"
        />
      </svg>
    </div>
  );
};
