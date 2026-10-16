import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Lightbulb, Loader2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES, CONDITIONS, type Category, type Condition } from '../types';
import { compressImage } from '../lib/image';
import { fmt, suggestPrice } from '../lib/money';
import { useToast } from '../components/Toast';
import SafeImage from '../components/SafeImage';
import PriceTag from '../components/PriceTag';

const LETTER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
const SIZES: Record<Category, string[]> = {
  'חולצות': LETTER, 'שמלות': LETTER, 'מעילים': LETTER,
  'מכנסיים': range(28, 38), 'נעליים': range(35, 46), 'אקססוריז': ['ONE'],
};
const BRANDS = ['Zara', 'H&M', 'Castro', 'Fox', "Levi's", 'Nike', 'Adidas', 'Mango', 'Renuar'];
const MAX_IMAGES = 4;
const STORY_MAX = 200;
const STORY_HINTS = [
  'קניתי לחתונה של אחותי, רקדתי בו כל הלילה',
  'הלך איתי לשלוש הופעות ולטיול אחד בצפון',
  'קיבלתי במתנה, ולא התאים לי. מחכה למישהו שיאהב אותו',
  'היה לי בצבא, ועבר איתי הרבה בקרים',
];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {error && <span role="alert" className="block text-xs text-bad">{error}</span>}
    </label>
  );
}

export default function Sell() {
  const nav = useNavigate();
  const listItem = useStore((s) => s.listItem);
  const show = useToast((s) => s.show);
  const fileRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('חולצות');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<Condition>('טוב מאוד');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [hint, setHint] = useState(0);
  const [tried, setTried] = useState(false);

  // The story box's placeholder cycles through examples while it's empty.
  useEffect(() => {
    if (story) return;
    const t = setInterval(() => setHint((h) => (h + 1) % STORY_HINTS.length), 4000);
    return () => clearInterval(t);
  }, [story]);

  const suggested = suggestPrice(category, condition, brand);
  const priceNum = Number(price);

  const errors = {
    images: images.length === 0 ? 'יש להעלות לפחות תמונה אחת' : '',
    title: title.trim().length < 3 ? 'כותרת של לפחות 3 תווים' : '',
    size: !size ? 'נא לבחור מידה' : '',
    brand: !brand.trim() ? 'נא למלא מותג' : '',
    price: !Number.isInteger(priceNum) || priceNum < 10 || priceNum > 5000 ? 'מחיר שלם בין ₪10 ל-₪5,000' : '',
    description: description.trim().length < 10 ? 'תיאור של לפחות 10 תווים' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (k: keyof typeof errors) => (tried ? errors[k] : '');

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_IMAGES - images.length;
    if (files.length > room) show(`אפשר להעלות עד ${MAX_IMAGES} תמונות`, 'error');
    setBusy(true);
    try {
      const out = await Promise.all([...files].slice(0, room).map(compressImage));
      setImages((prev) => [...prev, ...out]);
    } catch {
      show('לא הצלחנו לקרוא את התמונה. אפשר לנסות קובץ אחר.', 'error');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (hasErrors) { show('יש לתקן את השדות המסומנים', 'error'); return; }
    const id = listItem({ title: title.trim(), description: description.trim(), category, size, brand: brand.trim(), condition, price: priceNum, images, story: story.trim() || undefined });
    show('הפריט עלה לקולב');
    nav(`/item/${id}`);
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-4 pb-8" noValidate>
      <h1 className="text-2xl">מכירת פריט</h1>

      <div>
        <div className="mb-1 text-sm font-bold">תמונות ({images.length}/{MAX_IMAGES})</div>
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, n) => (
            <div key={n} className="relative aspect-square bg-[#FFFEFA] p-0.5 shadow-soft">
              <img src={src} alt={`תמונה ${n + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== n))} aria-label={`הסר תמונה ${n + 1}`} className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-card"><X size={14} /></button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} aria-label="הוספת תמונה" className="flex aspect-square flex-col items-center justify-center gap-1 border-2 border-dashed border-ink/40 bg-kraft-soft text-xs font-bold text-ink">
              {busy ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}
              {busy ? 'מכווץ…' : 'הוסף'}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} data-testid="file" />
        {err('images') && <span role="alert" className="mt-1 block text-xs text-bad">{err('images')}</span>}
      </div>

      <Field label="כותרת" error={err('title')}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="למשל: ג׳קט ג׳ינס קלאסי" className="field" /></Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="קטגוריה">
          <select value={category} onChange={(e) => { setCategory(e.target.value as Category); setSize(''); }} className="field">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="מידה" error={err('size')}>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="field"><option value="">בחר</option>{SIZES[category].map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="מותג" error={err('brand')}>
          <input list="brands" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Zara, Nike…" className="field" />
          <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
        </Field>
        <Field label="מצב">
          <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className="field">{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
      </div>

      <Field label="מחיר (₪)" error={err('price')}>
        <input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="field" />
      </Field>
      <button type="button" onClick={() => setPrice(String(suggested))} className="btn btn-ghost w-full text-sm">
        <Lightbulb size={16} aria-hidden />מחיר מומלץ: {fmt(suggested)} · השתמש בו
      </button>

      <Field label="תיאור" error={err('description')}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="מצב, גזרה, פגמים אם יש…" className="field" />
      </Field>

      <div>
        <label className="block space-y-1">
          <span className="text-sm font-bold">הסיפור של הבגד <span className="font-normal text-ink-soft">(לא חובה)</span></span>
          <textarea data-testid="story" value={story} maxLength={STORY_MAX} onChange={(e) => setStory(e.target.value)} rows={3} placeholder={STORY_HINTS[hint]} className="field" />
        </label>
        <div className="mt-1 text-end text-xs text-ink-soft" dir="ltr">{story.length}/{STORY_MAX}</div>
      </div>

      <div>
        <div className="mb-3 text-sm font-bold">תצוגה מקדימה</div>
        <div className="relative w-44 pt-1" data-testid="preview">
          <div className="bg-[#FFFEFA] p-1.5 shadow-soft"><SafeImage src={images[0]} category={category} alt="תצוגה מקדימה" w={400} className="aspect-[4/5] w-full" /></div>
          <PriceTag price={priceNum > 0 ? priceNum : 0} />
          <div className="space-y-0.5 px-1 pt-2">
            <div className="truncate text-[15px] font-medium">{title || 'כותרת הפריט'}</div>
            <div className="text-xs text-ink-soft">{brand || 'מותג'} · מידה {size || '—'}</div>
          </div>
        </div>
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary w-full text-base">פרסם למכירה</button>
    </form>
  );
}
