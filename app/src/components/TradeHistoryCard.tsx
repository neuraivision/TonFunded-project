import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { TradeRecord } from '@/types';

interface Props {
  record: TradeRecord;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function TradeHistoryCard({ record }: Props) {
  const isProfit = record.pnl >= 0;
  const tokenInitials = record.tokenName.slice(0, 2).toUpperCase();

  return (
    <div className="card-base !p-4">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Token avatar */}
          <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-accent-app">{tokenInitials}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-primary-app">{record.tokenName}</p>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: record.direction === 'long' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
                  color: record.direction === 'long' ? '#4ade80' : '#f87171',
                }}
              >
                {record.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
              </span>
              {record.closePercent < 100 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                  {record.closePercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-tertiary">{record.tokenPair}</p>
          </div>
        </div>

        {/* P&L */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            {isProfit ? (
              <TrendingUp size={13} className="text-success-app" />
            ) : (
              <TrendingDown size={13} className="text-danger-app" />
            )}
            <span
              className={`text-sm font-bold ${
                isProfit ? 'text-success-app' : 'text-danger-app'
              }`}
            >
              {isProfit ? '+' : ''}${Math.abs(record.pnl).toFixed(2)}
            </span>
          </div>
          <p
            className={`font-number text-xs font-600 ${isProfit ? 'text-success-app' : 'text-danger-app'}`}
          >
            {isProfit ? '+' : ''}
            {record.pnlPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Price grid */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-default mb-2.5">
        <div>
          <p className="text-[11px] text-tertiary mb-0.5">Entry</p>
          <p className="text-xs font-semibold text-primary-app">
            ${record.entryPrice < 0.001 ? record.entryPrice.toFixed(6) : record.entryPrice.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-tertiary mb-0.5">Exit</p>
          <p className={`font-number text-xs font-600 ${isProfit ? 'text-success-app' : 'text-danger-app'}`}>
            ${record.exitPrice < 0.001 ? record.exitPrice.toFixed(6) : record.exitPrice.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-tertiary mb-0.5">Qty</p>
          <p className="text-xs font-semibold text-primary-app">
            {record.quantity >= 1_000_000
              ? `${(record.quantity / 1_000_000).toFixed(1)}M`
              : record.quantity >= 1_000
                ? `${(record.quantity / 1_000).toFixed(1)}K`
                : record.quantity.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer: duration + closed time + fee */}
      <div className="flex items-center justify-between text-[11px] text-tertiary">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{formatDuration(record.durationMinutes)}</span>
        </div>
        <span>{formatTimeAgo(record.closedAt)}</span>
        <span>Fee: ${record.fee.toFixed(3)}</span>
      </div>
    </div>
  );
}
