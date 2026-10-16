import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Compass, Lock, Stamp } from 'lucide-react';
import { motion } from 'framer-motion';
import { fireConfetti } from '../lib/confetti';
import { useStore } from '../store/useStore';
import type { UserId } from '../types';
import Sheet from './Sheet';

interface Step { title: string; user: UserId; go: (g: { listedItemId: string | null; orderId: string | null }) => string }

const STEPS: Step[] = [
  { title: 'עבור לדני והעלה בגד למכירה', user: 'dani', go: () => '/sell' },
  { title: 'עבור לנועה וקנה אותו', user: 'noa', go: (g) => (g.orderId ? `/orders/${g.orderId}` : g.listedItemId ? `/item/${g.listedItemId}` : '/') },
  { title: 'עבור לדני וסמן כנשלח', user: 'dani', go: (g) => (g.orderId ? `/orders/${g.orderId}` : '/orders') },
  { title: 'עבור לנועה, סמן שהגיע ושחרר תשלום', user: 'noa', go: (g) => (g.orderId ? `/orders/${g.orderId}` : '/orders') },
  { title: 'ראה את הכסף בארנק של דני', user: 'dani', go: () => '/wallet' },
];

export default function DemoGuide() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const guide = useStore((s) => s.guide);
  const switchUser = useStore((s) => s.switchUser);
  const celebrate = useStore((s) => s.celebrateGuide);
  const resetDemo = useStore((s) => s.resetDemo);
  const count = guide.done.filter(Boolean).length;
  const allDone = count === STEPS.length;
  const firstUndone = guide.done.indexOf(false);

  useEffect(() => {
    if (allDone && !guide.celebrated) {
      setOpen(false);
      void fireConfetti(true);
    }
  }, [allDone, guide.celebrated]);

  // Sits above the bottom nav; on the item page it also clears the fixed buy bar.
  const bottom = pathname.startsWith('/item/') ? 88 : 80;
  // The checkout page ends with the pay button in the lower-left area, so there the tab sits under the header instead.
  const placement = pathname.startsWith('/checkout/') ? { top: 76 } : { bottom };

  const take = (i: number) => {
    const step = STEPS[i];
    switchUser(step.user);
    setOpen(false);
    nav(step.go(useStore.getState().guide));
  };

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 z-[35] flex w-full max-w-[480px] -translate-x-1/2 justify-end px-4" style={placement}>
        <button
          onClick={() => setOpen(true)}
          aria-label={`מדריך דמו, ${count} מתוך ${STEPS.length} שלבים הושלמו`}
          data-testid="guide-fab"
          className="pointer-events-auto flex h-11 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-bold text-card shadow-[0_3px_0_#000]"
        >
          <Compass size={16} aria-hidden />מדריך דמו
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${allDone ? 'bg-ok-dark' : 'bg-card/20'}`}>{count}/{STEPS.length}</span>
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="מדריך דמו">
        <p className="mb-3 text-sm text-ink-soft">עוברים על כל זרימת הקנייה בנאמנות ב-5 צעדים. כל שלב מסומן אוטומטית כשהפעולה מתבצעת.</p>
        <div className="mb-4 h-2.5 overflow-hidden rounded-full border border-ink bg-card" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={count}>
          <motion.div className="h-full bg-ok" initial={false} animate={{ width: `${(count / STEPS.length) * 100}%` }} />
        </div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const done = guide.done[i];
            const locked = !done && i !== firstUndone;
            return (
              <li key={i} data-testid={`guide-step-${i + 1}`} data-done={done} className={`flex items-center gap-3 rounded-lg border p-3 ${done ? 'border-ok/40 bg-ok-soft' : 'border-line bg-gray-50'}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-ok text-white' : 'bg-card text-ink-soft ring-1 ring-gray-300'}`}>
                  {done ? <Check size={16} style={{ strokeWidth: 3 }} aria-label="הושלם" /> : i + 1}
                </span>
                <span className={`flex-1 text-sm font-medium ${done ? 'text-ink-soft line-through' : ''}`}>{s.title}</span>
                <button
                  onClick={() => take(i)}
                  disabled={locked}
                  aria-label={locked ? 'קודם יש להשלים את השלבים הקודמים' : `קח אותי לשם: ${s.title}`}
                  className="btn btn-primary shrink-0 !px-3 text-xs"
                >
                  {locked && <Lock size={12} aria-hidden />}קח אותי לשם
                </button>
              </li>
            );
          })}
        </ol>
      </Sheet>

      {allDone && !guide.celebrated && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 px-6" role="dialog" aria-modal="true" aria-label="סיום המסלול">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[380px] rounded-lg bg-card p-6 text-center shadow-lift">
            <div className="flex justify-center"><span className="stamp stamp-round h-20 w-20 items-center justify-center p-0 text-ok" style={{ transform: 'rotate(-8deg)' }}><Stamp size={36} aria-hidden /></span></div>
            <h2 className="mt-3 text-2xl">השלמת את כל המסלול!</h2>
            <p className="mt-2 text-sm text-ink-soft">העלית פריט, קנית אותו בנאמנות, שלחת, אישרת קבלה ושחררת תשלום. הכסף הגיע למוכר רק אחרי שהבגד הגיע</p>
            <div className="mt-5 space-y-2">
              <button onClick={() => { celebrate(); nav('/'); }} className="btn btn-primary w-full">המשך לגלוש באפליקציה</button>
              <button onClick={() => { resetDemo(); nav('/'); }} className="btn btn-demo w-full">איפוס דמו והתחלה מחדש</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
