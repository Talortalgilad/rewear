import { Heart, StickyNote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Item } from '../types';
import { useStore } from '../store/useStore';
import SafeImage from './SafeImage';
import PriceTag from './PriceTag';
import ConditionStamp from './ConditionStamp';

export default function ItemCard({ item, priority = false }: { item: Item; priority?: boolean }) {
  const seller = useStore((s) => s.users[item.sellerId]);
  const me = useStore((s) => s.currentUserId);
  const toggleLike = useStore((s) => s.toggleLike);
  const liked = item.likes.includes(me);
  const sold = item.status === 'sold';

  return (
    <motion.div className="relative" initial="rest" animate="rest" whileHover="swing" whileTap="swing">
      <Link to={`/item/${item.id}`} className="block" aria-label={item.title}>
        {/* the photo: a thin white paper border, like a print */}
        <div className="relative bg-[#FFFEFA] p-1.5 shadow-soft">
          <SafeImage src={item.images[0]} category={item.category} alt={item.title} priority={priority} className={`aspect-[4/5] w-full ${sold ? 'opacity-55' : ''}`} />
          {sold && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rotate-[-12deg] bg-card/85 px-1.5 py-1"><span className="stamp px-3 py-0.5 text-3xl text-escrow">נמכר</span></span>
            </span>
          )}
          {item.relisted && !sold && (
            <span className="absolute bottom-3 right-3 rotate-[-4deg] bg-card/90 p-0.5"><span className="stamp px-1.5 text-[11px] text-kraft-dark">חזר למכירה</span></span>
          )}
        </div>
        <div className="space-y-1 px-1 pb-1 pt-2.5">
          <div className="flex items-start gap-1.5">
            <span className="flex-1 truncate text-[15px] font-medium leading-tight">{item.title}</span>
            {item.story && <StickyNote size={15} className="mt-0.5 shrink-0 text-kraft-dark" aria-label="יש לפריט סיפור" />}
          </div>
          <div className="text-xs text-ink-soft">{item.brand} · מידה {item.size}</div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="flex items-center gap-1 text-xs text-ink-soft">{seller.name}<Star size={12} className="fill-kraft text-kraft-dark" aria-hidden />{seller.rating.toFixed(1)}</span>
            <ConditionStamp condition={item.condition} />
          </div>
        </div>
      </Link>

      <PriceTag price={item.price} />

      <button onClick={() => toggleLike(item.id)} aria-label={liked ? 'הסר מהמועדפים' : 'הוסף למועדפים'} className="tap absolute left-2 top-2 flex items-center justify-center rounded-full bg-card shadow-soft">
        <Heart size={18} className={liked ? 'fill-escrow text-escrow' : 'text-ink'} />
      </button>
    </motion.div>
  );
}
