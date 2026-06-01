import { ArrowRight, ExternalLink } from 'lucide-react';
import type { SwapHistoryItem } from '@/types';
import { STONFI_TOKENS } from '@/stores/swapStore';

interface Props {
  item: SwapHistoryItem;
}

function formatTimeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function formatAmount(amount: number, symbol: string): string {
  const token = STONFI_TOKENS.find((t) => t.symbol === symbol);
  const decimals = token?.decimals ?? 9;
  if (decimals === 0) {
    if (amount >= 1_000_000)
      return `${(amount / 1_000_000).toFixed(2)}M ${symbol}`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K ${symbol}`;
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${symbol}`;
  }
  if (amount >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(3)}M ${symbol}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K ${symbol}`;
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })} ${symbol}`;
}

function TokenChip({ symbol }: { symbol: string }) {
  const token = STONFI_TOKENS.find((t) => t.symbol === symbol);
  const color = token?.logoColor ?? '#9ca3af';
  const initials = token?.logoInitials ?? symbol.slice(0, 2);
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <span className="text-xs font-semibold text-primary-app">{symbol}</span>
    </div>
  );
}

export default function SwapHistoryCard({ item }: Props) {
  const truncatedHash = `${item.txHash.slice(0, 6)}…${item.txHash.slice(-6)}`;

  return (
    <div className="card-base !p-4">
      {/* Top row: pair + timestamp */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TokenChip symbol={item.fromSymbol} />
          <ArrowRight size={12} className="text-tertiary" />
          <TokenChip symbol={item.toSymbol} />
        </div>
        <span className="text-xs text-tertiary">{formatTimeAgo(item.executedAt)}</span>
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] text-tertiary mb-0.5">Paid</p>
          <p className="text-sm font-semibold text-primary-app">
            {formatAmount(item.fromAmount, item.fromSymbol)}
          </p>
        </div>
        <ArrowRight size={14} className="text-tertiary" />
        <div className="text-right">
          <p className="text-[11px] text-tertiary mb-0.5">Received</p>
          <p className="text-sm font-semibold text-green-600">
            {formatAmount(item.toAmount, item.toSymbol)}
          </p>
        </div>
      </div>

      {/* Meta row: impact + fee + tx hash */}
      <div className="flex items-center justify-between pt-2.5 border-t border-default">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-tertiary">
            Impact{' '}
            <span
              className={`font-semibold ${
                item.priceImpact < 1
                  ? 'text-green-600'
                  : item.priceImpact < 3
                    ? 'text-amber-600'
                    : 'text-red-500'
              }`}
            >
              {item.priceImpact.toFixed(2)}%
            </span>
          </span>
          <span className="text-[11px] text-tertiary">
            Fee{' '}
            <span className="font-medium text-secondary">${item.fee.toFixed(3)}</span>
          </span>
        </div>
        {/* Tx hash — in a real app this would open TON explorer */}
        <button className="flex items-center gap-1 text-[11px] font-medium text-accent-app active:opacity-70">
          <span>{truncatedHash}</span>
          <ExternalLink size={10} />
        </button>
      </div>
    </div>
  );
}
