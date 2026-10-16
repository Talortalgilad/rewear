// Loaded on demand (keeps the first load small) and skipped entirely for reduced-motion users.
// Torn paper scraps in the shop palette, not rainbow confetti.
const PAPER = ['#B84A24', '#4A5D3A', '#C9A877', '#F4EEE3', '#8E1F1F'];

export async function fireConfetti(big = false) {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  const base = { colors: PAPER, shapes: ['square' as const], scalar: 1.15, ticks: 220, gravity: 0.9, disableForReducedMotion: true };
  confetti({ ...base, particleCount: big ? 160 : 140, spread: big ? 90 : 80, origin: { y: 0.65 } });
  if (!big) {
    setTimeout(() => confetti({ ...base, particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 200);
  }
}
