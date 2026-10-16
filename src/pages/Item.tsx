import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import SafeImage from '../components/SafeImage';
import { Avatar } from '../components/UserSwitcher';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import ConditionStamp from '../components/ConditionStamp';
import { PaperNote } from '../components/Notes';
import { Tape, WaxSeal } from '../components/Art';
import type { Badge } from '../types';

const badgeText: Record<Badge, string> = { verified: 'מאומת', fast_shipper: 'שולח מהר', top_seller: 'מוכרת מובילה' };

export default function ItemPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const item = useStore((s) => s.items.find((i) => i.id === id));
  const seller = useStore((s) => (item ? s.users[item.sellerId] : undefined));
  const me = useStore((s) => s.currentUserId);
  const [idx, setIdx] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (!item || !seller) return <EmptyState art="hanger" title="הפריט לא נמצא" text="ייתכן שהפריט הוסר." cta={{ label: 'חזרה לפיד', to: '/' }} />;

  const own = item.sellerId === me;
  const sold = item.status === 'sold';

  return (
    <div className="pb-28">
      <div className="relative px-5 pt-5">
        <div className="relative rotate-[-0.6deg] bg-[#FFFEFA] p-2 shadow-lift">
          <div ref={track} onScroll={(e) => { const el = e.currentTarget; setIdx(Math.round(Math.abs(el.scrollLeft) / el.clientWidth)); }} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
            {item.images.map((src, n) => (
              <SafeImage key={n} src={src} category={item.category} alt={`${item.title} ${n + 1}`} w={800} priority={n === 0} className="aspect-square w-full shrink-0 snap-center" />
            ))}
          </div>
          {sold && <span className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="rotate-[-12deg] bg-card/85 p-1"><span className="stamp px-5 py-1 text-5xl text-escrow">נמכר</span></span></span>}
          <Tape className="absolute -top-3 left-6 rotate-[-18deg]" />
          <Tape className="absolute -top-3 right-6 rotate-[14deg]" />
        </div>
        {item.images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {item.images.map((_, n) => <span key={n} className={`h-1.5 rounded-full border border-ink ${n === idx ? 'w-4 bg-ink' : 'w-1.5'}`} />)}
          </div>
        )}
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap absolute right-8 top-8 flex items-center justify-center rounded-full bg-card shadow-lift"><ArrowRight size={20} /></button>
      </div>

      <div className="space-y-5 p-4 pt-5">
        <div>
          <div className="flex items-end justify-between gap-3">
            <Price value={item.price} className="text-[46px] text-ink" />
            <div className="pb-1"><ConditionStamp condition={item.condition} size="md" /></div>
          </div>
          <h1 className="mt-2 text-[22px] leading-snug">{item.title}</h1>
          <p className="mt-0.5 text-sm text-ink-soft">לבגד הזה יש עוד הרבה סיבובים</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {item.relisted && !sold && <span className="stamp text-kraft-dark">חזר למכירה</span>}
            {[item.brand, `מידה ${item.size}`, item.category].map((t) => <span key={t} className="rounded-md border border-gray-300 bg-card px-2.5 py-1 text-ink">{t}</span>)}
          </div>
        </div>

        {item.story && <PaperNote text={item.story} from={seller.name} pinned label="הסיפור של הבגד" />}

        <p className="text-sm leading-relaxed text-ink-soft">{item.description}</p>

        <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-ink/30 bg-card p-3 shadow-soft">
          <Avatar user={seller} size={48} />
          <div className="flex-1">
            <div className="font-display text-lg font-black">{seller.name}</div>
            <div className="text-xs text-ink-soft">{seller.city}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">{seller.badges.map((b) => <span key={b} className="stamp text-[11px] text-ok">{badgeText[b]}</span>)}</div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold"><Star size={16} className="fill-kraft text-kraft-dark" aria-hidden />{seller.rating.toFixed(1)}<span className="text-xs font-normal text-ink-soft">({seller.ratingCount})</span></div>
        </div>

        <div className="flex gap-3 rounded-lg border border-escrow/30 bg-escrow-soft p-4">
          <div className="shrink-0 rotate-[-8deg]"><WaxSeal size={44} /></div>
          <div>
            <div className="font-display text-lg font-black">הגנת קונה ReWear</div>
            <p className="mt-1 text-sm leading-snug text-ink">הכסף שלך מחכה במעטפה סגורה, ומשתחרר למוכר רק אחרי שאישרת שהפריט הגיע ותקין.</p>
          </div>
        </div>
      </div>

      <div className="paper fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button disabled={own || sold} onClick={() => nav(`/checkout/${item.id}`)} className="btn btn-primary w-full text-base">
          {own ? 'זה הפריט שלך' : sold ? 'הפריט נמכר' : `קנייה מאובטחת · ${fmt(item.price)}`}
        </button>
      </div>
    </div>
  );
}
