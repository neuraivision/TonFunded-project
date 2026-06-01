import { useTradingStore } from '@/stores/tradingStore';
import { Info } from 'lucide-react';

function getBarColor(percent: number): string {
  if (percent >= 80) return 'bg-danger-app';
  if (percent >= 50) return 'bg-warning-app';
  return 'bg-success-app';
}

function ProgressBar({
  label,
  value,
  limit,
  percent,
  color,
}: {
  label: string;
  value: number;
  limit: number;
  percent: number;
  color?: string;
}) {
  const barColor = color || getBarColor(percent);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-secondary">{label}</span>
        <span className="text-[13px] font-medium text-primary-app">
          {value >= 0 ? '+' : ''}
          {value.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function DrawdownMonitor() {
  const { dailyDrawdown, overallDrawdown, profitTarget } = useTradingStore();

  return (
    <div className="card-base space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary-app">Drawdown Monitor</h3>
        <Info size={16} className="text-tertiary" />
      </div>

      <ProgressBar
        label="Daily"
        value={dailyDrawdown.current}
        limit={dailyDrawdown.limit}
        percent={dailyDrawdown.percentOfLimit}
      />

      <ProgressBar
        label="Overall"
        value={overallDrawdown.current}
        limit={overallDrawdown.limit}
        percent={overallDrawdown.percentOfLimit}
      />

      <div className="pt-1">
        <ProgressBar
          label="Profit Target"
          value={profitTarget.current}
          limit={profitTarget.target}
          percent={profitTarget.percentComplete}
          color="bg-accent-app"
        />
        <p className="text-xs font-medium text-accent-app mt-1.5">
          {profitTarget.percentComplete}% to funded
        </p>
      </div>
    </div>
  );
}
