import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Order, User } from '../types';
import { fmt } from '../lib/money';
import { Avatar } from './Avatar';
import { WaxSeal } from './Art';

// Where is the money? In a sealed envelope. Release cracks the seal and the note flies to the seller.
type Phase = 'sealed' | 'disputed' | 'crack' | 'open' | 'rise' | 'fly' | 'done' | 'returned';

const staticPhase = (s: Order['status']): Phase =>
  s === 'completed' ? 'done' : s === 'refunded' ? 'returned' : s === 'disputed' ? 'disputed' : 'sealed';

const CLOSED_FLAP = 'M10 36L110 98L210 36Z';
const OPEN_FLAP = 'M10 36L110 -30L210 36Z';

const caption = (o: Order, buyer: User, seller: User) => ({
  paid_escrow: `${fmt(o.itemPrice)} · שמור עבור ${seller.name}`,
  shipped: `${fmt(o.itemPrice)} · שמור עבור ${seller.name}`,
  delivered: `${fmt(o.itemPrice)} · שמור עבור ${seller.name}`,
  disputed: 'מוקפא עד לבירור',
  completed: `${fmt(o.itemPrice)} הגיעו אל ${seller.name}`,
  refunded: `${fmt(o.total)} חזרו אל ${buyer.name}`,
})[o.status];

const sub = (seller: string) => ({
  paid_escrow: 'הכסף מחכה במעטפה סגורה עד שהבגד מגיע',
  shipped: `${seller} ארז ושלח. המעטפה נשארת סגורה`,
  delivered: 'המעטפה תיפתח רק אחרי שהקונה יאשר שהכול תקין',
  disputed: 'הוספנו חותם והדבקנו סרט. אף אחד לא נוגע בכסף',
  completed: 'החותם נשבר והכסף עבר למוכר',
  refunded: 'המעטפה חזרה סגורה אל הקונה, כולל המשלוח וההגנה',
});

