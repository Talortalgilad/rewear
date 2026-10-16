import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Logo } from './Header';
import { WaxSeal } from './Art';

const INK = '#2B2420';
const svgProps = { viewBox: '0 0 240 170', width: 240, height: 170, fill: 'none', stroke: INK, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

// 1. a hanger with a shirt and a price tag
const HangerArt = () => (
  <svg {...svgProps}>
    <path d="M120 40V30c0-15 22-15 22 0 0 9-9 12-22 15" />
    <path d="M120 45 52 92c-7 5-4 12 4 12h128c8 0 11-7 4-12l-68-47Z" fill="#FBF8F2" />
    <path d="M76 104 62 150h116l-14-46" fill="#F1DCD0" />
    <path d="M76 104c14 10 74 10 88 0" />
    <path d="M62 150c-6 6-4 12 4 12h108c8 0 10-6 4-12" strokeDasharray="3 6" opacity=".5" />
    <path d="M178 96q20 10 24 38" strokeWidth="1.4" />
    <g transform="rotate(8 204 146)"><path d="M192 132h26l8 8v22h-34Z" fill="#EADCC2" /><circle cx="213" cy="140" r="2.3" fill="#2B2420" stroke="none" /></g>
  </svg>
);
// 2. an envelope with a wax seal
const SealArt = () => (
  <svg {...svgProps}>
    <rect x="34" y="58" width="172" height="100" rx="3" fill="#FBF8F2" />
    <path d="M34 60 120 120 206 60Z" fill="#EADCC2" />
    <path d="M34 158 100 104M206 158 140 104" />
    <path d="M60 46q60-34 120 0" strokeDasharray="2 7" opacity=".55" />
    <foreignObject x="94" y="92" width="52" height="52"><WaxSeal size={52} /></foreignObject>
  </svg>
);
// 3. two hands passing a parcel
const HandsArt = () => (
  <svg {...svgProps}>
    <rect x="86" y="62" width="68" height="56" rx="3" fill="#EADCC2" />
    <path d="M86 84h68M120 62v56" strokeDasharray="1 5" />
    <rect x="108" y="62" width="24" height="56" fill="#C9A87766" stroke="none" />
    <path d="M0 112h44c10 0 14-8 24-8h22c8 0 10 12 2 12H74c8 0 10 12 2 12H60c8 0 10 12 2 12H40c-10 0-14-6-40-6Z" fill="#F1DCD0" />
    <path d="M240 112h-44c-10 0-14-8-24-8h-22c-8 0-10 12-2 12h16c-8 0-10 12-2 12h14c-8 0-10 12-2 12h20c10 0 14-6 46-6Z" fill="#E3E7D6" />
    <path d="M120 40v-12M104 44l-6-9M136 44l6-9" opacity=".6" />
  </svg>
);

const slides = [
  { art: <HangerArt />, title: 'ברוכים הבאים ל-ReWear', text: 'חנות היד שנייה של השכונה, אבל באינטרנט. מעלים פריט בדקה, ומוצאים בגדים עם סיפור במחיר טוב.' },
  { art: <SealArt />, title: 'הכסף מחכה במעטפה', text: 'כשקונים, הכסף לא עובר ישר למוכר. הוא נשאר אצלנו במעטפה סגורה, עם חותם, עד שהבגד מגיע.' },
  { art: <HandsArt />, title: 'משתחרר רק כשהבגד אצלך', text: 'אחרי שהחבילה הגיעה ואישרת שהכול תקין, החותם נשבר והכסף עובר למוכר. יש בעיה? מקפיאים ומקבלים החזר. אפשר לעבור על הכול במדריך הדמו.' },
];

export default function Onboarding() {
  const setSeen = useStore((s) => s.setOnboardingSeen);
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const s = slides[i];

  return (
    <div className="paper fixed inset-0 z-[70] flex justify-center" role="dialog" aria-modal="true" aria-label="היכרות עם ReWear">
      <div className="relative flex h-full w-full max-w-[480px] flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center justify-between">
          <Logo />
          {!last ? <button onClick={() => setSeen(true)} className="tap px-2 text-sm font-medium text-ink-soft underline decoration-dashed underline-offset-4">דלג</button> : <span />}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-44 items-center justify-center">{s.art}</div>
              <h1 className="text-[28px] leading-tight text-ink">{s.title}</h1>
              <p className="max-w-[320px] text-base leading-relaxed text-ink-soft">{s.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mb-5 flex justify-center gap-2" aria-hidden>
          {slides.map((_, n) => <span key={n} className={`h-2 rounded-full border border-ink transition-all ${n === i ? 'w-6 bg-ink' : 'w-2 bg-transparent'}`} />)}
        </div>
        <button onClick={() => (last ? setSeen(true) : setI(i + 1))} className="btn btn-primary w-full py-3.5 text-base">{last ? 'בואו נתחיל' : 'הבא'}</button>
      </div>
    </div>
  );
}
