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
      {/* Top header — generous height + overflow visible so logo & badge never clip */}
      <header
        className="flex items-center justify-between bg-white border-b border-default sticky top-0 z-40"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px) + 12px, 16px)',
          paddingBottom: '14px',
          paddingLeft: '16px',
          paddingRight: '16px',
          overflow: 'visible',
        }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-48.png"
            alt="TonFunded"
            className="w-9 h-9 rounded-xl object-cover shadow-sm"
          />
          <span className="text-base font-bold text-primary-app">{title}</span>
        </div>

        {/* Notification bell — overflow visible so red badge is never clipped */}
        <div style={{ overflow: 'visible', padding: '4px' }}>
          <button
            onClick={() => setNotifOpen(true)}
            className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
            style={{ overflow: 'visible' }}
          >
            <Bell size={18} className="text-secondary" />
            {unreadCount > 0 && (
              <span
                className="absolute bg-red-500 text-white font-bold rounded-full flex items-center justify-center"
                style={{
                  top: '-6px',
                  right: '-6px',
                  minWidth: '20px',
                  height: '20px',
                  fontSize: '10px',
                  padding: '0 4px',
                  zIndex: 50,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <BottomNav />

      {/* Notification panel */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
