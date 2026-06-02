'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
}

const sizes = {
  sm: { outer: 32, inner: 22, fontSize: 'text-lg', subFont: 'text-xs' },
  md: { outer: 48, inner: 34, fontSize: 'text-2xl', subFont: 'text-xs' },
  lg: { outer: 64, inner: 46, fontSize: 'text-3xl', subFont: 'text-sm' },
  xl: { outer: 96, inner: 70, fontSize: 'text-5xl', subFont: 'text-base' },
};

export default function Logo({ size = 'md', showSubtitle = true, subtitle }: LogoProps) {
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Icon mark */}
      <div className="relative flex-shrink-0" style={{ width: s.outer, height: s.outer }}>
        {/* Outer ring */}
        <svg width={s.outer} height={s.outer} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer octagonal frame */}
          <polygon
            points="48,4 76,16 92,44 92,52 76,80 48,92 20,80 4,52 4,44 20,16"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
          />
          {/* Inner circle */}
          <circle cx="48" cy="48" r="28" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="4 2" />
          {/* Yin-yang inspired center */}
          <circle cx="48" cy="48" r="18" fill="url(#darkGrad)" />
          {/* 八 symbol stylized */}
          <text x="48" y="55" textAnchor="middle" fill="url(#goldGrad)" fontSize="20" fontFamily="serif" fontWeight="600">八</text>
          {/* Corner stars */}
          {[16, 80, 16, 80].map((_, i) => null)}
          <circle cx="48" cy="8" r="2" fill="#C9A84C" opacity="0.6" />
          <circle cx="88" cy="48" r="2" fill="#C9A84C" opacity="0.6" />
          <circle cx="48" cy="88" r="2" fill="#C9A84C" opacity="0.6" />
          <circle cx="8" cy="48" r="2" fill="#C9A84C" opacity="0.6" />
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A84C" />
              <stop offset="50%" stopColor="#E8C97A" />
              <stop offset="100%" stopColor="#9A7A2E" />
            </linearGradient>
            <radialGradient id="darkGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1A1A26" />
              <stop offset="100%" stopColor="#0A0A0F" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span
          className={`font-display font-semibold tracking-[0.15em] text-gold-shimmer leading-none ${s.fontSize}`}
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          THE SAJU
        </span>
        {showSubtitle && (
          <span className={`text-saju-gold/60 tracking-widest uppercase mt-0.5 ${s.subFont}`}>
            {subtitle || '四柱命理 · Destiny Mapping'}
          </span>
        )}
      </div>
    </div>
  );
}

// Inline SVG logo for sharing/OG use
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="48,4 76,16 92,44 92,52 76,80 48,92 20,80 4,52 4,44 20,16"
        fill="none" stroke="#C9A84C" strokeWidth="2" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="#C9A84C" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="48" cy="48" r="18" fill="#12121A" />
      <text x="48" y="55" textAnchor="middle" fill="#C9A84C" fontSize="20" fontFamily="serif" fontWeight="600">八</text>
      <circle cx="48" cy="8" r="2" fill="#C9A84C" opacity="0.8" />
      <circle cx="88" cy="48" r="2" fill="#C9A84C" opacity="0.8" />
      <circle cx="48" cy="88" r="2" fill="#C9A84C" opacity="0.8" />
      <circle cx="8" cy="48" r="2" fill="#C9A84C" opacity="0.8" />
    </svg>
  );
}
