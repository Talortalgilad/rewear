import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Camera, Clock, Mail, Star, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import { fireConfetti } from '../lib/confetti';
import { statusLabel, statusColor } from '../lib/status';
import { compressImage } from '../lib/image';
import { formatCountdown, useNow } from '../lib/useNow';
import EmptyState from '../components/EmptyState';
import EscrowTimeline from '../components/EscrowTimeline';
import EnvelopeFlow from '../components/EnvelopeFlow';
import ShippingSticker from '../components/ShippingSticker';
import Receipt from '../components/Receipt';
import { NoteReveal, PaperNote } from '../components/Notes';
import Sheet from '../components/Sheet';
import SafeImage from '../components/SafeImage';
import { useToast } from '../components/Toast';
import type { Category } from '../types';

const REASONS = ['לא תואם לתיאור', 'פגום', 'מידה שגויה', 'לא הגיע'];
const NOUN: Record<Category, string> = { 'חולצות': 'לחולצה הזאת', 'מכנסיים': 'למכנסיים האלה', 'שמלות': 'לשמלה הזאת', 'מעילים': 'למעיל הזה', 'נעליים': 'לנעליים האלה', 'אקססוריז': 'לפריט הזה' };
const NOTE_MAX = 160;

const primary = 'btn btn-primary w-full';
const demo = 'btn btn-demo w-full'; // dashed = simulated third party (courier / ReWear team / clock)
const info = 'rounded-lg bg-gray-100 p-3 text-center text-sm text-ink-soft';
const SHIPPED_PLUS = ['shipped', 'delivered', 'completed', 'disputed', 'refunded'];
const DELIVERED_PLUS = ['delivered', 'completed', 'disputed', 'refunded'];

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const now = useNow();
  const show = useToast((s) => s.show);
  const me = useStore((s) => s.currentUserId);
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const item = useStore((s) => s.items.find((i) => i.id === order?.itemId));
  const users = useStore((s) => s.users);
  const { markShipped, markDelivered, releasePayment, openDispute, resolveRefund, rateSeller } = useStore.getState();

  const [sheet, setSheet] = useState<null | 'release' | 'dispute' | 'rate' | 'ship'>(null);
  const [reveal, setReveal] = useState(false);
  const [shipText, setShipText] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [dErr, setDErr] = useState('');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  if (!order) return <EmptyState art="envelope" title="ההזמנה לא נמצאה" text="אולי היא שייכת למשתמש אחר. אפשר להחליף משתמש או לחזור להזמנות." cta={{ label: 'להזמנות', to: '/orders' }} />;

  const buyer = users[order.buyerId];
  const seller = users[order.sellerId];
  const isBuyer = me === order.buyerId;
  const isSeller = me === order.sellerId;
  const run = (r: { ok: true } | { ok: false; error: string }, okMsg?: string) => {
    if (!r.ok) show(r.error, 'error');
    else if (okMsg) show(okMsg);
    return r.ok;
  };

  const release = (auto: boolean) => {
    if (run(releasePayment(order.id, auto), `${fmt(order.itemPrice)} שוחררו ל${seller.name}`)) void fireConfetti();
  };

  const openShipSheet = () => {
    setShipText(`תודה שנתת ${NOUN[item?.category ?? 'אקססוריז']} בית חדש! ללבוש בכיף — ${seller.name}`);
    setSheet('ship');
  };
  const doShip = (withNote: boolean) => {
    if (run(markShipped(order.id, withNote ? shipText : undefined), `${seller.name} ארז ושלח`)) setSheet(null);
  };
  const doDelivered = () => {
    if (run(markDelivered(order.id), 'החבילה הגיעה') && order.thankYou) setReveal(true);
  };

  const submitDispute = () => {
    if (!reason) return setDErr('נא לבחור סיבה');
    if (details.trim().length < 5) return setDErr('נא לפרט במשפט קצר מה הבעיה');
    if (run(openDispute(order.id, { reason, details: details.trim(), photo }), 'הדיווח נשלח. התשלום הוקפא עד לבירור')) {
      setSheet(null); setDErr('');
    }
  };

  const submitRating = () => {
    if (!stars) return show('נא לבחור דירוג', 'error');
    if (run(rateSeller(order.id, stars, comment.trim()), 'תודה על הדירוג')) setSheet(null);
  };

  const remaining = order.autoReleaseAt ? order.autoReleaseAt - now : 0;
  const showSellerNote = isSeller && order.thankYou && SHIPPED_PLUS.includes(order.status);
  const showBuyerNote = isBuyer && order.thankYou && DELIVERED_PLUS.includes(order.status);

  let actions: React.ReactNode = null;
  if (!isBuyer && !isSeller) {
    actions = <p className={info}>ההזמנה הזו בין {buyer.name} ל{seller.name}. אפשר להחליף משתמש כדי לטפל בה.</p>;
  } else {
    switch (order.status) {
      case 'paid_escrow':
        actions = isSeller
          ? <button className={primary} onClick={openShipSheet}>סימנתי כנשלח</button>
          : <p className={info}>ממתין שהמוכר ישלח</p>;
        break;
      case 'shipped':
        actions = isSeller
          ? <p className={info}>בדרך לקונה</p>
          : <button className={demo} onClick={doDelivered}><Zap size={16} aria-hidden />דמו: סמן שהחבילה הגיעה</button>;
        break;
      case 'delivered':
        actions = isSeller
          ? <p className={info}>ממתין לאישור הקונה</p>
          : (
            <div className="space-y-3">
              <button className={primary} onClick={() => setSheet('release')}>הכול תקין, שחרר תשלום</button>
              <button className="btn btn-danger w-full" onClick={() => setSheet('dispute')}>יש בעיה</button>
            </div>
          );
        break;
      case 'completed':
        actions = isSeller
          ? <p className="rounded-lg bg-ok-soft p-3 text-center font-bold text-ok">{fmt(order.itemPrice)} נכנסו לארנק</p>
          : order.rated
            ? <p className={info}>דירגת את {seller.name}: {'★'.repeat(order.rating?.stars ?? 0)}{'☆'.repeat(5 - (order.rating?.stars ?? 0))}</p>
            : <button className={primary} onClick={() => setSheet('rate')}>דרג את המוכר</button>;
        break;
      case 'disputed':
        actions = isSeller
          ? <p className="rounded-lg bg-red-50 p-3 text-center text-sm font-bold text-bad">התשלום מוקפא עד לבירור</p>
          : <button className={demo} onClick={() => run(resolveRefund(order.id), `${fmt(order.total)} הוחזרו לארנק`)}><Zap size={16} aria-hidden />צוות ReWear: אשר החזר</button>;
        break;
      case 'refunded':
        actions = isSeller
          ? <p className={info}>ההזמנה בוטלה</p>
          : <p className="rounded-lg bg-kraft-soft p-3 text-center font-bold text-kraft-dark">{fmt(order.total)} הוחזרו לארנק</p>;
        break;
    }
  }

  return (
    <div className="space-y-5 p-4 pb-8">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap flex items-center justify-center"><ArrowRight size={22} /></button>
        <h1 className="flex-1 text-2xl">הזמנה {order.id}</h1>
        <span data-testid="status" className={`stamp text-[13px] ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
      </div>

      {item && (
        <Link to={`/item/${item.id}`} className="flex gap-3 border border-line bg-card p-3 shadow-soft">
          <div className="shrink-0 bg-[#FFFEFA] p-1 shadow-soft"><SafeImage src={item.images[0]} category={item.category} alt={item.title} w={200} className="h-14 w-14" /></div>
          <div className="min-w-0"><div className="truncate font-bold">{item.title}</div><div className="text-xs text-ink-soft">{buyer.name} ← {seller.name}</div><div className="font-display text-lg font-black">{fmt(order.total)}</div></div>
        </Link>
      )}

      <section className="border border-dashed border-ink/40 bg-kraft-soft/50 p-4 pt-5">
        <h2 className="mb-6 text-xl">איפה הכסף עכשיו?</h2>
        <EnvelopeFlow order={order} buyer={buyer} seller={seller} />
      </section>

      <section className="border border-line bg-card p-4 shadow-soft">
        <h2 className="mb-3 text-xl">ציר נאמנות</h2>
        <EscrowTimeline order={order} />
      </section>

      {order.status === 'delivered' && order.autoReleaseAt && (
        <section className="border-2 border-dashed border-kraft-dark/60 bg-kraft-soft p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-bold text-kraft-dark"><Clock size={16} aria-hidden />שחרור אוטומטי בעוד</div>
          <div data-testid="countdown" className="my-1 font-display text-[36px] font-black tabular-nums leading-tight" dir="ltr">{formatCountdown(remaining)}</div>
          <p className="mb-3 text-xs text-ink-soft">אם לא תהיה פעולה, התשלום ישוחרר למוכר אוטומטית אחרי 48 שעות מההגעה.</p>
          <button className={demo} onClick={() => release(true)}><Zap size={16} aria-hidden />דלג קדימה בזמן</button>
        </section>
      )}

      {order.trackingNumber && order.status !== 'paid_escrow' && (
        <section><h2 className="mb-3 text-xl">המדבקה על החבילה</h2><ShippingSticker order={order} seller={seller} buyer={buyer} /></section>
      )}

      {(showSellerNote || showBuyerNote) && order.thankYou && (
        <section>
          <PaperNote text={order.thankYou} tilt={1.4} label={showSellerNote ? 'הפתק שצירפת לחבילה' : `פתק מ${seller.name}`} />
          {showBuyerNote && <div className="mt-2 flex justify-center"><button className="btn btn-ghost text-sm" onClick={() => setReveal(true)}><Mail size={16} aria-hidden />פתח את הפתק שוב</button></div>}
        </section>
      )}

      {order.dispute && (
        <section className="space-y-1 border-2 border-bad/40 bg-red-50 p-4 text-sm">
          <div className="font-display text-lg font-black text-bad">פרטי המחלוקת</div>
          <div><span className="text-ink-soft">סיבה: </span>{order.dispute.reason}</div>
          <div><span className="text-ink-soft">פירוט: </span>{order.dispute.details}</div>
          {order.dispute.photo && <div className="mt-2 inline-block bg-[#FFFEFA] p-1 shadow-soft"><img src={order.dispute.photo} alt="תמונה מהקונה" className="h-28 object-cover" /></div>}
        </section>
      )}

      <section className="space-y-3">{actions}</section>

      <section className="space-y-2">
        <Receipt
          title="REWEAR · קבלה"
          lines={[{ label: 'פריט', value: fmt(order.itemPrice) }, { label: 'משלוח', value: fmt(order.shippingFee) }, { label: 'הגנת קונה', value: fmt(order.protectionFee) }]}
          total={fmt(order.total)}
          footer={<><div>כתובת: {order.shippingAddress}</div>{order.trackingNumber && <div dir="ltr">{order.trackingNumber}</div>}</>}
        />
      </section>

      {reveal && order.thankYou && <NoteReveal text={order.thankYou} onClose={() => setReveal(false)} />}

      <Sheet open={sheet === 'ship'} onClose={() => setSheet(null)} title="פתק לחבילה">
        <p className="mb-3 flex items-start gap-2 text-sm text-ink-soft"><Mail size={18} className="mt-0.5 shrink-0" aria-hidden />כמה מילים שייפתחו אצל הקונה יחד עם החבילה. אפשר לערוך, ואפשר לדלג.</p>
        <textarea data-testid="ship-note" value={shipText} maxLength={NOTE_MAX} onChange={(e) => setShipText(e.target.value)} rows={3} aria-label="הפתק לחבילה" className="field !min-h-[96px] font-hand !text-[24px] !leading-7" />
        <div className="mb-3 mt-1 text-end text-xs text-ink-soft" dir="ltr">{shipText.length}/{NOTE_MAX}</div>
        <div className="space-y-3">
          <button className={primary} onClick={() => doShip(shipText.trim().length > 0)}>שלח עם הפתק</button>
          <button className="btn btn-ghost w-full" onClick={() => doShip(false)}>דלג ושלח בלי פתק</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'release'} onClose={() => setSheet(null)} title="שחרור תשלום">
        <p className="mb-4 text-sm text-ink-soft">לאשר שהפריט הגיע ותקין? החותם יישבר ו-{fmt(order.itemPrice)} ישוחררו ל{seller.name}. <b>לא ניתן לבטל.</b></p>
        <div className="space-y-3">
          <button className={primary} onClick={() => { setSheet(null); release(false); }}>כן, שחרר תשלום</button>
          <button className="btn btn-ghost w-full" onClick={() => setSheet(null)}>עוד לא</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'dispute'} onClose={() => setSheet(null)} title="יש בעיה עם הפריט">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="סיבה">
            {REASONS.map((r) => (
              <button key={r} role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={`tap rounded-lg border-2 px-2 text-sm font-medium ${reason === r ? 'border-bad bg-red-50 text-bad' : 'border-gray-300'}`}>{r}</button>
            ))}
          </div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="מה הבעיה? נא לפרט במשפט או שניים" aria-label="פירוט" className="field" />
          <label className="tap flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink/40 bg-gray-50 px-3 text-sm text-ink-soft">
            <Camera size={18} aria-hidden />{photo ? 'התמונה צורפה' : 'צירוף תמונה (לא חובה)'}
            <input type="file" accept="image/*" hidden data-testid="dispute-photo" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPhoto(await compressImage(f)); } catch { show('לא הצלחנו לקרוא את התמונה', 'error'); } } }} />
          </label>
          {dErr && <p role="alert" className="text-xs text-bad">{dErr}</p>}
          <button className="btn btn-danger-solid w-full" onClick={submitDispute}>שלח דיווח והקפא תשלום</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'rate'} onClose={() => setSheet(null)} title={`דרג את ${seller.name}`}>
        <div className="space-y-3">
          <div className="flex justify-center gap-1" role="radiogroup" aria-label="דירוג">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} כוכבים`} onClick={() => setStars(n)} className="tap flex items-center justify-center">
                <Star size={34} className={n <= stars ? 'fill-kraft text-kraft-dark' : 'text-gray-300'} />
              </button>
            ))}
          </div>
          <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={140} placeholder="תגובה קצרה (לא חובה)" aria-label="תגובה" className="field" />
          <button className={primary} onClick={submitRating}>שלח דירוג</button>
        </div>
      </Sheet>
    </div>
  );
}
