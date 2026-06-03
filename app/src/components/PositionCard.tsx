import { useState } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import type { Position } from '@/types';
import {
  ChevronDown, ChevronUp, TrendingUp, TrendingDown,
  Zap, Target, AlertTriangle,
} from 'lucide-react';
import RiskCheckModal from './RiskCheckModal';
import SlippageSettingsSheet from './SlippageSettingsSheet';

interface Props { position: Position; }

export default function PositionCard({ position }: Props) {
  const { partialClose, closePosition, setBreakeven, runRiskCheck } = useTradingStore();
  const [expanded, setExpanded] = useState(false);
  const [riskCheck, setRiskCheck] = useState<{ percent: number; result: ReturnType<typeof runRiskCheck> } | null>(null);
  const [showSlippage, setShowSlippage] = useState(false);

  const isProfit = position.pnl >= 0;

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
      <div className={`card !p-0 overflow-hidden border-l-[3px] ${isProfit ? 'border-l-green-500' : 'border-l-red-500'}`}>

        {/* Header row */}
        <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-accent-app">{position.tokenName.slice(0,2)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-primary-app">{position.tokenName}</span>
              <span className={`badge text-[9px] ${position.direction === 'long' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                {position.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
              </span>
              {position.breakevenSet && (
                <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[9px]">BE</span>
              )}
            </div>
            <p className="text-[11px] text-tertiary mt-0.5">{position.tokenPair} · {formatTime(position.openedAt)}</p>
          </div>

          <div className="text-right">
            <p className={`text-base font-bold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}${Math.abs(position.pnl).toFixed(2)}
            </p>
            <p className={`text-[11px] font-semibold ${isProfit ? 'text-green-500' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{position.pnlPercent.toFixed(2)}%
            </p>
          </div>

          <button onClick={() => setExpanded(!expanded)} className="text-tertiary ml-1 active:opacity-60">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Breakeven warning */}
        {!position.breakevenSet && position.pnlPercent > 3 && (
          <div className="mx-4 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
            <span className="text-[11px] text-amber-700 dark:text-amber-400">Consider setting breakeven to lock profits</span>
            <button onClick={() => setBreakeven(position.id)} className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-800/30 px-2 py-0.5 rounded-full">
              Set BE
            </button>
          </div>
        )}

        {/* Quick sell buttons */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-3.5">
          {[
            { label: '25%',  pct: 25,  cls: 'bg-gray-100 dark:bg-white/8 text-secondary hover:bg-gray-200' },
            { label: '50%',  pct: 50,  cls: 'bg-gray-100 dark:bg-white/8 text-secondary hover:bg-gray-200' },
            { label: '75%',  pct: 75,  cls: 'bg-gray-100 dark:bg-white/8 text-secondary hover:bg-gray-200' },
            { label: 'SELL', pct: 100, cls: 'bg-red-500 text-white hover:bg-red-600 font-bold' },
          ].map(({ label, pct, cls }) => (
            <button
              key={label}
              onClick={() => handleClose(pct)}
              className={`flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-xl transition-all active:scale-95 ${cls}`}
            >
              {label === 'SELL' && <Zap size={11} />}
              {label}
            </button>
          ))}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-default px-4 py-3 space-y-2.5 bg-muted-app/40">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { label: 'Entry Price',   val: `$${position.entryPrice.toFixed(6)}` },
                { label: 'Current Price', val: `$${position.currentPrice.toFixed(6)}` },
                { label: 'Quantity',      val: position.quantity.toLocaleString() },
                { label: 'Leverage',      val: `${position.leverage}x` },
                { label: 'Slippage',      val: `${position.slippage}%` },
                { label: 'Breakeven',     val: position.breakevenPrice ? `$${position.breakevenPrice.toFixed(6)}` : '—' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-tertiary">{label}</span>
                  <span className="text-[11px] font-semibold text-primary-app">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowSlippage(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border border-default bg-card-app text-secondary active:opacity-70"
              >
                Slippage
              </button>
              <button
                onClick={() => setBreakeven(position.id)}
                disabled={position.breakevenSet}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border border-accent-app/40 bg-accent-light text-accent-app active:opacity-70 disabled:opacity-40"
              >
                <Target size={12} />
                {position.breakevenSet ? 'BE Set' : 'Set Breakeven'}
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
          position={position}
          onConfirm={confirmClose}
          onCancel={() => setRiskCheck(null)}
        />
      )}

      {showSlippage && (
        <SlippageSettingsSheet
          positionId={position.id}
          currentSlippage={position.slippage}
          onClose={() => setShowSlippage(false)}
        />
      )}
    </>
  );
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}
