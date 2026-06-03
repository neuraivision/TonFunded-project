import { useTradingStore } from '@/stores/tradingStore';
import { Shield, Info } from 'lucide-react';
import { useState } from 'react';

function Bar({ label, value, limit, percent, variant = 'default' }: {
  label: string; value: number; limit: number; percent: number; variant?: 'default' | 'profit';
}) {
  const safePercent = Math.min(Math.max(percent, 0), 100);
  const color = variant === 'profit'
    ? 'bg-gradient-to-r from-[#4DB8FF] to-cyan-400'
    : safePercent >= 80 ? 'bg-red-500'
    : safePercent >= 50 ? 'bg-amber-400'
    : 'bg-green-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-secondary">{label}</span>
        <span className="text-xs font-semibold text-primary-app">
          {value >= 0 ? '+' : ''}{value.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 bg-muted-app rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${safePercent}%` }} />
      </div>
    </div>
  );
}

export default function DrawdownMonitor() {
  const { dailyDrawdown, overallDrawdown, profitTarget } = useTradingStore();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="card space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <Shield size={13} className="text-orange-500" />
          </div>
          <span className="text-sm font-semibold text-primary-app">Risk Monitor</span>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="text-tertiary active:opacity-60">
          <Info size={15} />
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2.5 text-xs text-secondary leading-relaxed">
          Daily and overall drawdown limits protect your challenge. Exceed them and the challenge fails.
        </div>
      )}

      <Bar label="Daily Drawdown" value={dailyDrawdown.current} limit={dailyDrawdown.limit} percent={dailyDrawdown.percentOfLimit} />
      <Bar label="Overall Drawdown" value={overallDrawdown.current} limit={overallDrawdown.limit} percent={overallDrawdown.percentOfLimit} />

      <div className="pt-0.5">
        <Bar label="Profit Target" value={profitTarget.current} limit={profitTarget.target} percent={profitTarget.percentComplete} variant="profit" />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-accent-app font-semibold">{profitTarget.percentComplete.toFixed(1)}% to funded</span>
          <span className="text-[11px] text-tertiary">${(profitTarget.target - profitTarget.current).toFixed(0)} remaining</span>
        </div>
      </div>
    </div>
  );
}
