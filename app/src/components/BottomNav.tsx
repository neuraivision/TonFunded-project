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
        borderTop: '1px solid var(--border-default)',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 20px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-stretch h-[56px]">
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
              {/* Active indicator — top bar */}
              <span
                className="absolute top-0 rounded-full transition-all duration-200"
                style={{
                  left: '50%', transform: 'translateX(-50%)',
                  width: isActive ? '20px' : '0px',
                  height: '2px',
                  background: '#4DB8FF',
                  opacity: isActive ? 1 : 0,
                }}
              />

              {/* Icon */}
              <div
                className="flex items-center justify-center rounded-xl transition-all duration-150"
                style={{
                  width: '36px', height: '26px',
                  background: isActive ? 'rgba(77,184,255,0.1)' : 'transparent',
                }}
              >
                <tab.icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? '#4DB8FF' : 'var(--text-tertiary)' }}
                />
              </div>

              {/* Label */}
              <span
                className="text-[10px] leading-none tracking-tight"
                style={{
                  color: isActive ? '#4DB8FF' : 'var(--text-tertiary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
