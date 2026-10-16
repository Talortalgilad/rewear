import { motion } from 'framer-motion';
import Price from './Price';

const variants = { rest: { rotate: 3.5 }, swing: { rotate: [3.5, -4, 3, -1.5, 3.5], transition: { duration: 0.9, ease: 'easeInOut' as const } } };

// A manila shop tag (cut corner + punched hole) hanging from a thread at the photo's corner.
// Place inside a `relative` box. Swings when an ancestor motion element switches to the "swing" variant.
export default function PriceTag({ price, className = 'right-5' }: { price: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute top-0 z-10 ${className}`}>
      <svg width="2" height="20" className="absolute -left-px top-0" aria-hidden><line x1="1" y1="0" x2="1" y2="20" stroke="#2B2420" strokeWidth="1" opacity=".75" /></svg>
      <motion.div variants={variants} initial="rest" className="absolute" style={{ top: 16, right: -9, transformOrigin: 'calc(100% - 9px) 9px', filter: 'drop-shadow(0 1px 1px rgba(43,36,32,.35))' }}>
        <div className="price-tag relative flex h-8 min-w-[54px] items-center justify-center bg-kraft-soft pe-5 ps-2 pt-0.5 text-[17px] text-ink" data-testid="price-tag">
          <span className="absolute right-[5px] top-[5px] h-[7px] w-[7px] rounded-full bg-[#7C6A4E]/60 ring-1 ring-ink/50" />
          <Price value={price} />
        </div>
      </motion.div>
    </div>
  );
}
