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
      return { icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-500' };
    case 'trade_close':
      return { icon: TrendingDown, bg: 'bg-orange-50', color: 'text-orange-500' };
    case 'deposit':
      return { icon: Wallet, bg: 'bg-green-50', color: 'text-green-500' };
    case 'withdrawal':
    case 'payout':
      return { icon: DollarSign, bg: 'bg-purple-50', color: 'text-purple-500' };
    case 'challenge_purchase':
      return { icon: Trophy, bg: 'bg-yellow-50', color: 'text-yellow-600' };
    case 'swap':
      return { icon: ArrowLeftRight, bg: 'bg-cyan-50', color: 'text-cyan-600' };
    default:
      return { icon: Wallet, bg: 'bg-gray-50', color: 'text-gray-500' };
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
                  className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={14} className={color} />
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
