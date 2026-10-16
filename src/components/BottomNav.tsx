import { NavLink } from 'react-router-dom';
import { Home, Search, Package, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { needsAction } from '../lib/status';

const tabs = [
  { to: '/', label: 'בית', Icon: Home, end: true },
  { to: '/search', label: 'חיפוש', Icon: Search },
  { to: '/sell', label: 'מכירה', main: true },
  { to: '/orders', label: 'הזמנות', Icon: Package },
  { to: '/profile', label: 'פרופיל', Icon: User },
];

// The sell button is a garment button: stitched rim, four holes, and the "+" is the thread through them.
function ClothesButton() {
  return (
    <svg viewBox="0 0 60 60" width="58" height="58" aria-hidden style={{ filter: 'drop-shadow(0 3px 0 #7A3015)' }}>
      <circle cx="30" cy="30" r="28" fill="#B84A24" />
      <circle cx="30" cy="30" r="23.5" fill="none" stroke="#F4EEE3" strokeWidth="1.3" strokeDasharray="3.2 2.6" opacity=".9" />
      <circle cx="30" cy="30" r="15.5" fill="none" stroke="#7A3015" strokeWidth="1.2" opacity=".55" />
      <path d="M30 15.5v29M15.5 30h29" stroke="#F4EEE3" strokeWidth="2.2" strokeLinecap="round" />
      {[[30, 18], [30, 42], [18, 30], [42, 30]].map(([x, y]) => (
        <g key={`${x}-${y}`}><circle cx={x} cy={y} r="3.1" fill="#5A220E" /><circle cx={x - 0.6} cy={y - 0.6} r="1" fill="#9C3D1C" /></g>
      ))}
    </svg>
  );
}

export default function BottomNav() {
  const pending = useStore((s) => s.orders.filter((o) => needsAction(o, s.currentUserId)).length);
  return (
    <nav className="paper fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-line" aria-label="ניווט ראשי">
      <ul className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {tabs.map(({ to, label, Icon, end, main }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                main
                  ? 'tap -mt-6 flex h-[58px] w-[58px] items-center justify-center rounded-full'
                  : `tap relative flex flex-col items-center justify-center gap-0.5 px-2 text-[11px] ${isActive ? 'font-bold text-primary-hover' : 'text-ink-soft'}`
              }
            >
              {({ isActive }) =>
                main ? (
                  <motion.span whileTap={{ y: 2 }} className="flex"><ClothesButton /></motion.span>
                ) : (
                  <>
                    {Icon && <Icon size={22} aria-hidden />}
                    {to === '/orders' && pending > 0 && <span data-testid="nav-badge" className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-escrow px-1 text-[10px] font-bold text-white">{pending}</span>}
                    {label}
                    {isActive && <span aria-hidden className="absolute bottom-0 h-0 w-7 border-b-2 border-dashed border-primary" />}
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
