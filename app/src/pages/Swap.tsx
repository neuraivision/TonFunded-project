import { useState, useEffect, useRef } from 'react';
import {
  ArrowDownUp,
  ChevronDown,
  RefreshCw,
  XCircle,
  Loader2,
  Clock,
  Zap,
  Info,
} from 'lucide-react';
import { useSwapStore, STONFI_TOKENS } from '@/stores/swapStore';
import TokenPickerSheet from '@/components/TokenPickerSheet';
import SwapConfirmSheet from '@/components/SwapConfirmSheet';
import SwapHistoryCard from '@/components/SwapHistoryCard';
import type { SwapToken } from '@/types';

// ─── Token avatar ─────────────────────────────────────────────────────────────

function TokenAvatar({ token, size = 'sm' }: { token: SwapToken; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[10px]';
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: token.logoColor }}
    >
      {token.logoInitials}
    </div>
  );
}

// ─── Token selector button ────────────────────────────────────────────────────

function TokenSelectorButton({
  token,
  onClick,
}: {
  token: SwapToken;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-white border border-default rounded-xl px-3 py-2 active:bg-gray-50 transition-colors flex-shrink-0"
    >
      <TokenAvatar token={token} size="md" />
      <span className="text-sm font-bold text-primary-app">{token.symbol}</span>
      <ChevronDown size={14} className="text-tertiary" />
    </button>
  );
}

// ─── Slippage selector row ────────────────────────────────────────────────────

const SLIPPAGE_PRESETS = [0.5, 1, 2, 5] as const;

