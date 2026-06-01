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
      {/* Top header */}
      <header className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,16px)] pb-3 bg-white border-b border-default sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo-48.png" alt="TonFunded" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-base font-bold text-primary-app">{title}</span>
        </div>

        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <Bell size={17} className="text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
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
