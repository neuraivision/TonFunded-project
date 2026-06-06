import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, X,
  BarChart2, Activity, Clock, Zap, Filter,
} from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import PositionCard from '@/components/PositionCard';
import TradeHistoryCard from '@/components/TradeHistoryCard';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';
import DrawdownMonitor from '@/components/DrawdownMonitor';

type Tab = 'positions' | 'history' | 'analytics';
type HistoryFilter = 'all' | 'wins' | 'losses';

function StatPill({ label, value, up }: { label: string; value: string; up?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center py-3 px-1"
      style={{ borderRight: '1px solid var(--line)' }}>
      <span
        className="font-number text-[15px] leading-none"
        style={{
          fontWeight: 700,
          color: up === undefined ? 'var(--ink-1)' : up ? 'var(--ink-up)' : 'var(--ink-down)',
        }}
      >
        {value}
      </span>
      <span className="text-[10px] mt-1 leading-none" style={{ color: 'var(--ink-3)' }}>{label}</span>
    </div>
  );
}

export default function Trading() {
  const {
    positions, tradeRecords, stats,
    pnl, pnlPercent,
    drawdownAlert, dismissDrawdownAlert,
    updatePrices,
  } = useTradingStore();

  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    const id = setInterval(updatePrices, 5000);
    return () => clearInterval(id);
  }, [updatePrices]);

  const isProfit = pnl >= 0;
  const winRate = stats.totalTrades > 0 ? Math.round((stats.winningTrades / stats.totalTrades) * 100) : 0;

  const filteredRecords = tradeRecords.filter((r) => {
    if (historyFilter === 'wins') return r.pnl > 0;
    if (historyFilter === 'losses') return r.pnl <= 0;
    return true;
  });

  return (
    <div className="pb-8 page-enter">

      {/* ── Hero strip ─────────────────────────────────── */}
      <div
        className="px-4 pt-4 pb-0"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)' }}
      >
        {/* Drawdown alert */}
        {drawdownAlert && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 mb-3"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm flex-1 leading-relaxed" style={{ color: 'var(--ink-down)' }}>{drawdownAlert}</p>
            <button onClick={dismissDrawdownAlert} className="text-red-400 active:opacity-60 flex-shrink-0">
              <X size={13} />
            </button>
          </div>
        )}

        {/* P&L row */}
        <div className="flex items-start justify-between pb-4">
          <div>
            <p className="text-[10px] font-600 uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-3)', fontWeight: 600 }}>
              Session P&L
            </p>
            <div className="flex items-center gap-2">
              <span
                className="font-number text-[32px] leading-none"
                style={{ fontWeight: 800, letterSpacing: '-0.04em', color: isProfit ? 'var(--ink-up)' : 'var(--ink-down)' }}
              >
                {isProfit ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
              </span>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full mt-1"
                style={{
                  background: isProfit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${isProfit ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
                }}
              >
                {isProfit ? <TrendingUp size={10} style={{ color: 'var(--ink-up)' }} /> : <TrendingDown size={10} style={{ color: 'var(--ink-down)' }} />}
                <span className="font-number text-[11px]" style={{ fontWeight: 700, color: isProfit ? 'var(--ink-up)' : 'var(--ink-down)' }}>
                  {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl mt-1"
            style={{ background: 'rgba(77,184,255,0.1)', border: '1px solid rgba(77,184,255,0.18)' }}
          >
            <Activity size={13} style={{ color: 'var(--ton)' }} />
            <span className="text-xs font-700" style={{ color: 'var(--ton)', fontWeight: 700 }}>
              {positions.length} Open
            </span>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="flex -mx-4" style={{ borderTop: '1px solid var(--line)' }}>
          <StatPill label="Win Rate"  value={`${winRate}%`}                 up={winRate >= 50} />
          <StatPill label="Trades"    value={`${stats.totalTrades}`} />
          <StatPill label="Best"      value={stats.bestTrade > 0 ? `+$${stats.bestTrade.toFixed(0)}` : '—'} up={stats.bestTrade > 0} />
          <div className="flex-1 flex flex-col items-center py-3 px-1">
            <span className="font-number text-[15px] leading-none" style={{ fontWeight: 700, color: 'var(--ink-warn)' }}>
              {stats.losingTrades}
            </span>
            <span className="text-[10px] mt-1" style={{ color: 'var(--ink-3)' }}>Losses</span>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="px-4 pt-3 space-y-3">
        <DrawdownMonitor />

        {/* Tab bar */}
        <div className="tab-bar">
          {([
            { id: 'positions', label: `Positions (${positions.length})`, icon: BarChart2 },
            { id: 'history',   label: `History (${tradeRecords.length})`, icon: Clock },
            { id: 'analytics', label: 'Analytics',                        icon: Activity },
          ] as { id: Tab; label: string; icon: typeof BarChart2 }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item ${activeTab === tab.id ? 'tab-item-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Positions */}
        {activeTab === 'positions' && (
          <div className="space-y-3 page-enter">
            {positions.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(77,184,255,0.08)' }}
                >
                  <BarChart2 size={22} style={{ color: 'var(--ton)' }} />
                </div>
                <p className="text-sm font-600 mb-1" style={{ fontWeight: 600, color: 'var(--ink-1)' }}>No Open Positions</p>
                <p className="text-xs leading-relaxed max-w-[180px]" style={{ color: 'var(--ink-3)' }}>
                  Open a position via the Swap page
                </p>
              </div>
            ) : (
              positions.map((p) => <PositionCard key={p.id} position={p} />)
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-3 page-enter">
            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Trades',   value: stats.totalTrades,   accent: false },
                { label: 'Wins',     value: stats.winningTrades, accent: true, up: true },
                { label: 'Losses',   value: stats.losingTrades,  accent: true, up: false },
              ].map((s) => (
                <div key={s.label} className="stat-tile text-center">
                  <p
                    className="font-number text-lg leading-none"
                    style={{ fontWeight: 700, color: !s.accent ? 'var(--ink-1)' : s.up ? 'var(--ink-up)' : 'var(--ink-down)' }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--ink-3)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <Filter size={12} style={{ color: 'var(--ink-3)' }} />
              {(['all', 'wins', 'losses'] as HistoryFilter[]).map((f) => {
                const active = historyFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className="text-xs font-600 px-3.5 py-1.5 rounded-full transition-all capitalize active:opacity-70"
                    style={{
                      fontWeight: 600,
                      background: active ? 'linear-gradient(135deg,#4DB8FF,#2aa8f2)' : 'var(--bg-sunken)',
                      color: active ? '#fff' : 'var(--ink-2)',
                      border: active ? 'none' : '1px solid var(--line)',
                      boxShadow: active ? '0 2px 8px rgba(77,184,255,0.25)' : 'none',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {filteredRecords.length === 0 ? (
              <div className="py-10 text-center rounded-2xl" style={{ background: 'var(--bg-raised)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-2)' }}>No trades match this filter</p>
              </div>
            ) : (
              filteredRecords.map((r) => <TradeHistoryCard key={r.id} record={r} />)
            )}
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="page-enter">
            <PerformanceAnalytics stats={stats} compact={false} />
          </div>
        )}
      </div>
    </div>
  );
}
