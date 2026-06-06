import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Shield, Settings2, Target, AlertTriangle, X, CheckCircle2, Minus,
} from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import type { Position, RiskCheckResult } from '@/types';
import SlippageSettingsSheet from './SlippageSettingsSheet';
import RiskCheckModal from './RiskCheckModal';

interface Props { position: Position; }

function LivePnL({ pnl, pnlPercent }: { pnl: number; pnlPercent: number }) {
  const isProfit = pnl >= 0;
  const prevPnl = useRef(pnl);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (pnl === prevPnl.current) return;
    setFlash(pnl > prevPnl.current ? 'up' : 'down');
    prevPnl.current = pnl;
    const t = setTimeout(() => setFlash(null), 500);
    return () => clearTimeout(t);
  }, [pnl]);

  const color = flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171'
    : isProfit ? 'var(--ink-up)' : 'var(--ink-down)';

  return (
    <div className="text-right">
      <p className="font-number text-base leading-tight transition-colors duration-300" style={{ fontWeight: 700, color }}>
        {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
      </p>
      <p className="font-number text-[11px]" style={{ color }}>
        {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
      </p>
    </div>
  );
}

function PriceRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink-3)' }}>{label}</p>
      <p className="font-number text-[13px]" style={{ fontWeight: 600, color: color ?? 'var(--ink-1)' }}>{value}</p>
    </div>
  );
}

