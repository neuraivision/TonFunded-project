import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Shield,
  Settings2,
  Target,
  AlertTriangle,
  X,
  CheckCircle2,
  Minus,
} from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import type { Position, RiskCheckResult } from '@/types';
import SlippageSettingsSheet from './SlippageSettingsSheet';
import RiskCheckModal from './RiskCheckModal';

interface Props {
  position: Position;
}

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
        className="font-number text-base font-700 transition-colors duration-300 leading-tight"
        style={{
          fontWeight: 700,
          color: flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171' : isProfit ? 'var(--text-success)' : 'var(--text-danger)',
        }}
      >
        {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
      </p>
      <p
        className="font-number text-xs"
        style={{ color: isProfit ? 'var(--text-success)' : 'var(--text-danger)' }}
      >
        {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
      </p>
    </div>
  );
}

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

  const minutesOpen = Math.floor(
    (Date.now() - new Date(position.openedAt).getTime()) / 60000,
  );
  const timeLabel =
    minutesOpen < 60
      ? `${minutesOpen}m`
      : `${Math.floor(minutesOpen / 60)}h ${minutesOpen % 60}m`;

  const handleRapidSell = (percent: number) => {
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
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Direction color bar */}
        <div
          className="h-0.5 w-full"
          style={{ background: position.direction === 'long' ? 'var(--gradient-up)' : 'var(--gradient-down)' }}
        />

        <div className="p-4 space-y-0">
          {/* Header row */}
          <div
            className="flex items-center justify-between cursor-pointer select-none pb-3"
            onClick={() => setExpanded((e) => !e)}
          >
            <div className="flex items-center gap-3">
              {/* Token avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg-accent-light)' }}
              >
                <span className="text-sm font-700 text-accent-app" style={{ fontWeight: 700 }}>
                  {position.tokenName.slice(0, 2)}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>
                    {position.tokenName}
                  </p>
                  <span
                    className="text-[10px] font-700 px-1.5 py-0.5 rounded-full uppercase"
                    style={{
                      background: position.direction === 'long' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                      color: position.direction === 'long' ? '#16a34a' : '#dc2626',
                      fontWeight: 700,
                    }}
                  >
                    {position.direction === 'long' ? (
                      <><TrendingUp size={8} className="inline mb-0.5 mr-0.5" />LONG</>
                    ) : (
                      <><TrendingDown size={8} className="inline mb-0.5 mr-0.5" />SHORT</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-tertiary">
                    {position.quantity.toLocaleString()} @ $
                    {position.entryPrice.toFixed(position.entryPrice < 1 ? 5 : 2)}
                  </p>
                  <span className="text-[10px] text-tertiary">·</span>
                  <p className="text-[10px] text-tertiary">{timeLabel}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LivePnL pnl={position.pnl} pnlPercent={position.pnlPercent} />
              <div className="text-tertiary ml-1">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>
          </div>

          {/* ── One-tap Trading Actions ─────────────────────────── */}
          <div className="flex gap-2 pt-1">
            {/* Close Full */}
            <button
              onClick={() => handleRapidSell(100)}
              className="trade-btn trade-btn-close flex-1"
            >
              <X size={13} />
              <span>Close Full</span>
            </button>

            {/* Close 50% */}
            <button
              onClick={() => handleRapidSell(50)}
              className="trade-btn trade-btn-half flex-1"
            >
              <Minus size={13} />
              <span>Close 50%</span>
            </button>

            {/* Take Profit */}
            <button
              onClick={() => position.takeProfit ? handleRapidSell(100) : null}
              className="trade-btn trade-btn-tp flex-1"
              style={!position.takeProfit ? { opacity: 0.5 } : {}}
            >
              <CheckCircle2 size={13} />
              <span>Take Profit</span>
            </button>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="pt-3 space-y-3" style={{ borderTop: '1px solid var(--border-default)', marginTop: '12px' }}>
              {/* Price details grid */}
              <div className="grid grid-cols-2 gap-3">
                <PriceRow label="Current Price" value={`$${position.currentPrice.toFixed(position.currentPrice < 1 ? 5 : 4)}`} />
                <PriceRow label="Entry Price" value={`$${position.entryPrice.toFixed(position.entryPrice < 1 ? 5 : 4)}`} />
                <PriceRow label="Quantity" value={position.quantity.toLocaleString()} />
                <PriceRow label="Notional Value" value={`$${(position.currentPrice * position.quantity).toFixed(2)}`} />
                {position.stopLoss && (
                  <PriceRow label="Stop Loss" value={`$${position.stopLoss.toFixed(5)}`} highlight="red" />
                )}
                {position.takeProfit && (
                  <PriceRow label="Take Profit" value={`$${position.takeProfit.toFixed(5)}`} highlight="green" />
                )}
                {position.breakevenSet && position.breakevenPrice && (
                  <PriceRow label="Breakeven" value={`$${position.breakevenPrice.toFixed(5)}`} highlight="blue" />
                )}
              </div>

              {/* Tools row */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSlippage(true)}
                  className="flex items-center gap-1.5 flex-1 py-2.5 px-3 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                  <Settings2 size={13} className="text-secondary" />
                  <span className="text-xs text-secondary">Slippage: </span>
                  <span className="text-xs font-700 text-primary-app" style={{ fontWeight: 700 }}>{position.slippage}%</span>
                </button>

                <button
                  onClick={() => canSetBreakeven && setBreakeven(position.id)}
                  disabled={!canSetBreakeven}
                  className="flex items-center gap-1.5 flex-1 py-2.5 px-3 rounded-xl transition-all"
                  style={
                    position.breakevenSet
                      ? { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', opacity: 0.7 }
                      : canSetBreakeven
                        ? { background: 'var(--bg-accent-light)', border: '1px solid var(--border-accent)' }
                        : { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', opacity: 0.4 }
                  }
                >
                  <Shield size={13} style={{ color: position.breakevenSet ? '#60a5fa' : canSetBreakeven ? '#4DB8FF' : 'var(--text-tertiary)' }} />
                  <span
                    className="text-xs font-700"
                    style={{ fontWeight: 700, color: position.breakevenSet ? '#60a5fa' : canSetBreakeven ? '#4DB8FF' : 'var(--text-tertiary)' }}
                  >
                    {position.breakevenSet ? 'BE Active' : 'Breakeven'}
                  </span>
                </button>

                <button
                  className="flex items-center justify-center w-11 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                  <Target size={15} className="text-accent-app" />
                </button>
              </div>

              {/* No SL warning */}
              {!isProfit && !position.stopLoss && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" />
                  <p className="text-xs" style={{ color: '#92400e' }}>
                    No stop-loss set — consider adding one or using Breakeven
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSlippage && (
        <SlippageSettingsSheet
          position={position}
          isOpen={showSlippage}
          onClose={() => setShowSlippage(false)}
        />
      )}

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

function PriceRow({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'red' | 'blue' }) {
  const valueColor =
    highlight === 'green' ? '#16a34a' :
    highlight === 'red' ? '#dc2626' :
    highlight === 'blue' ? '#3b82f6' :
    'var(--text-primary)';

  return (
    <div>
      <p className="text-[10px] text-tertiary uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-number text-sm font-600" style={{ color: valueColor, fontWeight: 600 }}>{value}</p>
    </div>
  );
}
