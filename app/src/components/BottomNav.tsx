import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';

const tabs = [
  { path: '/',            icon: Home,        label: 'Dashboard' },
  { path: '/challenges',  icon: Trophy,      label: 'Challenges' },
  { path: '/trading',     icon: TrendingUp,  label: 'Positions' },
  { path: '/payouts',     icon: DollarSign,  label: 'Payouts' },
  { path: '/leaderboard', icon: BarChart2,   label: 'Leaders' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-card-app border-t border-default"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[58px]">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-[3px] w-full h-full relative select-none active:opacity-60 transition-opacity"
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-accent-app" />
              )}
              <tab.icon
                size={19}
                className={isActive ? 'text-accent-app' : 'text-tertiary'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
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
