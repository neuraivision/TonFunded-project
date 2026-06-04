import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Settings2,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import type { Position, RiskCheckResult } from '@/types';
import SlippageSettingsSheet from './SlippageSettingsSheet';
import RiskCheckModal from './RiskCheckModal';

interface Props {
  position: Position;
}

// ── Animated P&L number that pulses on change ─────────────────────────────

function LivePnL({ pnl, pnlPercent }: { pnl: number; pnlPercent: number }) {
  const isProfit = pnl >= 0;
  const prevPnl = useRef(pnl);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (pnl === prevPnl.current) return;
    setFlash(pnl > prevPnl.current ? 'up' : 'down');
    prevPnl.current = pnl;
    const timer = setTimeout(() => setFlash(null), 500);
    return () => clearTimeout(timer);
  }, [pnl]);

  return (
    <div className="text-right">
      <p
        className={`text-base font-bold transition-colors duration-300 ${
          flash === 'up'
            ? 'text-green-400'
            : flash === 'down'
              ? 'text-red-400'
              : isProfit
                ? 'text-success-app'
                : 'text-danger-app'
        }`}
      >
        {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
      </p>
      <p
        className={`text-xs font-medium ${
          isProfit ? 'text-success-app' : 'text-danger-app'
        }`}
      >
        {isProfit ? '+' : ''}
        {pnlPercent.toFixed(2)}%
      </p>
    </div>
  );
}

// ── Rapid sell button ─────────────────────────────────────────────────────

