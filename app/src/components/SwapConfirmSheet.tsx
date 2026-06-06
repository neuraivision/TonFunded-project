import { AlertTriangle, CheckCircle, ArrowRight, X, Info, Loader2 } from 'lucide-react';
import type { SwapQuote, SwapToken } from '@/types';
import TokenIcon from '@/components/TokenIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quote: SwapQuote;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: string;
  slippage: number;
  isConfirming: boolean;
}

function DetailRow({ label, value, valueColor, tooltip }: {
  label: string; value: string; valueColor?: string; tooltip?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-default last:border-0">
      <div className="flex items-center gap-1">
        <span className="text-sm text-secondary">{label}</span>
        {tooltip && <span title={tooltip}><Info size={12} className="text-tertiary flex-shrink-0" /></span>}
      </div>
      <span className={`text-sm font-600 text-right break-all max-w-[55%] ${valueColor ?? 'text-primary-app'}`} style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function PriceImpactBadge({ impact }: { impact: number }) {
  if (impact < 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(22,163,74,0.1)', color: '#4ade80', fontWeight: 700 }}>
        <CheckCircle size={11} />{impact.toFixed(2)}% — Low
      </span>
    );
  }
  if (impact < 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontWeight: 700 }}>
        <AlertTriangle size={11} />{impact.toFixed(2)}% — Medium
      </span>
    );
  }
  if (impact < 8) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', fontWeight: 700 }}>
        <AlertTriangle size={11} />{impact.toFixed(2)}% — High
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: 700 }}>
      <AlertTriangle size={11} />{impact.toFixed(2)}% — Very High
    </span>
  );
}

function TokenAvatar({ token, size = 'md' }: { token: SwapToken; size?: 'sm' | 'md' }) {
  return (
    <TokenIcon
      logoUrl={token.logoUrl}
      symbol={token.symbol}
      color={token.logoColor}
      initials={token.logoInitials}
      size={size === 'sm' ? 24 : 36}
    />
  );
}

function formatAmount(amount: number, decimals: number, symbol: string): string {
  const formatted = decimals === 0
    ? amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  return `${formatted} ${symbol}`;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

export default function SwapConfirmSheet({
  isOpen, onClose, onConfirm, quote, fromToken, toToken, fromAmount, slippage, isConfirming,
}: Props) {
  if (!isOpen) return null;

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const fromValueUsd = fromAmountNum * fromToken.usdPrice;
  const toValueUsd = quote.askAmount * toToken.usdPrice;
  const exchangeRateDisplay = toToken.decimals === 0
    ? `1 ${fromToken.symbol} = ${quote.exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${toToken.symbol}`
    : `1 ${fromToken.symbol} = ${quote.exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })} ${toToken.symbol}`;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end">
      <div className="sheet-overlay absolute inset-0" onClick={isConfirming ? undefined : onClose} />

      <div
        className="sheet-content relative rounded-t-[20px] p-5 max-h-[92vh] overflow-y-auto max-w-lg mx-auto w-full"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border-default)' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-700 text-primary-app" style={{ fontWeight: 700 }}>Confirm Swap</h2>
          {!isConfirming && (
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-70"
              style={{ background: 'var(--bg-surface)' }}>
              <X size={16} className="text-secondary" />
            </button>
          )}
        </div>

        {/* Trade visualisation */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          {/* From */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TokenAvatar token={fromToken} />
              <div>
                <p className="text-base font-700 text-primary-app" style={{ fontWeight: 700 }}>
                  {parseFloat(fromAmount).toLocaleString('en-US', { maximumFractionDigits: 6 })} {fromToken.symbol}
                </p>
                <p className="text-xs text-tertiary">≈ ${fromValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <span className="text-xs font-600 text-secondary border border-default px-2.5 py-1 rounded-full"
              style={{ background: 'var(--bg-card)', fontWeight: 600 }}>
              Pay
            </span>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div className="w-7 h-7 rounded-full border border-default flex items-center justify-center"
              style={{ background: 'var(--bg-card)' }}>
              <ArrowRight size={13} className="text-secondary" />
            </div>
          </div>

          {/* To */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TokenAvatar token={toToken} />
              <div>
                <p className="text-base font-700 text-primary-app" style={{ fontWeight: 700 }}>
                  {formatAmount(quote.askAmount, toToken.decimals, toToken.symbol)}
                </p>
                <p className="text-xs text-tertiary">≈ ${toValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <span className="text-xs font-600 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(22,163,74,0.1)', color: '#4ade80', fontWeight: 600 }}>
              Receive
            </span>
          </div>
        </div>

        {/* Trade details */}
        <div className="card-base !p-4 mb-5 space-y-0">
          <DetailRow label="Exchange Rate" value={exchangeRateDisplay}
            tooltip="Estimated rate at time of quote. Final rate may differ slightly." />
          <div className="flex items-center justify-between py-2.5 border-b border-default">
            <span className="text-sm text-secondary">Price Impact</span>
            <PriceImpactBadge impact={quote.priceImpact} />
          </div>
          <DetailRow label="Minimum Received" value={formatAmount(quote.minAskAmount, toToken.decimals, toToken.symbol)}
            tooltip={`Minimum amount after ${slippage}% slippage tolerance.`} />
          <DetailRow label="Protocol Fee (0.3%)" value={`$${quote.fee.toFixed(4)}`}
            tooltip="Protocol fee paid to liquidity providers." />
          <DetailRow label="Slippage Tolerance" value={`${slippage}%`} />
          <DetailRow label="Route" value={quote.routePath} />
          <DetailRow label="Pool" value={truncateAddress(quote.poolAddress)} />
        </div>

        {/* High impact warning */}
        {quote.priceImpact >= 3 && (
          <div className="flex items-start gap-2.5 rounded-xl p-3.5 mb-5"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-700 text-orange-500" style={{ fontWeight: 700 }}>High Price Impact</p>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed">
                This trade will move the price by {quote.priceImpact.toFixed(2)}%.
                Consider splitting your trade into smaller amounts.
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} disabled={isConfirming}
            className={`btn-secondary !py-3.5 ${isConfirming ? 'opacity-40 pointer-events-none' : ''}`}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isConfirming} className="btn-primary !py-3.5">
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Confirming…
              </span>
            ) : 'Confirm Swap'}
          </button>
        </div>

        <p className="text-xs text-center text-tertiary mt-3 leading-relaxed">
          Quote valid ~30 seconds. Prices may vary.
        </p>
      </div>
    </div>
  );
}
