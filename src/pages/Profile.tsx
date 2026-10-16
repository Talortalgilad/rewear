import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Wallet as WalletIcon } from 'lucide-react';
import { useStore, useCurrentUser } from '../store/useStore';
import { Avatar } from '../components/UserSwitcher';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import Price from '../components/Price';

export default function Profile() {
  const nav = useNavigate();
  const me = useCurrentUser();
  const all = useStore((s) => s.items);
  const items = useMemo(() => all.filter((i) => i.sellerId === me.id), [all, me.id]);
  const reset = useStore((s) => s.resetDemo);
  const setSeen = useStore((s) => s.setOnboardingSeen);
  const show = useToast((s) => s.show);
  const active = items.filter((i) => i.status === 'active');
  const sold = items.filter((i) => i.status === 'sold');
  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col items-center gap-1 p-4 pt-6">
        <Avatar user={me} size={76} />
        <h1 className="mt-1 text-[28px]">{me.name}</h1>
        <div className="text-sm text-ink-soft">{me.city}</div>
        <div className="flex items-center gap-1 text-sm font-bold"><Star size={14} className="fill-kraft text-kraft-dark" aria-hidden />{me.rating.toFixed(1)} ({me.ratingCount})</div>
      </div>
      <Link to="/wallet" className="tap mx-4 flex items-center justify-between border-2 border-dashed border-ink/40 bg-card p-4 shadow-soft">
        <span className="flex items-center gap-2 font-bold"><WalletIcon size={20} className="text-primary-hover" aria-hidden />הארנק שלי</span>
        <span className="flex items-center gap-1"><Price value={me.wallet.available} className="text-xl" /><ChevronLeft size={16} aria-hidden /></span>
      </Link>
      <h2 className="px-4 text-xl">הפריטים שלי למכירה ({active.length})</h2>
      {active.length ? <ItemGrid items={active} /> : <EmptyState art="hanger" title="הקולב ריק" text="עוד לא העלית פריטים. אפשר להתחיל עכשיו." cta={{ label: 'העלה פריט', to: '/sell' }} />}
      {sold.length > 0 && <><h2 className="px-4 text-xl">נמכרו ({sold.length})</h2><ItemGrid items={sold} /></>}
      <div className="space-y-3 px-4 pt-2">
        <button onClick={() => setSeen(false)} className="btn btn-ghost w-full text-sm">הצג שוב את ההסבר על ReWear</button>
        <button onClick={() => { if (window.confirm('לאפס את הדמו ולטעון מחדש את נתוני ההתחלה?')) { reset(); nav('/'); show('הדמו אופס'); } }} className="btn btn-danger w-full text-sm">איפוס דמו</button>
      </div>
    </div>
  );
}
