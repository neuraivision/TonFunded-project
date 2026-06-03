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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-default max-w-lg mx-auto"
      style={{
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-around h-[60px]">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 w-full h-full relative select-none transition-opacity"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: 'var(--gradient-accent)' }}
                />
              )}
              
              {/* Icon container */}
              <div
                className={`flex items-center justify-center w-9 h-7 rounded-xl transition-all duration-150 ${
                  isActive ? 'bg-accent-light' : ''
                }`}
              >
                <tab.icon
                  size={isActive ? 19 : 20}
                  className={isActive ? 'text-accent-app' : 'text-tertiary'}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span
                className={`text-[10px] leading-none transition-colors ${
                  isActive ? 'text-accent-app font-700' : 'text-tertiary font-500'
                }`}
                style={{ fontWeight: isActive ? 700 : 500 }}
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
