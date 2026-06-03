import { useTradingStore } from '@/stores/tradingStore';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Zap, CheckCircle, Clock } from 'lucide-react';
import type { ActivityItem } from '@/types';

function iconFor(type: ActivityItem['type']) {
  switch (type) {
    case 'trade_open':       return <TrendingUp size={12} className="text-accent-app" />;
    case 'trade_close':      return <TrendingDown size={12} className="text-secondary" />;
    case 'deposit':          return <ArrowDownLeft size={12} className="text-green-600" />;
    case 'withdrawal':       return <ArrowUpRight size={12} className="text-orange-500" />;
    case 'partial_close':    return <Zap size={12} className="text-amber-500" />;
    case 'take_profit_hit':  return <CheckCircle size={12} className="text-green-600" />;
    case 'stop_loss_hit':    return <TrendingDown size={12} className="text-red-500" />;
    case 'swap':             return <Zap size={12} className="text-purple-500" />;
    default:                 return <Clock size={12} className="text-tertiary" />;
  }
}

function bgFor(type: ActivityItem['type']) {
  switch (type) {
    case 'trade_open':       return 'bg-blue-50 dark:bg-blue-900/20';
    case 'deposit':          return 'bg-green-50 dark:bg-green-900/20';
    case 'withdrawal':       return 'bg-orange-50 dark:bg-orange-900/20';
    case 'take_profit_hit':  return 'bg-green-50 dark:bg-green-900/20';
    case 'stop_loss_hit':    return 'bg-red-50 dark:bg-red-900/20';
    case 'swap':             return 'bg-purple-50 dark:bg-purple-900/20';
    default:                 return 'bg-muted-app';
  }
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function RecentActivity() {
  const { tradingHistory } = useTradingStore();
  const items = tradingHistory.slice(0, 8);

  if (items.length === 0) return null;

  return (
    <div className="card">
      <p className="text-sm font-bold text-primary-app mb-3">Recent Activity</p>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-xl ${bgFor(item.type)} flex items-center justify-center flex-shrink-0`}>
              {iconFor(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary-app truncate">{item.description}</p>
              <p className="text-[11px] text-tertiary mt-0.5">{timeAgo(item.timestamp)}</p>
            </div>
            {item.amount !== undefined && (
              <p className={`text-xs font-bold flex-shrink-0 ${item.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
