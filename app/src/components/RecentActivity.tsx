import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { TrendingUp, TrendingDown, Wallet, Trophy, DollarSign, ArrowLeftRight } from 'lucide-react';
import type { ActivityItem } from '@/types';

function getActivityIcon(type: ActivityItem['type']): {
  icon: React.ElementType;
  bg: string;
  color: string;
} {
  switch (type) {
    case 'trade_open':
      return { icon: TrendingUp, bg: 'rgba(77,184,255,0.1)', color: '#4DB8FF' };
    case 'trade_close':
      return { icon: TrendingDown, bg: 'rgba(249,115,22,0.1)', color: '#fb923c' };
    case 'deposit':
      return { icon: Wallet, bg: 'rgba(22,163,74,0.1)', color: '#4ade80' };
    case 'withdrawal':
    case 'payout':
      return { icon: DollarSign, bg: 'rgba(168,85,247,0.1)', color: '#c084fc' };
    case 'challenge_purchase':
      return { icon: Trophy, bg: 'rgba(234,179,8,0.1)', color: '#fbbf24' };
    case 'swap':
      return { icon: ArrowLeftRight, bg: 'rgba(6,182,212,0.1)', color: '#22d3ee' };
    default:
      return { icon: Wallet, bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' };
  }
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RecentActivity() {
  const navigate = useNavigate();
  const { tradingHistory } = useTradingStore();
  const recent = tradingHistory.slice(0, 4);

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-primary-app">Recent Activity</h3>
        <button
          onClick={() => navigate('/trading')}
          className="text-[13px] font-medium text-accent-app active:opacity-70"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-sm text-tertiary text-center py-4">No activity yet</p>
        ) : (
          recent.map((item) => {
            const { icon: Icon, bg, color } = getActivityIcon(item.type);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}
                >
                  <Icon size={14} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-app truncate">
                    {item.description}
                  </p>
                  <p className="text-xs text-tertiary">{formatTimeAgo(item.timestamp)}</p>
                </div>
                {item.amountFormatted && (
                  <span
                    className={`text-sm font-semibold flex-shrink-0 ${
                      (item.amount ?? 0) >= 0 ? 'text-success-app' : 'text-danger-app'
                    }`}
                  >
                    {item.amountFormatted}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
