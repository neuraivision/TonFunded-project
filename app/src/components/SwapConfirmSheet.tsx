import { AlertTriangle, CheckCircle, ArrowRight, X, Info } from 'lucide-react';
import type { SwapQuote, SwapToken } from '@/types';

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

function DetailRow({
  label,
  value,
  valueColor,
  tooltip,
}: {
  label: string;
  value: string;
  valueColor?: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-default last:border-0">
      <div className="flex items-center gap-1">
        <span className="text-sm text-secondary">{label}</span>
        {tooltip && (
          <span title={tooltip}><Info size={12} className="text-tertiary flex-shrink-0" /></span>
        )}
      </div>
      <span
        className={`text-sm font-semibold text-right break-all max-w-[55%] ${
          valueColor ?? 'text-primary-app'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PriceImpactBadge({ impact }: { impact: number }) {
  if (impact < 1) {
    return (
      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 text-xs font-semibold px-2 py-0.5 rounded-full">
        <CheckCircle size={11} />
        {impact.toFixed(2)}% — Low
      </span>
    );
  }
  if (impact < 3) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 text-xs font-semibold px-2 py-0.5 rounded-full">
        <AlertTriangle size={11} />
        {impact.toFixed(2)}% — Medium
      </span>
    );
  }
  if (impact < 8) {
    return (
      <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 text-xs font-semibold px-2 py-0.5 rounded-full">
        <AlertTriangle size={11} />
        {impact.toFixed(2)}% — High
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 text-xs font-bold px-2 py-0.5 rounded-full">
      <AlertTriangle size={11} />
      {impact.toFixed(2)}% — Very High
    </span>
  );
}

function TokenAvatar({
  token,
  size = 'md',
}: {
  token: SwapToken;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold`}
      style={{ backgroundColor: token.logoColor }}
    >
      {token.logoInitials}
    </div>
  );
}

function formatAmount(amount: number, decimals: number, symbol: string): string {
  const formatted =
    decimals === 0
      ? amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
  return `${formatted} ${symbol}`;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

export default function SwapConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  quote,
  fromToken,
  toToken,
  fromAmount,
  slippage,
  isConfirming,
}: Props) {
  if (!isOpen) return null;

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const fromValueUsd = fromAmountNum * fromToken.usdPrice;
  const toValueUsd = quote.askAmount * toToken.usdPrice;
  const exchangeRateDisplay =
    toToken.decimals === 0
      ? `1 ${fromToken.symbol} = ${quote.exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${toToken.symbol}`
      : `1 ${fromToken.symbol} = ${quote.exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })} ${toToken.symbol}`;

  const minReceivedDisplay = formatAmount(
    quote.minAskAmount,
    toToken.decimals,
    toToken.symbol,
  );

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="sheet-overlay absolute inset-0"
        onClick={isConfirming ? undefined : onClose}
      />

      {/* Sheet */}
      <div className="sheet-content relative bg-white rounded-t-[20px] p-5 max-h-[92vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-primary-app">Confirm Swap</h2>
          {!isConfirming && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
            >
              <X size={16} className="text-secondary" />
            </button>
          )}
        </div>

        {/* Trade visualisation */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-5">
          {/* From */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TokenAvatar token={fromToken} />
              <div>
                <p className="text-base font-bold text-primary-app">
                  {parseFloat(fromAmount).toLocaleString('en-US', {
                    maximumFractionDigits: 6,
                  })}{' '}
                  {fromToken.symbol}
                </p>
                <p className="text-xs text-tertiary">
                  ≈ ${fromValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-secondary bg-white border border-default px-2.5 py-1 rounded-full">
              Pay
            </span>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div className="w-7 h-7 rounded-full bg-white border border-default flex items-center justify-center">
              <ArrowRight size={13} className="text-secondary" />
            </div>
          </div>

          {/* To */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TokenAvatar token={toToken} />
              <div>
                <p className="text-base font-bold text-primary-app">
                  {formatAmount(quote.askAmount, toToken.decimals, toToken.symbol)}
                </p>
                <p className="text-xs text-tertiary">
                  ≈ ${toValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
              Receive
            </span>
          </div>
        </div>

        {/* Trade details */}
        <div className="card-base !p-0 overflow-hidden mb-5">
          <div className="px-4 pt-3">
            <DetailRow
              label="Exchange Rate"
              value={exchangeRateDisplay}
              tooltip="Estimated rate at time of quote. Final rate may differ slightly."
            />
            <DetailRow
              label="Price Impact"
              value=""
            />
          </div>
          {/* Price impact badge on its own line for proper display */}
          <div className="flex justify-between items-center px-4 pb-2.5 -mt-2 border-b border-default">
            <span className="text-sm text-secondary" />
            <PriceImpactBadge impact={quote.priceImpact} />
          </div>
          <div className="px-4 pb-3">
            <DetailRow
              label="Minimum Received"
              value={minReceivedDisplay}
              valueColor="text-primary-app"
              tooltip={`Minimum amount you'll receive after ${slippage}% slippage tolerance.`}
            />
            <DetailRow
              label="Protocol Fee (0.3%)"
              value={`$${quote.fee.toFixed(4)}`}
              tooltip="Protocol fee paid to liquidity providers."
            />
            <DetailRow
              label="Slippage Tolerance"
              value={`${slippage}%`}
            />
            <DetailRow
              label="Route"
              value={quote.routePath}
            />
            <DetailRow
              label="Pool"
              value={truncateAddress(quote.poolAddress)}
            />
          </div>
        </div>

        {/* High impact warning */}
        {quote.priceImpact >= 3 && (
          <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 rounded-xl p-3.5 mb-5">
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-700">High Price Impact</p>
              <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
                This trade will move the price by {quote.priceImpact.toFixed(2)}%.
                Consider splitting your trade into smaller amounts to reduce impact.
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className={`btn-secondary !py-3.5 ${isConfirming ? 'opacity-40 pointer-events-none' : ''}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="btn-primary !py-3.5 relative overflow-hidden"
          >
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming…
              </span>
            ) : (
              'Confirm Swap'
            )}
          </button>
        </div>

        <p className="text-xs text-center text-tertiary mt-3 leading-relaxed">
          Quote is valid for approximately 30 seconds. Prices may vary.
        </p>
      </div>
    </div>
  );
}
