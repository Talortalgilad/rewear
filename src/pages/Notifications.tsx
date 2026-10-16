import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const nav = useNavigate();
  const all = useStore((s) => s.notifications);
  const me = useStore((s) => s.currentUserId);
  const list = useMemo(() => all.filter((n) => n.userId === me), [all, me]);
  const markRead = useStore((s) => s.markRead);
  const markAll = useStore((s) => s.markAllRead);
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl">התראות</h1>{list.some((n) => !n.read) && <button onClick={markAll} className="tap text-sm font-bold text-primary-hover underline decoration-dashed underline-offset-4">סמן הכול כנקרא</button>}</div>
      {list.length === 0 && <EmptyState art="bell" title="הכול שקט" text="אין התראות חדשות. נעדכן כאן על כל תזוזה בהזמנות." cta={{ label: 'לגלות פריטים', to: '/' }} />}
      {list.map((n) => (
        <button key={n.id} onClick={() => { markRead(n.id); if (n.orderId) nav(`/orders/${n.orderId}`); }} className={`tap block w-full border-s-4 p-3 text-start text-sm shadow-soft ${n.read ? 'border-gray-300 bg-card' : 'border-primary bg-kraft-soft'}`}>
          {n.text}<span className="mt-1 block text-xs text-ink-soft">{new Date(n.at).toLocaleString('he-IL')}</span>
        </button>
      ))}
    </div>
  );
}
