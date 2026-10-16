import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import UserSwitcher from './UserSwitcher';
import { Hanger } from './Art';

// "ReWear" in a serif, with a little hanger perched over the W.
export function Logo() {
  return (
    <span dir="ltr" className="relative inline-flex items-baseline font-display text-[27px] font-black leading-none text-ink">
      Re
      <span className="relative text-primary-hover">
        W
        <Hanger className="absolute -top-[11px] left-1/2 w-[19px] -translate-x-1/2" />
      </span>
      ear
    </span>
  );
}

export default function Header() {
  const unread = useStore((s) => s.notifications.filter((n) => n.userId === s.currentUserId && !n.read).length);
  return (
    <header className="paper sticky top-0 z-30 flex items-center justify-between border-b border-line px-4 py-2.5">
      <Link to="/" className="tap flex items-center pt-2" aria-label="ReWear - דף הבית"><Logo /></Link>
      <div className="flex items-center gap-1">
        <Link to="/notifications" className="tap relative flex items-center justify-center" aria-label={`התראות${unread ? `, ${unread} חדשות` : ''}`}>
          <Bell size={22} aria-hidden />
          {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-escrow px-1 text-[10px] font-bold text-white">{unread}</span>}
        </Link>
        <UserSwitcher />
      </div>
    </header>
  );
}
