import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { calcTotals, fmt } from '../lib/money';
import SafeImage from '../components/SafeImage';
import EmptyState from '../components/EmptyState';
import Receipt from '../components/Receipt';
import Price from '../components/Price';
import { WaxSeal } from '../components/Art';
import { useToast } from '../components/Toast';

export default function Checkout() {
  const { id } = useParams();
  const nav = useNavigate();
  const item = useStore((s) => s.items.find((i) => i.id === id));
  const me = useStore((s) => s.users[s.currentUserId]);
  const topUp = useStore((s) => s.topUp);
  const show = useToast((s) => s.show);
  const [address, setAddress] = useState(me.address);
  const [phase, setPhase] = useState<'form' | 'paying' | 'done'>('form');
  const [orderId, setOrderId] = useState('');
  const [err, setErr] = useState('');

  // Switching accounts mid-checkout: the seller can't buy their own item (back to the item page);
  // any other user gets their own saved address.
  useEffect(() => {
    if (phase !== 'form') return;
    if (item && item.sellerId === me.id) { nav(`/item/${item.id}`, { replace: true }); return; }
    setAddress(me.address);
    setErr('');
  }, [me.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <motion.div initial={{ scale: 2.2, opacity: 0, rotate: 25 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}><WaxSeal size={104} /></motion.div>
        <h1 className="text-[28px]">התשלום הועבר לנאמנות</h1>
        <p className="max-w-[300px] text-sm text-ink-soft">הכסף מחכה במעטפה סגורה, ויועבר למוכר רק אחרי אישור שהפריט הגיע ותקין.</p>
        <button onClick={() => nav(`/orders/${orderId}`, { replace: true })} className="btn btn-primary w-full">למעקב ההזמנה</button>
      </div>
    );
  }

  if (!item) return <EmptyState art="hanger" title="הפריט לא נמצא" text="ייתכן שהפריט הוסר." cta={{ label: 'חזרה לפיד', to: '/' }} />;

  const t = calcTotals(item.price);
  const own = item.sellerId === me.id;
  const unavailable = item.status !== 'active';
  const short = me.wallet.available < t.total;
  const addrOk = address.trim().length >= 6;
  const blocked = own || unavailable;

  const pay = () => {
    if (!addrOk) { setErr('נא למלא כתובת משלוח מלאה (רחוב ומספר)'); return; }
    if (short) return;
    setErr('');
    setPhase('paying');
    setTimeout(() => {
      const r = useStore.getState().buyItem(item.id, address.trim());
      if (r.ok) { setOrderId(r.orderId); setPhase('done'); }
      else { setPhase('form'); show(r.error, 'error'); }
    }, 1200);
  };

  return (
    <div className="space-y-4 p-4 pb-8">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap flex items-center justify-center"><ArrowRight size={22} /></button>
        <h1 className="text-2xl">קופה</h1>
      </div>

      <div className="flex gap-3">
        <div className="shrink-0 bg-[#FFFEFA] p-1 shadow-soft"><SafeImage src={item.images[0]} category={item.category} alt={item.title} w={200} className="h-20 w-20" /></div>
        <div className="pt-1"><div className="font-bold">{item.title}</div><div className="text-xs text-ink-soft">{item.brand} · מידה {item.size}</div><Price value={item.price} className="mt-1.5 text-xl" /></div>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-bold">כתובת משלוח</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="field" aria-invalid={!!err} />
        {err && <span role="alert" className="text-xs text-bad">{err}</span>}
      </label>

      <Receipt
        lines={[{ label: 'פריט', value: fmt(t.itemPrice) }, { label: 'משלוח', value: fmt(t.shippingFee) }, { label: 'הגנת קונה (5%)', value: fmt(t.protectionFee) }]}
        total={fmt(t.total)}
        footer="תודה שקנית בשכונה"
      />

      <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-card p-3">
        <Wallet className="text-primary-hover" aria-hidden />
        <div className="flex-1"><div className="text-sm font-bold">ארנק ReWear</div><div className="text-xs text-ink-soft">יתרה {fmt(me.wallet.available)}</div></div>
      </div>

      {own && <p className="rounded-lg bg-gray-100 p-3 text-center text-sm">זה הפריט שלך</p>}
      {unavailable && !own && <p className="rounded-lg bg-gray-100 p-3 text-center text-sm">הפריט כבר נמכר</p>}
      {short && !blocked && (
        <div className="space-y-2 rounded-lg border border-bad/40 bg-red-50 p-3 text-center">
          <p className="text-sm text-bad">אין מספיק יתרה בארנק. חסרים {fmt(t.total - me.wallet.available)}.</p>
          <button onClick={() => { topUp(); show('נטענו 500 ₪ לארנק'); }} className="btn btn-ghost text-sm">טעינת ארנק (+500 ₪ מדומה)</button>
        </div>
      )}

      <button onClick={pay} disabled={blocked || short || phase === 'paying'} className="btn btn-primary w-full text-base">
        {phase === 'paying' ? <><Loader2 className="animate-spin" size={20} aria-hidden />מעבד תשלום…</> : `תשלום · ${fmt(t.total)}`}
      </button>
    </div>
  );
}
