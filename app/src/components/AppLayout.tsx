import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import BottomNav from './BottomNav';
import NotificationPanel from './NotificationPanel';
import { useNotificationStore } from '@/stores/notificationStore';

const PAGE_TITLES: Record<string, string> = {
  '/': 'TonFunded',
  '/challenges': 'Challenges',
  '/trading': 'Positions',
  '/swap': 'Quick Swap',
  '/payouts': 'Payouts',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile',
};

export default function AppLayout() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotificationStore();
  const title = PAGE_TITLES[location.pathname] ?? 'TonFunded';

  return (
    <div className="min-h-dvh bg-primary-app flex flex-col max-w-lg mx-auto">
      <header
        className="flex items-center justify-between bg-card-app border-b border-default sticky top-0 z-40"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px) + 10px, 14px)',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
          overflow: 'visible',
        }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo-48.png" alt="TonFunded" className="w-8 h-8 rounded-xl object-cover" />
          <span className="text-[15px] font-bold text-primary-app tracking-tight">{title}</span>
        </div>
        <div style={{ overflow: 'visible', padding: '4px' }}>
          <button
            onClick={() => setNotifOpen(true)}
            className="relative w-9 h-9 rounded-full bg-muted-app flex items-center justify-center active:opacity-70 transition-opacity"
            style={{ overflow: 'visible' }}
          >
            <Bell size={17} className="text-secondary" />
            {unreadCount > 0 && (
              <span
                className="absolute bg-red-500 text-white font-bold rounded-full flex items-center justify-center"
                style={{ top: '-5px', right: '-5px', minWidth: '18px', height: '18px', fontSize: '9px', padding: '0 3px', zIndex: 50 }}
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
