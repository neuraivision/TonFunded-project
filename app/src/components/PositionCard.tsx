import { useState } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import type { Position } from '@/types';
import {
  ChevronDown, ChevronUp, Target, AlertTriangle,
  Zap, TrendingUp, TrendingDown, Clock,
} from 'lucide-react';
import RiskCheckModal from './RiskCheckModal';
import SlippageSettingsSheet from './SlippageSettingsSheet';

interface Props { position: Position; }

function formatAge(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m/60)}h ${m%60}m`;
}

export default function PositionCard({ position }: Props) {
  const { partialClose, closePosition, setBreakeven, runRiskCheck } = useTradingStore();
  const [expanded, setExpanded] = useState(false);
  const [riskCheck, setRiskCheck] = useState<{ percent: number; result: ReturnType<typeof runRiskCheck> } | null>(null);
  const [showSlippage, setShowSlippage] = useState(false);

  const isProfit = position.pnl >= 0;
  const pnlColor = isProfit ? 'text-green-600' : 'text-red-500';
  const borderColor = isProfit ? 'border-l-green-500' : 'border-l-red-500';

  const handleClose = (percent: number) => {
    const result = runRiskCheck(position.id, percent);
    setRiskCheck({ percent, result });
  };

  const confirmClose = () => {
    if (!riskCheck) return;
    if (riskCheck.percent >= 100) closePosition(position.id);
    else partialClose(position.id, riskCheck.percent);
    setRiskCheck(null);
  };

  return (
    <>
      <div className={`card !p-0 overflow-visible border-l-[3px] ${borderColor}`}>

        {/* ── Main header row ─────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
          {/* Token avatar */}
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-accent-app">{position.tokenName.slice(0,2)}</span>
          </div>

          {/* Token info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-primary-app">{position.tokenName}</span>
              <span className={`badge text-[9px] font-bold ${position.direction === 'long' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                {position.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
              </span>
              {position.breakevenSet && (
                <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[9px]">BE ✓</span>
              )}
              {position.stopLoss && (
                <span className="badge bg-orange-50 dark:bg-orange-900/20 text-orange-500 text-[9px]">SL</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-tertiary">{position.tokenPair}</span>
              <span className="text-tertiary text-[10px]">·</span>
              <div className="flex items-center gap-0.5">
                <Clock size={9} className="text-tertiary" />
                <span className="text-[11px] text-tertiary">{formatAge(position.openedAt)}</span>
              </div>
            </div>
          </div>

          {/* P&L */}
          <div className="text-right">
            <p className={`text-base font-bold ${pnlColor}`}>
              {isProfit ? '+' : ''}${Math.abs(position.pnl).toFixed(2)}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {isProfit ? <TrendingUp size={10} className="text-green-500" /> : <TrendingDown size={10} className="text-red-400" />}
              <p className={`text-[11px] font-semibold ${isProfit ? 'text-green-500' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{position.pnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <button onClick={() => setExpanded(!expanded)} className="text-tertiary active:opacity-60 ml-0.5 flex-shrink-0">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {/* ── Price row ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-tertiary">Entry: <span className="font-semibold text-primary-app">${position.entryPrice.toFixed(5)}</span></span>
            <span className="text-tertiary">Now: <span className={`font-semibold ${pnlColor}`}>${position.currentPrice.toFixed(5)}</span></span>
          </div>
          <span className="text-[11px] text-tertiary">×{position.quantity.toLocaleString()}</span>
        </div>

        {/* ── Breakeven warning ───────────────────────────────── */}
        {!position.breakevenSet && position.pnlPercent >= 3 && (
          <div className="mx-4 mb-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />
            <span className="text-[11px] text-amber-700 dark:text-amber-400 flex-1">Up {position.pnlPercent.toFixed(1)}% — protect profits</span>
            <button
              onClick={() => setBreakeven(position.id)}
              className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-800/30 px-2.5 py-1 rounded-lg active:opacity-70 flex-shrink-0"
            >
              Set BE
            </button>
          </div>
        )}

        {/* ── One-tap action buttons ──────────────────────────── */}
        <div className="grid grid-cols-4 gap-1.5 px-4 pb-3.5">
          <button
            onClick={() => handleClose(25)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-gray-100 dark:bg-white/8 active:bg-gray-200 dark:active:bg-white/15 active:scale-95 transition-all"
          >
            <Zap size={11} className="text-secondary" />
            <span className="text-[10px] font-bold text-secondary">25%</span>
          </button>
          <button
            onClick={() => handleClose(50)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-gray-100 dark:bg-white/8 active:bg-gray-200 dark:active:bg-white/15 active:scale-95 transition-all"
          >
            <Zap size={11} className="text-secondary" />
            <span className="text-[10px] font-bold text-secondary">50%</span>
          </button>
          <button
            onClick={() => handleClose(75)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-gray-100 dark:bg-white/8 active:bg-gray-200 dark:active:bg-white/15 active:scale-95 transition-all"
          >
            <Zap size={11} className="text-secondary" />
            <span className="text-[10px] font-bold text-secondary">75%</span>
          </button>
          <button
            onClick={() => handleClose(100)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-red-500 active:bg-red-600 active:scale-95 transition-all shadow-sm"
          >
            <Zap size={11} className="text-white" />
            <span className="text-[10px] font-bold text-white">SELL</span>
          </button>
        </div>

        {/* ── Expanded detail panel ───────────────────────────── */}
        {expanded && (
          <div className="border-t border-default px-4 py-3 space-y-3 bg-muted-app/30">
            {/* Full price grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { label: 'Entry Price',    val: `$${position.entryPrice.toFixed(6)}` },
                { label: 'Current Price',  val: `$${position.currentPrice.toFixed(6)}` },
                { label: 'Quantity',       val: position.quantity.toLocaleString() },
                { label: 'Leverage',       val: `${position.leverage}x` },
                { label: 'Slippage',       val: `${position.slippage}%` },
                { label: 'Breakeven',      val: position.breakevenPrice ? `$${position.breakevenPrice.toFixed(6)}` : 'Not set' },
                { label: 'Stop Loss',      val: position.stopLoss ? `$${position.stopLoss.toFixed(6)}` : 'Not set' },
                { label: 'Take Profit',    val: position.takeProfit ? `$${position.takeProfit.toFixed(6)}` : 'Not set' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-default/50 last:border-0">
                  <span className="text-[11px] text-tertiary">{label}</span>
                  <span className="text-[11px] font-semibold text-primary-app">{val}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowSlippage(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border border-default bg-card-app text-secondary active:opacity-70"
              >
                Slippage {position.slippage}%
              </button>
              <button
                onClick={() => !position.breakevenSet && setBreakeven(position.id)}
                disabled={position.breakevenSet}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl bg-accent-light border border-accent-app/30 text-accent-app active:opacity-70 disabled:opacity-40"
              >
                <Target size={12} />
                {position.breakevenSet ? 'BE Active' : 'Set Breakeven'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {riskCheck && (
        <RiskCheckModal
          result={riskCheck.result}
          closePercent={riskCheck.percent}
          tokenName={position.tokenName}
          estimatedPnl={position.pnl * (riskCheck.percent / 100)}
          onConfirm={confirmClose}
          onCancel={() => setRiskCheck(null)}
        />
      )}
      {showSlippage && (
        <SlippageSettingsSheet
          position={position}
          isOpen={showSlippage}
          onClose={() => setShowSlippage(false)}
        />
      )}
    </>
  );
}
