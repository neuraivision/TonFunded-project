import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, TrendingUp, ArrowLeftRight, User } from 'lucide-react';

const tabs = [
  { path: '/',           icon: Home,          label: 'Home'       },
  { path: '/challenges', icon: Trophy,         label: 'Challenges' },
  { path: '/trading',    icon: TrendingUp,     label: 'Trading'    },
  { path: '/swap',       icon: ArrowLeftRight, label: 'Swap'       },
  { path: '/profile',    icon: User,           label: 'Profile'    },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--line)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex h-[56px]">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-[4px] relative select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active bar */}
              <span
                className="absolute top-0 rounded-full transition-all duration-200"
                style={{
                  left: '50%', transform: 'translateX(-50%)',
                  width: isActive ? '18px' : '0px',
                  height: '2px',
                  background: 'linear-gradient(90deg,#4DB8FF,#2aa8f2)',
                  opacity: isActive ? 1 : 0,
                }}
              />

              {/* Icon */}
              <div
                className="flex items-center justify-center rounded-xl transition-all duration-150"
                style={{
                  width: '34px', height: '24px',
                  background: isActive ? 'rgba(77,184,255,0.09)' : 'transparent',
                }}
              >
                <tab.icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? 'var(--ton)' : 'var(--ink-3)' }}
                />
              </div>

              {/* Label */}
              <span
                className="text-[9.5px] leading-none"
                style={{ color: isActive ? 'var(--ton)' : 'var(--ink-3)', fontWeight: isActive ? 600 : 400 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom,0px)' }} />
    </nav>
  );
}