function RapidSellButton({
  label,
  percent,
  onPress,
  isClose,
}: {
  label: string;
  percent: number;
  onPress: () => void;
  isClose?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className={`flex-1 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform select-none ${
        isClose
          ? 'bg-red-500 text-white'
          : 'bg-gray-100 text-gray-700 active:bg-gray-200'
      }`}
    >
      <Zap size={10} className="inline mr-0.5 mb-0.5" />
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function PositionCard({ position }: Props) {
  const { partialClose, closePosition, setBreakeven, runRiskCheck } = useTradingStore();

  const [expanded, setExpanded] = useState(false);
  const [showSlippage, setShowSlippage] = useState(false);
  const [pendingClose, setPendingClose] = useState<{
    percent: number;
    riskResult: RiskCheckResult;
  } | null>(null);

  const isProfit = position.pnl >= 0;
  const canSetBreakeven = isProfit && !position.breakevenSet;

  // Time open
  const minutesOpen = Math.floor(
    (Date.now() - new Date(position.openedAt).getTime()) / 60000,
  );
  const timeLabel =
    minutesOpen < 60
      ? `${minutesOpen}m`
      : `${Math.floor(minutesOpen / 60)}h ${minutesOpen % 60}m`;

  // Handle rapid sell with risk check gate
  const handleRapidSell = (percent: number) => {
    const estimatedClose = Math.abs(position.pnl) * (percent / 100);
    const result = runRiskCheck(position.id, percent);
    setPendingClose({ percent, riskResult: result });
  };

  const confirmSell = () => {
    if (!pendingClose) return;
    if (pendingClose.percent >= 100) {
      closePosition(position.id);
    } else {
      partialClose(position.id, pendingClose.percent);
    }
    setPendingClose(null);
  };

  return (
    <>
      <div className="card-base space-y-0 overflow-hidden">
        {/* ── Header row ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between cursor-pointer select-none pb-3"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex items-center gap-3">
            {/* Token avatar */}
            <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-accent-app">
                {position.tokenName.slice(0, 2)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-primary-app">
                  {position.tokenName}
                </p>
                {/* Direction badge */}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    position.direction === 'long'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  {position.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                </span>
                {/* Breakeven badge */}
                {position.breakevenSet && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    BE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-secondary">{position.tokenPair}</p>
                <span className="text-[10px] text-tertiary">· {timeLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LivePnL pnl={position.pnl} pnlPercent={position.pnlPercent} />
            <div className="text-tertiary">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* ── Rapid sell strip — always visible ──────────────────────────── */}
        <div className="flex gap-1.5 pt-1 pb-3 border-t border-default">
          <RapidSellButton
            label="25%"
            percent={25}
            onPress={() => handleRapidSell(25)}
          />
          <RapidSellButton
            label="50%"
            percent={50}
            onPress={() => handleRapidSell(50)}
          />
          <RapidSellButton
            label="75%"
            percent={75}
            onPress={() => handleRapidSell(75)}
          />
          <RapidSellButton
            label="SELL ALL"
            percent={100}
            onPress={() => handleRapidSell(100)}
            isClose
          />
        </div>

        {/* ── Expanded details ────────────────────────────────────────────── */}
        {expanded && (
          <div className="border-t border-default pt-3 space-y-3 page-enter">
            {/* Price grid */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <PriceRow label="Entry Price" value={`$${position.entryPrice.toFixed(5)}`} />
              <PriceRow
                label="Current Price"
                value={`$${position.currentPrice.toFixed(5)}`}
                highlight={isProfit ? 'green' : 'red'}
              />
              <PriceRow
                label="Position Size"
                value={`${position.quantity.toLocaleString()} ${position.tokenName}`}
              />
              <PriceRow
                label="Notional Value"
                value={`$${(position.currentPrice * position.quantity).toFixed(2)}`}
              />
              {position.stopLoss && (
                <PriceRow
                  label="Stop Loss"
                  value={`$${position.stopLoss.toFixed(5)}`}
                  highlight="red"
                />
              )}
              {position.takeProfit && (
                <PriceRow
                  label="Take Profit"
                  value={`$${position.takeProfit.toFixed(5)}`}
                  highlight="green"
                />
              )}
              {position.breakevenSet && position.breakevenPrice && (
                <PriceRow
                  label="Breakeven"
                  value={`$${position.breakevenPrice.toFixed(5)}`}
                  highlight="blue"
                />
              )}
            </div>

            {/* Slippage + Breakeven row */}
            <div className="flex gap-2 pt-1">
              {/* Slippage button */}
              <button
                onClick={() => setShowSlippage(true)}
                className="flex items-center gap-1.5 flex-1 py-2.5 px-3 rounded-xl border border-default bg-white active:bg-gray-50 transition-colors"
              >
                <Settings2 size={14} className="text-secondary" />
                <span className="text-xs font-medium text-secondary">
                  Slippage:
                </span>
                <span className="text-xs font-bold text-primary-app">
                  {position.slippage}%
                </span>
              </button>

              {/* Breakeven button */}
              <button
                onClick={() => canSetBreakeven && setBreakeven(position.id)}
                disabled={!canSetBreakeven}
                className={`flex items-center gap-1.5 flex-1 py-2.5 px-3 rounded-xl border transition-all ${
                  position.breakevenSet
                    ? 'border-blue-200 bg-blue-50 opacity-70'
                    : canSetBreakeven
                      ? 'border-accent-app bg-accent-light active:bg-blue-100'
                      : 'border-default bg-white opacity-40'
                }`}
              >
                <Shield
                  size={14}
                  className={
                    position.breakevenSet
                      ? 'text-blue-500'
                      : canSetBreakeven
                        ? 'text-accent-app'
                        : 'text-tertiary'
                  }
                />
                <span
                  className={`text-xs font-bold ${
                    position.breakevenSet
                      ? 'text-blue-500'
                      : canSetBreakeven
                        ? 'text-accent-app'
                        : 'text-tertiary'
                  }`}
                >
                  {position.breakevenSet ? 'BE Active' : 'Breakeven'}
                </span>
              </button>

              {/* Target button (placeholder for TP sheet) */}
              <button
                className="flex items-center justify-center w-11 rounded-xl border border-default bg-white active:bg-gray-50 transition-colors"
              >
                <Target size={16} className="text-accent-app" />
              </button>
            </div>

            {/* Warning if in loss and no SL set */}
            {!isProfit && !position.stopLoss && (
              <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  No stop-loss set — consider using Breakeven or adding a manual SL
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Slippage sheet ──────────────────────────────────────────────── */}
      {showSlippage && (
        <SlippageSettingsSheet
          position={position}
          isOpen={showSlippage}
          onClose={() => setShowSlippage(false)}
        />
      )}

      {/* ── Risk check modal ────────────────────────────────────────────── */}
      {pendingClose && (
        <RiskCheckModal
          result={pendingClose.riskResult}
          tokenName={position.tokenName}
          closePercent={pendingClose.percent}
          estimatedPnl={(position.pnl * pendingClose.percent) / 100}
          onConfirm={confirmSell}
          onCancel={() => setPendingClose(null)}
        />
      )}
    </>
  );
}

// ── Helper sub-component ──────────────────────────────────────────────────

function PriceRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'red' | 'blue';
}) {
  const valueColor =
    highlight === 'green'
      ? 'text-green-600'
      : highlight === 'red'
        ? 'text-red-500'
        : highlight === 'blue'
          ? 'text-blue-500'
          : 'text-primary-app';

  return (
    <div>
      <p className="text-[11px] text-tertiary">{label}</p>
      <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
