import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { TradeRecord } from '@/types';

interface Props { record: TradeRecord; }

function fmt(n: number, dec = 4) { return n < 1 ? n.toFixed(5) : n.toFixed(dec); }
function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TradeHistoryCard({ record }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isProfit = record.pnl >= 0;
  const isLong   = record.direction === 'long';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--line-card)', boxShadow: 'var(--sh-card)' }}
    >
      {/* direction stripe */}
      <div
        className="h-[2px]"
        style={{ background: isLong ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#ef4444,#dc2626)' }}
      />

      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isProfit ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)' }}
        >
          {isProfit
            ? <TrendingUp  size={15} style={{ color: 'var(--ink-up)'   }} />
            : <TrendingDown size={15} style={{ color: 'var(--ink-down)' }} />}
        </div>

        {/* Token + direction */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px]" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>{record.tokenName}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md"
              style={{
                fontWeight: 700,
                background: isLong ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)',
                color: isLong ? 'var(--ink-up)' : 'var(--ink-down)',
              }}
            >
              {isLong ? '▲ LONG' : '▼ SHORT'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} style={{ color: 'var(--ink-3)' }} />
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>{timeSince(record.closedAt)}</span>
          </div>
        </div>

        {/* P&L */}
        <div className="text-right mr-1">
          <p className="font-number text-[14px] leading-tight" style={{ fontWeight: 700, color: isProfit ? 'var(--ink-up)' : 'var(--ink-down)' }}>
            {isProfit ? '+' : ''}${Math.abs(record.pnl).toFixed(2)}
          </p>
          <p className="font-number text-[11px]" style={{ color: isProfit ? 'var(--ink-up)' : 'var(--ink-down)' }}>
            {isProfit ? '+' : ''}{record.pnlPercent.toFixed(2)}%
          </p>
        </div>

        {expanded
          ? <ChevronUp size={14} style={{ color: 'var(--ink-3)' }} />
          : <ChevronDown size={14} style={{ color: 'var(--ink-3)' }} />}
      </div>

      {expanded && (
        <div
          className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5 page-enter"
          style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-raised)' }}
        >
          {[
            { label: 'Entry',    value: `$${fmt(record.entryPrice)}` },
            { label: 'Exit',     value: `$${fmt(record.exitPrice)}` },
            { label: 'Quantity', value: record.quantity.toLocaleString() },
            { label: 'Duration', value: (() => {
              const m = Math.floor((new Date(record.closedAt).getTime() - new Date(record.openedAt).getTime()) / 60000);
              return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
            })() },
            { label: 'Slippage', value: `${record.slippage}%` },
            { label: 'Breakeven', value: record.breakevenSet ? 'Active' : 'No' },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink-3)' }}>{row.label}</p>
              <p className="font-number text-[12px]" style={{ fontWeight: 600, color: 'var(--ink-1)' }}>{row.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
