import { useTradingStore } from '@/stores/tradingStore';
import { Shield, TrendingUp, Info } from 'lucide-react';

function RiskBar({
  label,
  value,
  limit,
  percent,
  isTarget,
}: {
  label: string;
  value: number;
  limit: number;
  percent: number;
  isTarget?: boolean;
}) {
  const capped = Math.min(percent, 100);
  const fillColor = isTarget
    ? '#4DB8FF'
    : percent >= 80
      ? '#ef4444'
      : percent >= 50
        ? '#f59e0b'
        : '#22c55e';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-500 text-secondary" style={{ fontWeight: 500 }}>{label}</span>
        <span className="text-xs font-600 text-primary-app font-number" style={{ fontWeight: 600 }}>
          {value >= 0 ? '+' : ''}{value.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${capped}%`, background: fillColor, boxShadow: isTarget ? '0 0 6px rgba(77,184,255,0.4)' : 'none' }}
        />
      </div>
      {isTarget && (
        <p className="text-[11px] font-600" style={{ color: '#4DB8FF', fontWeight: 600 }}>
          {percent.toFixed(0)}% to funded
        </p>
      )}
    </div>
  );
}

export default function DrawdownMonitor() {
  const { dailyDrawdown, overallDrawdown, profitTarget } = useTradingStore();

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(77,184,255,0.08)' }}
          >
            <Shield size={13} style={{ color: '#4DB8FF' }} />
          </div>
          <h3 className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>
            Risk Monitor
          </h3>
        </div>
        <Info size={14} className="text-tertiary" strokeWidth={1.5} />
      </div>

      <div className="space-y-3.5">
        <RiskBar
          label="Daily Drawdown"
          value={dailyDrawdown.current}
          limit={dailyDrawdown.limit}
          percent={dailyDrawdown.percentOfLimit}
        />
        <RiskBar
          label="Overall Drawdown"
          value={overallDrawdown.current}
          limit={overallDrawdown.limit}
          percent={overallDrawdown.percentOfLimit}
        />
        <div className="pt-0.5" style={{ borderTop: '1px solid var(--border-default)' }}>
          <div className="pt-3.5">
            <RiskBar
              label="Profit Target"
              value={profitTarget.current}
              limit={profitTarget.target}
              percent={profitTarget.percentComplete}
              isTarget
            />
          </div>
        </div>
      </div>
    </div>
  );
}
