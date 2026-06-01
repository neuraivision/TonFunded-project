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
      {/* Top header — increased height & overflow visible so badge never clips */}
      <header className="flex items-center justify-between px-4 bg-white border-b border-default sticky top-0 z-40"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 10px, 14px)', paddingBottom: '12px' }}>

        <div className="flex items-center gap-2.5">
          <img
            src="/logo-48.png"
            alt="TonFunded"
            className="w-8 h-8 rounded-xl object-cover"
          />
          <span className="text-base font-bold text-primary-app">{title}</span>
        </div>

        {/* Notification bell — extra padding so badge never clips */}
        <div className="pr-1 pt-1">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
          >
            <Bell size={17} className="text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
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
