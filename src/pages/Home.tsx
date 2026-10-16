import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES, type Category } from '../types';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';
import { ItemGridSkeleton, useSkeleton } from '../components/Skeleton';
import { WaxSeal } from '../components/Art';

type Sort = 'new' | 'asc' | 'desc';

export default function Home() {
  const items = useStore((s) => s.items);
  const loading = useSkeleton();
  const [cat, setCat] = useState<Category | null>(null);
  const [sort, setSort] = useState<Sort>('new');

  const list = useMemo(() => {
    const f = items.filter((i) => !cat || i.category === cat);
    const cmp = { new: (a: typeof f[0], b: typeof f[0]) => b.createdAt - a.createdAt, asc: (a: typeof f[0], b: typeof f[0]) => a.price - b.price, desc: (a: typeof f[0], b: typeof f[0]) => b.price - a.price }[sort];
    return [...f].sort((a, b) => (a.status === b.status ? cmp(a, b) : a.status === 'sold' ? 1 : -1));
  }, [items, cat, sort]);

  return (
    <div className="space-y-4 pb-4">
      {/* shop sign */}
      <div className="relative mx-4 mt-5 rotate-[-0.6deg] border-2 border-dashed border-ink/70 bg-card px-4 py-3 shadow-soft">
        <span aria-hidden className="absolute -top-3 left-6 h-3 w-px bg-ink/60" /><span aria-hidden className="absolute -top-3 right-6 h-3 w-px bg-ink/60" />
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] leading-tight">לכל בגד יש עוד הרבה סיבובים</h1>
            <p className="mt-0.5 text-[13px] text-ink-soft">הכסף מחכה במעטפה סגורה עד שתאשר שהכול טוב</p>
          </div>
          <div className="rotate-6"><WaxSeal size={46} /></div>
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="קטגוריות">
        {[null, ...CATEGORIES].map((c) => (
          <button key={c ?? 'all'} onClick={() => setCat(c)} role="tab" aria-selected={cat === c}
            className={`tap shrink-0 rounded-lg border px-4 text-sm font-medium ${cat === c ? 'border-ink bg-ink text-card shadow-[0_2px_0_#000]' : 'border-gray-300 bg-card text-ink'}`}>
            {c ?? 'הכול'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 text-sm">
        <span className="text-ink-soft">{loading ? '' : `${list.length} פריטים`}</span>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="מיון" className="field !w-52">
          <option value="new">חדש ביותר</option>
          <option value="asc">מחיר: מהנמוך לגבוה</option>
          <option value="desc">מחיר: מהגבוה לנמוך</option>
        </select>
      </div>

      {loading ? <ItemGridSkeleton /> : list.length ? <ItemGrid items={list} /> : <EmptyState art="closet" title="הארון ריק בקטגוריה הזו" text="עוד לא תלו כאן כלום. אפשר להסתכל בשאר הקולבים." cta={{ label: 'הצג את כל הפריטים', onClick: () => setCat(null) }} />}
    </div>
  );
}