function SlippageRow({
  slippage,
  onSet,
}: {
  slippage: number;
  onSet: (v: number) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handleCustomBlur = () => {
    const num = parseFloat(customVal);
    if (!isNaN(num) && num > 0 && num <= 50) {
      onSet(num);
    } else {
      setCustomVal('');
    }
    setShowCustom(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-tertiary flex-shrink-0">Slippage</span>
      <div className="flex items-center gap-1.5 flex-1">
        {SLIPPAGE_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              onSet(p);
              setShowCustom(false);
              setCustomVal('');
            }}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
              slippage === p && !showCustom
                ? 'bg-accent-app text-white'
                : 'bg-gray-100 text-secondary active:bg-gray-200'
            }`}
          >
            {p}%
          </button>
        ))}
        {showCustom ? (
          <input
            type="number"
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            onBlur={handleCustomBlur}
            autoFocus
            placeholder="0.0"
            className="w-16 text-xs text-center border border-accent-app rounded-full px-2 py-1 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
              !SLIPPAGE_PRESETS.includes(slippage as (typeof SLIPPAGE_PRESETS)[number])
                ? 'bg-accent-app text-white'
                : 'bg-gray-100 text-secondary active:bg-gray-200'
            }`}
          >
            {!SLIPPAGE_PRESETS.includes(slippage as (typeof SLIPPAGE_PRESETS)[number])
              ? `${slippage}%`
              : 'Custom'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Amount input box ─────────────────────────────────────────────────────────

function AmountBox({
  label,
  token,
  amount,
  isEditable,
  isLoading,
  onChange,
  onPickToken,
}: {
  label: string;
  token: SwapToken;
  amount: string;
  isEditable: boolean;
  isLoading: boolean;
  onChange?: (v: string) => void;
  onPickToken: () => void;
}) {
  const balanceDisplay =
    token.decimals === 0
      ? token.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 });

  const usdValue =
    amount && !isNaN(parseFloat(amount))
      ? (parseFloat(amount) * token.usdPrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-tertiary">{label}</span>
        <span className="text-xs text-tertiary">
          Balance:{' '}
          <span className="font-semibold text-secondary">
            {balanceDisplay} {token.symbol}
          </span>
        </span>
      </div>

      {/* Input + token selector */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {isEditable ? (
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-bold text-primary-app bg-transparent border-none outline-none placeholder:text-gray-300"
            />
          ) : (
            <div className="text-2xl font-bold text-primary-app min-h-[36px] flex items-center">
              {isLoading ? (
                <Loader2 size={22} className="text-tertiary animate-spin" />
              ) : amount ? (
                <span>{amount}</span>
              ) : (
                <span className="text-gray-300">0.00</span>
              )}
            </div>
          )}
          {usdValue && !isLoading && (
            <p className="text-xs text-tertiary mt-0.5">≈ ${usdValue}</p>
          )}
        </div>
        <TokenSelectorButton token={token} onClick={onPickToken} />
      </div>

      {/* Quick-fill buttons — from side only */}
      {isEditable && (
        <div className="flex items-center gap-1.5 mt-3">
          {[
            { label: '25%', pct: 0.25 },
            { label: '50%', pct: 0.5 },
            { label: '75%', pct: 0.75 },
            { label: 'MAX', pct: 1 },
          ].map(({ label: btnLabel, pct }) => (
            <button
              key={btnLabel}
              onClick={() => {
                const fill = token.balance * pct;
                const formatted =
                  token.decimals === 0
                    ? Math.floor(fill).toString()
                    : parseFloat(fill.toFixed(6)).toString();
                onChange?.(formatted);
              }}
              className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-white border border-default text-secondary active:bg-gray-100 transition-colors"
            >
              {btnLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quote details row ────────────────────────────────────────────────────────

function QuoteInfoRow({
  fromToken,
  toToken,
  exchangeRate,
  priceImpact,
  fee,
  routePath,
}: {
  fromToken: SwapToken;
  toToken: SwapToken;
  exchangeRate: number;
  priceImpact: number;
  fee: number;
  routePath: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const rateDisplay =
    toToken.decimals === 0
      ? `1 ${fromToken.symbol} = ${exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${toToken.symbol}`
      : `1 ${fromToken.symbol} = ${exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })} ${toToken.symbol}`;

  const impactColor =
    priceImpact < 1
      ? 'text-green-600'
      : priceImpact < 3
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-xs text-secondary">{rateDisplay}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${impactColor}`}>
            {priceImpact.toFixed(2)}% impact
          </span>
          <Info size={12} className="text-tertiary" />
        </div>
      </button>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-default space-y-1.5 page-enter">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-tertiary">Route</span>
            <span className="text-[11px] font-medium text-secondary">{routePath}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-tertiary">Protocol Fee</span>
            <span className="text-[11px] font-medium text-secondary">${fee.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Swap() {
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    quote,
    status,
    errorMessage,
    swapHistory,
    availableTokens,
    setFromToken,
    setToToken,
    setFromAmount,
    flipTokens,
    setSlippage,
    fetchQuote,
    executeSwap,
    resetSwap,
    clearError,
  } = useSwapStore();

  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Debounce quote fetch: fires 800 ms after user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchQuote();
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fromAmount, fromToken.symbol, toToken.symbol, slippage, fetchQuote]);

  const handleConfirmSwap = async () => {
    await executeSwap();
    setConfirmOpen(false);
  };

  const isQuoting = status === 'quoting';
  const isReady = status === 'ready' && quote !== null;
  const isConfirming = status === 'confirming';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const canSwap = isReady && !isConfirming;

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="px-4 pt-16 pb-8 flex flex-col items-center justify-center min-h-[60vh] page-enter">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <Zap size={36} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-primary-app mb-1">Swap Executed</h2>
        <p className="text-sm text-secondary text-center max-w-[260px]">
          Your transaction has been confirmed on the TON network.
        </p>
        <div className="mt-4 bg-green-50 rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-green-700 font-medium">Balances updated</p>
          <p className="text-sm font-bold text-green-700 mt-1">
            {fromToken.symbol} → {toToken.symbol}
          </p>
        </div>
        <p className="text-xs text-tertiary mt-4">Returning to swap form…</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 page-enter">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-secondary">Spot trading · TON network</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="w-9 h-9 rounded-full bg-white border border-default flex items-center justify-center active:bg-gray-50"
          >
            <Clock size={16} className="text-secondary" />
          </button>
          <button
            onClick={resetSwap}
            className="w-9 h-9 rounded-full bg-white border border-default flex items-center justify-center active:bg-gray-50"
          >
            <RefreshCw size={16} className="text-secondary" />
          </button>
        </div>
      </div>

      {/* ── Swap History Panel ──────────────────────────────────────────────── */}
      {showHistory && (
        <div className="mb-5 space-y-3 page-enter">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary-app">Recent Swaps</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-accent-app font-medium"
            >
              Hide
            </button>
          </div>
          {swapHistory.length === 0 ? (
            <div className="card-base text-center py-8">
              <Clock size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-secondary">No swaps yet</p>
            </div>
          ) : (
            swapHistory.slice(0, 5).map((item) => (
              <SwapHistoryCard key={item.id} item={item} />
            ))
          )}
          {swapHistory.length > 5 && (
            <p className="text-xs text-center text-tertiary">
              Showing 5 of {swapHistory.length} swaps
            </p>
          )}
        </div>
      )}

      {/* ── Swap form card ──────────────────────────────────────────────────── */}
      <div className="card-base !p-4 space-y-2">
        {/* FROM */}
        <AmountBox
          label="You Pay"
          token={fromToken}
          amount={fromAmount}
          isEditable={true}
          isLoading={false}
          onChange={setFromAmount}
          onPickToken={() => setPickerOpen('from')}
        />

        {/* Flip */}
        <div className="flex justify-center relative z-10 -my-1">
          <button
            onClick={flipTokens}
            className="w-10 h-10 rounded-full bg-white border-2 border-default flex items-center justify-center active:rotate-180 transition-transform duration-300 shadow-sm"
          >
            <ArrowDownUp size={16} className="text-accent-app" />
          </button>
        </div>

        {/* TO */}
        <AmountBox
          label="You Receive"
          token={toToken}
          amount={toAmount}
          isEditable={false}
          isLoading={isQuoting}
          onChange={undefined}
          onPickToken={() => setPickerOpen('to')}
        />

        {/* Slippage */}
        <div className="pt-1">
          <SlippageRow slippage={slippage} onSet={setSlippage} />
        </div>

        {/* Quote details */}
        {isReady && quote && (
          <div className="page-enter">
            <QuoteInfoRow
              fromToken={fromToken}
              toToken={toToken}
              exchangeRate={quote.exchangeRate}
              priceImpact={quote.priceImpact}
              fee={quote.fee}
              routePath={quote.routePath}
            />
          </div>
        )}

        {/* Error */}
        {isError && errorMessage && (
          <div className="flex items-start gap-2.5 bg-red-50 rounded-xl p-3 page-enter">
            <XCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
            <button onClick={clearError} className="text-red-400 active:text-red-600 flex-shrink-0">
              <XCircle size={14} />
            </button>
          </div>
        )}

        {/* Quoting indicator */}
        {isQuoting && (
          <div className="flex items-center gap-2 px-1 page-enter">
            <Loader2 size={14} className="text-accent-app animate-spin" />
            <span className="text-xs text-secondary">Calculating best route…</span>
          </div>
        )}
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <div className="mt-4">
        {!fromAmount || parseFloat(fromAmount) <= 0 ? (
          <button disabled className="btn-primary opacity-40 pointer-events-none !py-4">
            Enter an Amount
          </button>
        ) : isQuoting ? (
          <button disabled className="btn-primary opacity-70 pointer-events-none !py-4">
            <Loader2 size={16} className="animate-spin" />
            Calculating Quote…
          </button>
        ) : canSwap ? (
          <button onClick={() => setConfirmOpen(true)} className="btn-primary !py-4">
            <Zap size={16} />
            Swap {fromToken.symbol} → {toToken.symbol}
          </button>
        ) : isError ? (
          <button
            onClick={() => {
              clearError();
              fetchQuote();
            }}
            className="btn-secondary !py-4"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        ) : (
          <button disabled className="btn-primary opacity-40 pointer-events-none !py-4">
            Enter an Amount
          </button>
        )}
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 mt-4 px-1">
        <Info size={12} className="text-tertiary flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-tertiary leading-relaxed">
          Swap execution is simulated within your challenge account. Live on-chain
          settlement activates upon reaching funded trader status.
        </p>
      </div>

      {/* ── Low-liquidity notice ────────────────────────────────────────────── */}
      <div className="mt-4 bg-amber-50 rounded-xl p-3.5 flex items-start gap-2.5">
        <Zap size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700">Low-Liquidity Tokens</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
            Newly launched Jettons with thin order books typically require 5%+ slippage
            tolerance. Set slippage appropriately to avoid failed transactions.
          </p>
        </div>
      </div>

      {/* ── Token Picker — FROM ──────────────────────────────────────────────── */}
      <TokenPickerSheet
        isOpen={pickerOpen === 'from'}
        onClose={() => setPickerOpen(null)}
        onSelect={(token) => {
          setFromToken(token);
          setPickerOpen(null);
        }}
        tokens={availableTokens}
        excludeSymbol={toToken.symbol}
        title="Select Token to Pay"
      />

      {/* ── Token Picker — TO ────────────────────────────────────────────────── */}
      <TokenPickerSheet
        isOpen={pickerOpen === 'to'}
        onClose={() => setPickerOpen(null)}
        onSelect={(token) => {
          setToToken(token);
          setPickerOpen(null);
        }}
        tokens={availableTokens}
        excludeSymbol={fromToken.symbol}
        title="Select Token to Receive"
      />

      {/* ── Confirm sheet ────────────────────────────────────────────────────── */}
      {confirmOpen && quote && (
        <SwapConfirmSheet
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSwap}
          quote={quote}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          slippage={slippage}
          isConfirming={isConfirming}
        />
      )}
    </div>
  );
}
