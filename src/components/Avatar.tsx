import type { User } from '../types';

// Monogram "name tag" instead of emoji avatars; palette colours per person.
const COLORS: Record<string, string> = { noa: '#4A5D3A', dani: '#76562A', maya: '#8E1F1F' };

export function Avatar({ user, size = 32 }: { user: Pick<User, 'id' | 'name'>; size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full font-display font-black text-white"
      style={{ width: size, height: size, background: COLORS[user.id] ?? '#2B2420', fontSize: size * 0.5 }}
      aria-hidden
    >
      <span className="absolute rounded-full border border-dashed border-white/55" style={{ inset: Math.max(2, size * 0.09) }} />
      {user.name.slice(0, 1)}
    </span>
  );
}
