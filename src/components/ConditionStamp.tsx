import type { Condition } from '../types';

const META: Record<Condition, { en: string; color: string; rot: number }> = {
  'חדש עם תווית': { en: 'NEW WITH TAG', color: 'text-ok', rot: -3 },
  'כמו חדש': { en: 'LIKE NEW', color: 'text-primary-hover', rot: 2.5 },
  'טוב מאוד': { en: 'VERY GOOD', color: 'text-kraft-dark', rot: -2 },
  'טוב': { en: 'GOOD', color: 'text-ink-soft', rot: 3 },
};

// Item condition as a rubber stamp: double border, letter-spaced, uneven ink, slightly crooked.
export default function ConditionStamp({ condition, size = 'sm' }: { condition: Condition; size?: 'sm' | 'md' }) {
  const m = META[condition];
  const big = size === 'md';
  return (
    <span className={`stamp ${m.color} ${big ? 'px-3 py-1.5 text-lg' : 'text-[12px]'}`} style={{ transform: `rotate(${m.rot}deg)` }}>
      <span>{condition}</span>
      {big && <span aria-hidden className="mt-0.5 font-sans text-[9px] font-bold tracking-[.18em]">{m.en}</span>}
    </span>
  );
}
