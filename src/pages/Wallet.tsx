import { useEffect, useMemo } from 'react';
import { useStore, useCurrentUser } from '../store/useStore';
import { fmt } from '../lib/money';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import { useToast } from '../components/Toast';

export default function Wallet() {
  const me = useCurrentUser();
  const allTx = useStore((s) => s.transactions);
  const txs = useMemo(() => allTx.filter((t) => t.userId === me.id), [allTx, me.id]);
  const topUp = useStore((s) => s.topUp);
  const show = useToast((s) => s.show);
  const walletViewed = useStore((s) => s.guideWalletViewed);
  const step4 = useStore((s) => s.guide.done[3]);
  useEffect(() => { walletViewed(); }, [me.id, step4, walletViewed]);
  return (
    <div className="space-y-4 p-4">
      <div className="rotate-[-0.5deg] border-2 border-dashed border-ink/60 bg-card p-5 shadow-soft">
        <div className="text-sm text-ink-soft">יתרה זמינה</div>
        <div data-testid="available" className="text-[44px] leading-tight text-ink"><Price value={me.wallet.available} /></div>
        <div className="mt-2 border-t border-dashed border-ink/30 pt-2 text-sm text-ink-soft">בדרך אליך: <span data-testid="pending" className="font-bold text-ink">{fmt(me.wallet.pending)}</span></div>
      </div>
      <button onClick={() => { topUp(); show('נטענו 500 ₪ לארנק'); }} className="btn btn-ghost w-full">טעינה מדומה +500 ₪</button>
      <h2 className="text-xl">תנועות</h2>
      {txs.length === 0 && <EmptyState art="receipt" title="עוד אין תנועות" text="קניות, הכנסות והחזרים יופיעו כאן." cta={{ label: 'לגלות פריטים', to: '/' }} />}
      <ul className="border-t border-dashed border-ink/40">
        {txs.map((t) => (
          <li key={t.id} className="flex items-center justify-between border-b border-dashed border-ink/30 py-3 text-sm">
            <span>{t.text}<span className="block text-xs text-ink-soft">{new Date(t.at).toLocaleString('he-IL')}</span></span>
            <span className={`font-mono font-bold ${t.amount < 0 ? 'text-bad' : 'text-ok'}`} dir="ltr">{t.amount < 0 ? '-' : '+'}{fmt(Math.abs(t.amount))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