export default function PositionCard({ position }: Props) {
  const { partialClose, closePosition, setBreakeven, runRiskCheck } = useTradingStore();
  const [expanded, setExpanded] = useState(false);
  const [showSlippage, setShowSlippage] = useState(false);
  const [pendingClose, setPendingClose] = useState<{ percent: number; riskResult: RiskCheckResult } | null>(null);

  const isProfit = position.pnl >= 0;
  const canSetBreakeven = isProfit && !position.breakevenSet;
  const isLong = position.direction === 'long';

  const minutesOpen = Math.floor((Date.now() - new Date(position.openedAt).getTime()) / 60000);
  const timeLabel = minutesOpen < 60 ? `${minutesOpen}m` : `${Math.floor(minutesOpen / 60)}h ${minutesOpen % 60}m`;

  const handleAction = (percent: number) => {
    const result = runRiskCheck(position.id, percent);
    setPendingClose({ percent, riskResult: result });
  };

  const confirmSell = () => {
    if (!pendingClose) return;
    if (pendingClose.percent >= 100) closePosition(position.id);
    else partialClose(position.id, pendingClose.percent);
    setPendingClose(null);
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--line-card)', boxShadow: 'var(--sh-card)' }}
      >
        {/* Direction bar */}
        <div
          className="h-[3px] w-full"
          style={{ background: isLong ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#ef4444,#dc2626)' }}
        />

        <div className="p-4">
          {/* ── Header row ─────────────────────────────── */}
          <div
            className="flex items-center justify-between cursor-pointer select-none pb-3"
            onClick={() => setExpanded((e) => !e)}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(77,184,255,0.09)', border: '1px solid rgba(77,184,255,0.14)' }}
              >
                <span className="text-[13px] font-800" style={{ fontWeight: 800, color: 'var(--ton)' }}>
                  {position.tokenName.slice(0, 2)}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px]" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>
                    {position.tokenName}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{
                      fontWeight: 700,
                      background: isLong ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: isLong ? 'var(--ink-up)' : 'var(--ink-down)',
                    }}
                  >
                    {isLong ? '▲' : '▼'} {isLong ? 'LONG' : 'SHORT'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                    {position.quantity.toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--ink-3)', fontSize: '10px' }}>·</span>
                  <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>{timeLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LivePnL pnl={position.pnl} pnlPercent={position.pnlPercent} />
              {expanded ? <ChevronUp size={14} style={{ color: 'var(--ink-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--ink-3)' }} />}
            </div>
          </div>

          {/* ── ONE-TAP ACTION BUTTONS ──────────────────── */}
          <div className="flex gap-2">
            <button onClick={() => handleAction(100)} className="trade-btn trade-btn-close">
              <X size={13} strokeWidth={2.5} />
              <span>Close All</span>
            </button>
            <button onClick={() => handleAction(50)} className="trade-btn trade-btn-half">
              <Minus size={13} strokeWidth={2.5} />
              <span>Close 50%</span>
            </button>
            <button
              onClick={() => position.takeProfit ? handleAction(100) : null}
              className="trade-btn trade-btn-tp"
              style={{ opacity: position.takeProfit ? 1 : 0.45 }}
            >
              <CheckCircle2 size={13} strokeWidth={2.5} />
              <span>Take Profit</span>
            </button>
          </div>

          {/* ── Expanded detail ─────────────────────────── */}
          {expanded && (
            <div className="pt-4 mt-3 space-y-4" style={{ borderTop: '1px solid var(--line)' }}>
              {/* Price grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <PriceRow label="Entry Price"   value={`$${position.entryPrice.toFixed(position.entryPrice < 1 ? 5 : 4)}`} />
                <PriceRow label="Current Price" value={`$${position.currentPrice.toFixed(position.currentPrice < 1 ? 5 : 4)}`} />
                <PriceRow label="Quantity"       value={position.quantity.toLocaleString()} />
                <PriceRow label="Notional"       value={`$${(position.currentPrice * position.quantity).toFixed(2)}`} />
                {position.stopLoss   && <PriceRow label="Stop Loss"   value={`$${position.stopLoss.toFixed(5)}`}   color="var(--ink-down)" />}
                {position.takeProfit && <PriceRow label="Take Profit" value={`$${position.takeProfit.toFixed(5)}`} color="var(--ink-up)" />}
                {position.breakevenSet && position.breakevenPrice &&
                  <PriceRow label="Breakeven" value={`$${position.breakevenPrice.toFixed(5)}`} color="var(--ton)" />}
              </div>

              {/* Tools row */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSlippage(true)}
                  className="flex items-center gap-2 flex-1 py-2.5 px-3 rounded-xl active:opacity-70 transition-opacity"
                  style={{ background: 'var(--bg-sunken)', border: '1px solid var(--line)' }}
                >
                  <Settings2 size={13} style={{ color: 'var(--ink-2)' }} />
                  <span className="text-[12px]" style={{ color: 'var(--ink-2)' }}>
                    Slippage: <strong style={{ color: 'var(--ink-1)' }}>{position.slippage}%</strong>
                  </span>
                </button>

                <button
                  onClick={() => canSetBreakeven && setBreakeven(position.id)}
                  disabled={!canSetBreakeven && !position.breakevenSet}
                  className="flex items-center gap-2 flex-1 py-2.5 px-3 rounded-xl active:opacity-70 transition-opacity"
                  style={{
                    background: position.breakevenSet ? 'rgba(77,184,255,0.07)' : canSetBreakeven ? 'rgba(77,184,255,0.07)' : 'var(--bg-sunken)',
                    border: position.breakevenSet || canSetBreakeven ? '1px solid rgba(77,184,255,0.2)' : '1px solid var(--line)',
                    opacity: !canSetBreakeven && !position.breakevenSet ? 0.4 : 1,
                  }}
                >
                  <Shield size={13} style={{ color: position.breakevenSet || canSetBreakeven ? 'var(--ton)' : 'var(--ink-3)' }} />
                  <span className="text-[12px]" style={{ fontWeight: 600, color: position.breakevenSet || canSetBreakeven ? 'var(--ton)' : 'var(--ink-3)' }}>
                    {position.breakevenSet ? 'BE Active' : 'Breakeven'}
                  </span>
                </button>

                <button
                  className="w-10 flex-shrink-0 flex items-center justify-center rounded-xl active:opacity-70"
                  style={{ background: 'var(--bg-sunken)', border: '1px solid var(--line)' }}
                >
                  <Target size={15} style={{ color: 'var(--ton)' }} />
                </button>
              </div>

              {/* No SL warning */}
              {!position.stopLoss && !isProfit && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}
                >
                  <AlertTriangle size={13} style={{ color: 'var(--ink-warn)' }} className="flex-shrink-0" />
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-warn)' }}>
                    No stop-loss set — position is at risk
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSlippage && (
        <SlippageSettingsSheet position={position} isOpen={showSlippage} onClose={() => setShowSlippage(false)} />
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
