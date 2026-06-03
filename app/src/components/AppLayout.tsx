import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import BottomNav from './BottomNav';
import NotificationPanel from './NotificationPanel';
import { useNotificationStore } from '@/stores/notificationStore';

const PAGE_TITLES: Record<string, string> = {
  '/': 'TonFunded',
  '/challenges': 'Challenges',
  '/trading': 'Trading',
  '/swap': 'Quick Swap',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile',
};

export default function AppLayout() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  const title = PAGE_TITLES[location.pathname] ?? 'TonFunded';

  return (
    <div className="min-h-screen bg-primary-app flex flex-col max-w-lg mx-auto">
      {/* Premium header */}
      <header
        className="flex items-center justify-between border-b border-default sticky top-0 z-40"
        style={{
          background: 'var(--bg-card)',
          paddingTop: 'max(env(safe-area-inset-top, 0px) + 10px, 14px)',
          paddingBottom: '12px',
          paddingLeft: '18px',
          paddingRight: '18px',
          overflow: 'visible',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src="/logo-48.png"
              alt="TonFunded"
              className="w-9 h-9 rounded-xl object-cover"
              style={{ boxShadow: '0 2px 8px rgba(77,184,255,0.25)' }}
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white"
              style={{ boxShadow: '0 0 6px rgba(34,197,94,0.5)' }}
            />
          </div>
          <div>
            <p className="text-[15px] text-primary-app leading-tight" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
              {title}
            </p>
            {location.pathname === '/' && (
              <p className="text-[10px] text-tertiary leading-tight">Prop Trading Platform</p>
            )}
          </div>
        </div>

        <div style={{ overflow: 'visible', padding: '4px' }}>
          <button
            onClick={() => setNotifOpen(true)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center active:opacity-70 transition-colors"
            style={{ overflow: 'visible', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <Bell size={17} className="text-secondary" />
            {unreadCount > 0 && (
              <span
                className="absolute bg-red-500 text-white font-bold rounded-full flex items-center justify-center"
                style={{
                  top: '-5px',
                  right: '-5px',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '9px',
                  padding: '0 4px',
                  zIndex: 50,
                  boxShadow: '0 0 6px rgba(239,68,68,0.4)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <Outlet />
      </main>

      <BottomNav />
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
