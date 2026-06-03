import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { TradeRecord } from '@/types';

interface Props { record: TradeRecord; }

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export default function TradeHistoryCard({ record }: Props) {
  const isWin = record.pnl >= 0;

  return (
    <div className={`card !p-3.5 border-l-[3px] ${isWin ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isWin ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          {isWin
            ? <TrendingUp size={15} className="text-green-600" />
            : <TrendingDown size={15} className="text-red-500" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-primary-app">{record.tokenName}</span>
            <span className={`badge text-[9px] ${record.direction === 'long' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
              {record.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-tertiary" />
              <span className="text-[11px] text-tertiary">{timeAgo(record.closedAt)}</span>
            </div>
            <span className="text-tertiary text-[10px]">·</span>
            <span className="text-[11px] text-tertiary">{record.durationMinutes}m</span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-sm font-bold ${isWin ? 'text-green-600' : 'text-red-500'}`}>
            {isWin ? '+' : ''}${Math.abs(record.pnl).toFixed(2)}
          </p>
          <p className={`text-[11px] ${isWin ? 'text-green-500' : 'text-red-400'}`}>
            {isWin ? '+' : ''}{record.pnlPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-default">
        {[
          { label: 'Entry',    val: `$${record.entryPrice.toFixed(6)}` },
          { label: 'Exit',     val: `$${record.exitPrice.toFixed(6)}` },
          { label: 'Size',     val: record.quantity.toLocaleString() },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[10px] text-tertiary">{label}</p>
            <p className="text-[11px] font-semibold text-primary-app mt-0.5">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
