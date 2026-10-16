// Small hand-drawn-style SVG pieces shared across the app (ink line art in the shop palette).
import type { CSSProperties } from 'react';

const INK = '#2B2420';

// Smooth closed blob through points around a centre (used for the wax seal's uneven edge).
function blob(cx: number, cy: number, r: number, seed = 1, n = 14) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const wob = 1 + 0.07 * Math.sin(i * 2.3 + seed) + 0.05 * Math.cos(i * 3.7 + seed * 2);
    return [cx + Math.cos(a) * r * wob, cy + Math.sin(a) * r * wob];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${mid(pts[n - 1], pts[0]).map((v) => v.toFixed(1)).join(' ')}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], m = mid(p, pts[(i + 1) % n]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}

export function Hanger({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 28 18" className={className} style={style} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 8V6.2C14 3.6 17.6 3.4 17.6 5.6c0 1.5-1.6 1.9-3.6 2.4" />
      <path d="M14 8 3 15.2c-.9.6-.5 1.4.5 1.4h21c1 0 1.4-.8.5-1.4L14 8Z" />
    </svg>
  );
}

export type ArtKind = 'hanger' | 'closet' | 'envelope' | 'search' | 'bell' | 'receipt';

// Empty-state illustrations: empty hanger, open wardrobe, empty envelope, magnifier, bell, receipt.
export function EmptyArt({ kind, size = 96 }: { kind: ArtKind; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 96 96', fill: 'none', stroke: INK, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (kind) {
    case 'closet':
      return (
        <svg {...common}>
          <rect x="18" y="12" width="60" height="72" rx="3" fill="#FBF8F2" />
          <path d="M48 12v72" strokeDasharray="3 4" />
          <path d="M18 12 8 18v62l10 4M78 12l10 6v62l-10 4" fill="#EADCC2" />
          <path d="M24 26h20M52 26h20" />
          <path d="M33 26v4c0-3 4-3 4 0M61 26v4c0-3 4-3 4 0" />
          <path d="M28 32l8 10h-16zM60 32l8 10H52z" fill="#F1DCD0" />
          <path d="M26 84v5M70 84v5" />
        </svg>
      );
    case 'envelope':
      return (
        <svg {...common}>
          <rect x="12" y="26" width="72" height="48" rx="3" fill="#FBF8F2" />
          <path d="M12 28 48 54 84 28" fill="#EADCC2" />
          <path d="M12 74 38 50M84 74 58 50" />
          <path d="M70 18c3-6 10-5 12 0" strokeDasharray="2 4" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="42" cy="42" r="24" fill="#FBF8F2" />
          <path d="m60 60 20 20" strokeWidth="5" />
          <path d="M42 30v2c0-4 6-4 6 0 0 3-6 3-6 7m-10 3 10-4 10 4z" strokeWidth="1.6" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M48 16c-14 0-22 10-22 24v14l-8 10h60l-8-10V40c0-14-8-24-22-24Z" fill="#FBF8F2" />
          <path d="M40 72c1 6 4 9 8 9s7-3 8-9" />
          <path d="M70 22l8-4" strokeDasharray="2 4" />
          <rect x="62" y="30" width="12" height="9" rx="1" fill="#F0D9D4" transform="rotate(14 68 34)" />
        </svg>
      );
    case 'receipt':
      return (
        <svg {...common}>
          <path d="M26 12h44v70l-6-5-6 5-5-5-5 5-6-5-5 5-6-5-5 5Z" fill="#FFFEFA" />
          <path d="M34 26h28M34 36h28M34 46h18" strokeDasharray="1 5" />
          <path d="M34 60h28" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M48 36V28c0-12 18-12 18 0 0 8-8 10-18 12" />
          <path d="M48 36 10 66c-4 3-2 8 3 8h70c5 0 7-5 3-8L48 36Z" fill="#FBF8F2" />
          <path d="M20 80h56" strokeDasharray="2 5" opacity=".6" />
        </svg>
      );
  }
}

