import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, TrendingUp, DollarSign, User } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';

const tabs = [
  { path: '/',           icon: Home,       label: 'Dashboard' },
  { path: '/challenges', icon: Trophy,     label: 'Challenges' },
  { path: '/trading',    icon: TrendingUp, label: 'Positions' },
  { path: '/payouts',    icon: DollarSign, label: 'Payouts' },
  { path: '/profile',    icon: User,       label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { positions } = useTradingStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-card-app border-t border-default"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[58px]">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
          const showBadge = tab.path === '/trading' && positions.length > 0;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-[3px] w-full h-full relative select-none active:opacity-60 transition-opacity"
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent-app" />
              )}

              <div className="relative">
                <tab.icon
                  size={20}
                  className={isActive ? 'text-accent-app' : 'text-tertiary'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-green-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {positions.length}
                  </span>
                )}
              </div>

              <span className={`text-[9.5px] font-semibold tracking-wide ${isActive ? 'text-accent-app' : 'text-tertiary'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
