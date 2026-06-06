import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import BottomNav from './BottomNav';
import NotificationPanel from './NotificationPanel';
import { useNotificationStore } from '@/stores/notificationStore';

const PAGE_TITLES: Record<string, string> = {
  '/':           'TonFunded',
  '/challenges': 'Challenges',
  '/trading':    'Trading',
  '/swap':       'Swap',
  '/leaderboard':'Leaderboard',
  '/profile':    'Profile',
};

export default function AppLayout() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  const title = PAGE_TITLES[location.pathname] ?? 'TonFunded';
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto" style={{ background: 'var(--bg-app)' }}>
      <header
        className="flex items-center justify-between sticky top-0 z-40"
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--line)',
          paddingTop: 'max(env(safe-area-inset-top,0px) + 12px, 16px)',
          paddingBottom: '12px',
          paddingLeft: '18px',
          paddingRight: '18px',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-48.png"
            alt="TonFunded"
            className="w-[28px] h-[28px] rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex flex-col leading-none">
            <span
              className="text-[14px]"
              style={{ fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink-1)', lineHeight: 1.2 }}
            >
              {isHome ? 'TonFunded' : title}
            </span>
            {isHome && (
              <span
                className="text-[9px] uppercase tracking-[0.09em]"
                style={{ color: 'var(--ink-3)', lineHeight: 1.4, fontWeight: 500 }}
              >
                Prop Trading
              </span>
            )}
          </div>
        </div>

        {/* Bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative flex items-center justify-center w-8 h-8 rounded-xl active:opacity-60 transition-opacity"
          style={{ background: 'var(--bg-sunken)', border: '1px solid var(--line)' }}
        >
          <Bell size={15} style={{ color: 'var(--ink-2)' }} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              className="absolute flex items-center justify-center text-white"
              style={{
                top: '-4px', right: '-4px',
                minWidth: '15px', height: '15px',
                fontSize: '8px', fontWeight: 700,
                padding: '0 3px', borderRadius: '8px',
                background: '#ef4444',
                boxShadow: '0 0 0 2px var(--bg-card)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <Outlet />
      </main>

      <BottomNav />
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
