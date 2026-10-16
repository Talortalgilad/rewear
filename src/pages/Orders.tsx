import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import SafeImage from '../components/SafeImage';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import { OrderListSkeleton, useSkeleton } from '../components/Skeleton';
import { statusLabel, statusColor, needsAction } from '../lib/status';

export default function Orders() {
  const me = useStore((s) => s.currentUserId);
  const orders = useStore((s) => s.orders);
  const items = useStore((s) => s.items);
  const loading = useSkeleton();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const mine = (k: 'buy' | 'sell') => orders.filter((o) => (k === 'buy' ? o.buyerId === me : o.sellerId === me));
  const pendingCount = (k: 'buy' | 'sell') => mine(k).filter((o) => needsAction(o, me)).length;
  const list = mine(tab);

  return (
    <div className="space-y-4 p-4">
      <div className="flex border-b-2 border-ink" role="tablist">
        {([['buy', 'קניתי'], ['sell', 'מכרתי']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`tap flex-1 rounded-t-lg border border-b-0 text-sm font-bold ${tab === k ? 'border-ink bg-ink text-card' : 'border-transparent text-ink-soft'}`}>{l}{pendingCount(k) > 0 && <span className="ms-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-white">{pendingCount(k)}</span>}</button>
        ))}
      </div>
      {loading && <OrderListSkeleton />}
      {!loading && list.length === 0 && (tab === 'buy'
        ? <EmptyState art="envelope" title="עוד אין הזמנות" text="עוד לא קנית כלום. אפשר להתחיל להסתובב בין הקולבים." cta={{ label: 'לגלות פריטים', to: '/' }} />
        : <EmptyState art="hanger" title="עוד לא מכרת כלום" text="אפשר לתלות את הפריט הראשון בדקה אחת." cta={{ label: 'העלה פריט', to: '/sell' }} />)}
      {!loading && list.map((o) => {
        const item = items.find((i) => i.id === o.itemId);
        return (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex gap-3 border border-line bg-card p-3 shadow-soft">
            {item && <div className="shrink-0 bg-[#FFFEFA] p-1 shadow-soft"><SafeImage src={item.images[0]} category={item.category} alt={item.title} w={200} className="h-14 w-14" /></div>}
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{item?.title}</div>
              <div className="font-mono text-xs text-ink-soft" dir="ltr">{o.id}</div>
              <div className="mt-1.5 flex items-center justify-between">
                <Price value={o.total} className="text-lg" />
                <span className="flex items-center gap-1.5">
                  {needsAction(o, me) && <span className="price-tag bg-primary py-0.5 pe-3 ps-2 text-xs font-bold text-white">ממתין לך</span>}
                  <span className={`stamp text-[11px] ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
