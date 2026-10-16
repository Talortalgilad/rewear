import { Banknote, CreditCard, Home, Lock, Package, Snowflake, Undo2, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Order } from '../types';

type StepState = 'done' | 'current' | 'future' | 'danger' | 'refund';

const BASE: { Icon: LucideIcon; label: string }[] = [
  { Icon: CreditCard, label: 'שולם' },
  { Icon: Lock, label: 'בנאמנות' },
  { Icon: Package, label: 'נשלח' },
  { Icon: Home, label: 'הגיע' },
  { Icon: Banknote, label: 'שוחרר למוכר' },
];
const TILT = [-5, 3, -3, 4, -2];

function states(status: Order['status']): StepState[] {
  switch (status) {
    case 'paid_escrow': return ['done', 'current', 'future', 'future', 'future'];
    case 'shipped': return ['done', 'done', 'current', 'future', 'future'];
    case 'delivered': return ['done', 'done', 'done', 'current', 'future'];
    case 'completed': return ['done', 'done', 'done', 'done', 'done'];
    case 'disputed': return ['done', 'done', 'done', 'done', 'danger'];
    case 'refunded': return ['done', 'done', 'done', 'done', 'refund'];
  }
}

const currentText: Partial<Record<Order['status'], string>> = {
  paid_escrow: 'הכסף מחכה במעטפה, ממתינים שהמוכר ישלח',
  shipped: 'החבילה בדרך לקונה',
  delivered: 'ממתין לאישור הקונה',
};

const fmtTime = (at?: number) => {
  if (!at) return '';
  const d = new Date(at);
  const today = new Date().toDateString() === d.toDateString();
  const t = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  return today ? `היום ${t}` : `${d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })} ${t}`;
};

const ink: Record<StepState, string> = { done: 'text-ok', current: 'text-primary-hover', future: 'text-gray-300', danger: 'text-bad', refund: 'text-kraft-dark' };

// Each step is a small rubber stamp that gets pressed onto the page when it is completed.
export default function EscrowTimeline({ order }: { order: Order }) {
  const reduce = useReducedMotion();
  const st = states(order.status);
  const at = (s: Order['status'][]) => [...order.timeline].reverse().find((e) => s.includes(e.status))?.at;
  const times = [at(['paid_escrow']), at(['paid_escrow']), at(['shipped']), at(['delivered']), at(['completed', 'disputed', 'refunded'])];
  const steps = BASE.map((b, i) => {
    if (i !== 4) return b;
    if (order.status === 'disputed') return { Icon: Snowflake, label: 'הכסף מוקפא' };
    if (order.status === 'refunded') return { Icon: Undo2, label: 'הוחזר לקונה' };
    return b;
  });

  return (
    <ol aria-label="ציר נאמנות">
      {steps.map(({ Icon, label }, i) => {
        const s = st[i];
        const next = st[i + 1];
        const lineFilled = next !== undefined && next !== 'future';
        const lineColor = next === 'danger' ? 'border-bad' : next === 'refund' ? 'border-kraft-dark' : 'border-ok';
        const stamped = s === 'done' || s === 'danger' || s === 'refund';
        return (
          <li key={i} className="flex gap-3" aria-current={s === 'current' ? 'step' : undefined}>
            <div className="flex flex-col items-center self-stretch">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                {s === 'current' && !reduce && <motion.span className="absolute inset-0 rounded-full border-2 border-primary" animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.7, repeat: Infinity }} />}
                <motion.span
                  key={`${i}-${s}`}
                  data-stamp={s}
                  className={`stamp stamp-round h-11 w-11 items-center justify-center p-0 ${ink[s]} ${s === 'future' ? '!border-dashed' : ''} ${s === 'current' ? '!border-dashed' : ''}`}
                  initial={stamped ? { scale: 1.45, rotate: TILT[i] - 16, opacity: 0 } : false}
                  animate={{ scale: 1, rotate: TILT[i], opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 16, delay: reduce ? 0 : i * 0.1 }}
                  style={s === 'current' || s === 'future' ? { WebkitMaskImage: 'none', maskImage: 'none' } : undefined}
                >
                  <Icon size={19} aria-hidden />
                </motion.span>
              </div>
              {i < BASE.length - 1 && (
                <div className="relative my-1 min-h-6 w-0 flex-1 border-l-2 border-dashed border-gray-300">
                  <motion.div className={`absolute -left-0.5 top-0 h-full origin-top border-l-2 border-dashed ${lineColor}`} initial={{ scaleY: 0 }} animate={{ scaleY: lineFilled ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.6, delay: 0.2 + i * 0.15, ease: 'easeOut' }} />
                </div>
              )}
            </div>
            <div className="pb-5 pt-1.5">
              <div className={`font-display text-[17px] font-black ${s === 'future' ? 'text-ink-soft' : s === 'danger' ? 'text-bad' : ''}`}>{label}</div>
              {s !== 'future' && times[i] && <div className="text-xs text-ink-soft">{fmtTime(times[i])}</div>}
              {s === 'current' && currentText[order.status] && <div className="mt-0.5 text-xs font-bold text-primary-dark">{currentText[order.status]}</div>}
              {s === 'danger' && <div className="mt-0.5 text-xs font-bold text-bad">התשלום מוקפא עד לבירור</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
