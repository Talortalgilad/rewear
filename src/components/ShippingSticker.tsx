import type { Order, User } from '../types';
import { Barcode, Postmark } from './Art';

// Kraft shipping label with a drawn barcode, and a round postmark carrying the dispatch date.
export default function ShippingSticker({ order, seller, buyer }: { order: Order; seller: User; buyer: User }) {
  const shippedAt = [...order.timeline].reverse().find((e) => e.status === 'shipped')?.at ?? Date.now();
  const tracking = order.trackingNumber ?? '';
  return (
    <div className="relative mx-auto w-full max-w-[300px] pb-7" data-testid="sticker">
      <div className="rotate-[-1.5deg] border border-kraft-dark/40 bg-kraft p-3 shadow-soft">
        <div className="flex items-center justify-between border-b-2 border-dashed border-ink/40 pb-1.5 text-[11px] font-bold tracking-wide text-ink">
          <span>ReWear · משלוח</span><span dir="ltr">PRIORITY</span>
        </div>
        <div className="mt-2 space-y-0.5 text-[13px] leading-snug text-ink">
          <div><span className="font-bold">מאת:</span> {seller.name}, {seller.city}</div>
          <div><span className="font-bold">אל:</span> {buyer.name}, {order.shippingAddress}</div>
        </div>
        <div className="mt-2.5 bg-[#F7F0E0] px-2 pb-1 pt-2">
          <Barcode value={tracking} className="h-12 w-full" />
          <div dir="ltr" className="mt-1 text-center font-mono text-[13px] font-bold tracking-[.25em] text-ink">{tracking}</div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-1 left-1 rotate-[-9deg]"><Postmark date={new Date(shippedAt)} size={64} /></div>
    </div>
  );
}
