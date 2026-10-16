import type { OrderStatus } from '../types';

export const statusLabel: Record<OrderStatus, string> = {
  paid_escrow: 'בנאמנות', shipped: 'נשלח', delivered: 'הגיע', completed: 'שוחרר', disputed: 'במחלוקת', refunded: 'הוחזר',
};
// Text colour only: the status is shown as a rubber stamp (border follows currentColor).
export const statusColor: Record<OrderStatus, string> = {
  paid_escrow: 'text-escrow', shipped: 'text-kraft-dark', delivered: 'text-primary-dark',
  completed: 'text-ok', disputed: 'text-bad', refunded: 'text-ink-soft',
};

import type { Order, UserId } from '../types';

export const AUTO_RELEASE_MS = 48 * 3600_000;

// Does this order need an action from the given user right now? (drives "ממתין לך" and the nav badge)
export function needsAction(o: Order, userId: UserId): boolean {
  if (o.sellerId === userId && o.status === 'paid_escrow') return true;
  if (o.buyerId === userId && o.status === 'delivered') return true;
  if (o.buyerId === userId && o.status === 'completed' && !o.rated) return true;
  return false;
}
