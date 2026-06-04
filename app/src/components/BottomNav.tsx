import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, TrendingUp, ArrowLeftRight, User } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/trading', icon: TrendingUp, label: 'Trading' },
  { path: '/swap', icon: ArrowLeftRight, label: 'Swap' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-default max-w-lg mx-auto">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full relative select-none active:opacity-70 transition-opacity"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 rounded-full bg-accent-app" />
              )}
              <tab.icon
                size={20}
                className={isActive ? 'text-accent-app' : 'text-tertiary'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  isActive ? 'text-accent-app' : 'text-tertiary'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