// Wax seal with the "R" monogram. `cracked` splits it along a jagged line into two halves.
export function WaxSeal({ size = 44, label = 'R', half }: { size?: number; label?: string; half?: 'left' | 'right' }) {
  const id = `clip-${half ?? 'full'}-${size}-${label}`;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden style={{ overflow: 'visible' }}>
      {half && (
        <defs>
          <clipPath id={id}>
            <polygon points={half === 'left' ? '0,0 25,0 21,10 27,19 22,29 26,38 23,48 0,48' : '25,0 48,0 48,48 23,48 26,38 22,29 27,19 21,10'} />
          </clipPath>
        </defs>
      )}
      <g clipPath={half ? `url(#${id})` : undefined}>
        <path d={blob(24, 24, 20, 2)} fill="#8E1F1F" />
        <path d={blob(24, 24, 20, 2)} fill="none" stroke="#5E1212" strokeWidth="1" opacity=".5" />
        <circle cx="24" cy="24" r="14" fill="none" stroke="#B64A4A" strokeWidth="1.4" opacity=".75" />
        <circle cx="24" cy="24" r="14" fill="none" stroke="#5E1212" strokeWidth=".8" opacity=".4" transform="translate(.7 .8)" />
        <text x="24" y="31" textAnchor="middle" fontFamily="'Frank Ruhl Libre', serif" fontWeight="900" fontSize={label.length > 1 ? 11 : 22} fill="#F4EEE3">{label}</text>
      </g>
    </svg>
  );
}

// Deterministic barcode drawn from the tracking number.
export function Barcode({ value, className = '' }: { value: string; className?: string }) {
  let x = 4;
  const bars: JSX.Element[] = [];
  const digits = value.replace(/\D/g, '') || '0';
  for (let i = 0; i < 30; i++) {
    const d = Number(digits[i % digits.length]) + (i % 3);
    const w = 1 + (d % 3);
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="34" fill={INK} />);
    x += w + 1.2;
  }
  return <svg viewBox={`0 0 ${x + 4} 34`} className={className} preserveAspectRatio="none" aria-hidden>{bars}</svg>;
}

// Round post-office cancellation mark with the date and wavy lines.
export function Postmark({ date, size = 86 }: { date: Date; size?: number }) {
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
  return (
    <svg viewBox="0 0 160 90" width={size * 1.7} height={size} aria-hidden style={{ overflow: 'visible' }}>
      <g fill="none" stroke="#4A3F38" strokeWidth="1.6" opacity=".78">
        <circle cx="45" cy="45" r="38" />
        <circle cx="45" cy="45" r="30" strokeWidth="1" />
        <path d="M86 30q8-6 16 0t16 0 16 0 12 0M86 44q8-6 16 0t16 0 16 0 12 0M86 58q8-6 16 0t16 0 16 0 12 0" />
      </g>
      <defs><path id="pm-arc" d="M45 45m-33 0a33 33 0 1 1 66 0" /></defs>
      <text fontFamily="Heebo, sans-serif" fontWeight="700" fontSize="9" letterSpacing="2.4" fill="#4A3F38" opacity=".85"><textPath href="#pm-arc" startOffset="50%" textAnchor="middle">REWEAR POST</textPath></text>
      <text x="45" y="49" textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="700" fontSize="10" fill="#4A3F38" opacity=".85">{day}</text>
      <path d="M26 60h38" stroke="#4A3F38" strokeWidth="1" opacity=".7" />
    </svg>
  );
}

export function Pin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="13" cy="15" rx="7" ry="3" fill="#2B2420" opacity=".22" />
      <circle cx="12" cy="11" r="7.5" fill="#8E1F1F" />
      <circle cx="9.6" cy="8.6" r="2.4" fill="#C25555" opacity=".8" />
    </svg>
  );
}

export function Tape({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`block h-6 w-20 ${className}`} style={{ background: 'rgba(201,168,119,.55)', boxShadow: '0 1px 2px rgba(43,36,32,.18)', clipPath: 'polygon(0 8%, 6% 0, 12% 8%, 18% 0, 24% 8%, 30% 0, 36% 8%, 42% 0, 48% 8%, 54% 0, 60% 8%, 66% 0, 72% 8%, 78% 0, 84% 8%, 90% 0, 96% 8%, 100% 0, 100% 92%, 94% 100%, 88% 92%, 82% 100%, 76% 92%, 70% 100%, 64% 92%, 58% 100%, 52% 92%, 46% 100%, 40% 92%, 34% 100%, 28% 92%, 22% 100%, 16% 92%, 10% 100%, 4% 92%, 0 100%)', ...style }} />;
}