export default function EnvelopeFlow({ order, buyer, seller }: { order: Order; buyer: User; seller: User }) {
  const reduce = useReducedMotion();
  const target = staticPhase(order.status);
  const [phase, setPhase] = useState<Phase>(target);
  const prev = useRef(order.status);

  useEffect(() => {
    if (prev.current === order.status) return;
    const from = prev.current;
    prev.current = order.status;
    if (reduce || order.status !== 'completed' || from !== 'delivered') { setPhase(staticPhase(order.status)); return; }
    // release: crack → open → note rises → flies to the seller (~1.2s)
    setPhase('crack');
    const t = [setTimeout(() => setPhase('open'), 280), setTimeout(() => setPhase('rise'), 560), setTimeout(() => setPhase('fly'), 800), setTimeout(() => setPhase('done'), 1250)];
    return () => t.forEach(clearTimeout);
  }, [order.status, reduce]);

  const flapOpen = ['open', 'rise', 'fly', 'done'].includes(phase);
  const cracked = ['crack', 'open', 'rise', 'fly', 'done'].includes(phase);
  const settled = phase === 'done';
  const dur = (n: number) => (reduce ? 0 : n);

  const bill =
    phase === 'rise' ? { x: 0, y: -62, rotate: 0, opacity: 1 }
    : phase === 'fly' ? { x: -168, y: -26, rotate: -14, opacity: 0.0 }
    : phase === 'open' ? { x: 0, y: 0, rotate: 0, opacity: 1 }
    : { x: 0, y: 0, rotate: 0, opacity: 0 };

  const seller_ = settled || phase === 'fly';
  return (
    <div data-testid="envelope" data-state={target} data-phase={phase}>
      <div className="flex items-center justify-between gap-1">
        <Chip user={buyer} role="קונה" badge={target === 'returned' ? `+${fmt(order.total)}` : undefined} />
        <motion.div
          className="relative w-full max-w-[200px]"
          animate={{ x: phase === 'returned' ? 30 : 0, rotate: phase === 'returned' ? 2 : 0 }}
          initial={false}
          transition={{ duration: dur(0.9), type: 'spring', stiffness: 70, damping: 14 }}
        >
          <svg viewBox="0 -40 220 200" className="w-full" style={{ overflow: 'visible' }} role="img" aria-label={caption(order, buyer, seller)}>
            <defs>
              <pattern id="tape-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#EADCC2" /><rect width="6" height="14" fill="#C9A877" opacity=".8" /></pattern>
            </defs>
            <ellipse cx="110" cy="154" rx="86" ry="5" fill="#2B2420" opacity=".14" />
            {/* inside of the envelope */}
            <rect x="10" y="36" width="200" height="112" rx="3" fill="#D9C79F" stroke="#2B2420" strokeWidth="2" />
            {/* the banknote */}
            <motion.g initial={false} animate={bill} transition={{ duration: dur(phase === 'fly' ? 0.45 : 0.3), ease: 'easeOut' }}>
              <rect x="66" y="52" width="88" height="48" rx="3" fill="#E3E7D6" stroke="#4A5D3A" strokeWidth="2" />
              <rect x="72" y="58" width="76" height="36" rx="2" fill="none" stroke="#4A5D3A" strokeWidth="1" strokeDasharray="3 3" />
              <text x="110" y="85" textAnchor="middle" fontFamily="'Frank Ruhl Libre', serif" fontWeight="900" fontSize="24" fill="#4A5D3A">{fmt(order.itemPrice)}</text>
            </motion.g>
            {/* front pocket */}
            <path d="M10 148V50L110 106 210 50V148Z" fill="#F1E5CB" stroke="#2B2420" strokeWidth="2" strokeLinejoin="round" />
            <path d="M10 148 80 98M210 148 140 98" stroke="#2B2420" strokeWidth="1.3" opacity=".45" />
            {/* flap */}
            <motion.path initial={false} animate={{ d: flapOpen ? OPEN_FLAP : CLOSED_FLAP, fill: flapOpen ? '#CDB98C' : '#EADCC2' }} transition={{ duration: dur(0.3) }} stroke="#2B2420" strokeWidth="2" strokeLinejoin="round" />
            {/* wax seal: whole, or two halves after it cracks */}
            {!cracked && (
              <g transform="translate(87 75)"><WaxSeal size={46} /></g>
            )}
            {cracked && (
              <>
                <motion.g initial={false} animate={settled || phase === 'rise' || phase === 'fly' || phase === 'open' ? { x: -15, y: 20, rotate: -13 } : { x: -9, y: 6, rotate: -20 }} style={{ transformOrigin: '110px 98px' }} transition={{ duration: dur(0.3) }}>
                  <g transform="translate(87 75)"><WaxSeal size={46} half="left" /></g>
                </motion.g>
                <motion.g initial={false} animate={settled || phase === 'rise' || phase === 'fly' || phase === 'open' ? { x: 14, y: 22, rotate: 11 } : { x: 9, y: 6, rotate: 20 }} style={{ transformOrigin: '110px 98px' }} transition={{ duration: dur(0.3) }}>
                  <g transform="translate(87 75)"><WaxSeal size={46} half="right" /></g>
                </motion.g>
              </>
            )}
            {/* frozen: extra seal + diagonal sticky tape */}
            {phase === 'disputed' && (
              <>
                <motion.g initial={{ scale: 1.6, opacity: 0, rotate: 18 }} animate={{ scale: 1, opacity: 1, rotate: -10 }} transition={{ duration: dur(0.35) }} style={{ transformOrigin: '60px 122px' }}>
                  <g transform="translate(36 98)"><WaxSeal size={48} label="מוקפא" /></g>
                </motion.g>
                <motion.g initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: dur(0.4) }}>
                  <g transform="rotate(-17 110 80)">
                    <rect x="-20" y="68" width="260" height="26" fill="url(#tape-stripes)" stroke="#76562A" strokeWidth="1" opacity=".95" />
                    <text x="150" y="88" textAnchor="middle" fontFamily="'Amatic SC', cursive" fontWeight="700" fontSize="24" fill="#2B2420">מוקפא · מוקפא</text>
                  </g>
                </motion.g>
              </>
            )}
          </svg>
          {phase === 'returned' && (
            <motion.span initial={{ scale: 1.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: dur(0.5), duration: dur(0.25) }} className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] bg-card/90 p-0.5">
              <span className="stamp px-3 py-0.5 text-2xl text-kraft-dark">הוחזר</span>
            </motion.span>
          )}
        </motion.div>
        <Chip user={seller} role="מוכר" badge={seller_ ? `+${fmt(order.itemPrice)}` : undefined} glow={seller_} />
      </div>
      <p className="mt-1 text-center font-hand text-[30px] font-bold leading-none text-ink" data-testid="envelope-caption">{caption(order, buyer, seller)}</p>
      <p className="mt-1.5 text-center text-xs text-ink-soft">{sub(seller.name)[order.status]}</p>
      <p className="mt-1 text-center text-xs text-ink-soft">{order.status === 'refunded' ? '' : `בנוסף שולמו ${fmt(order.shippingFee)} דמי משלוח ו-${fmt(order.protectionFee)} הגנת קונה`}</p>
    </div>
  );
}

function Chip({ user, role, badge, glow }: { user: User; role: string; badge?: string; glow?: boolean }) {
  return (
    <div className="relative flex w-14 shrink-0 flex-col items-center gap-0.5 text-center">
      {badge && <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute -top-5 rounded bg-ok px-1.5 py-0.5 text-[11px] font-black text-white shadow-soft" dir="ltr">{badge}</motion.span>}
      <span className={glow ? 'rounded-full ring-2 ring-ok ring-offset-2 ring-offset-card' : ''}><Avatar user={user} size={40} /></span>
      <span className="text-xs font-bold leading-tight">{user.name}</span>
      <span className="text-[11px] leading-none text-ink-soft">{role}</span>
    </div>
  );
}
