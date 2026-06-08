import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, X, Filter, BarChart2, Zap } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import PositionCard from '@/components/PositionCard';
import TradeHistoryCard from '@/components/TradeHistoryCard';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import GetFundedGate from '@/components/GetFundedGate';

type Tab = 'positions' | 'history' | 'analytics';
type HistoryFilter = 'all' | 'wins' | 'losses';

export default function Trading() {
  const {
    positions,
    tradeRecords,
    stats,
    pnl,
    pnlPercent,
    drawdownAlert,
    dismissDrawdownAlert,
    updatePrices,
  } = useTradingStore();

  const activeChallenge = useChallengeStore((s) => s.activeChallenge);
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    if (!activeChallenge) return;
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [updatePrices, activeChallenge]);

  const isProfit = pnl >= 0;

  // No funded account → no positions/P&L to show yet.
  if (!activeChallenge) {
    return (
      <GetFundedGate
        title="No funded account yet"
        subtitle="Your positions, P&L, and trade history appear here once you pass a challenge and get funded."
      />
    );
  }

  const filteredRecords = tradeRecords.filter((r) => {
    if (historyFilter === 'wins') return r.pnl > 0;
    if (historyFilter === 'losses') return r.pnl <= 0;
    return true;
  });

  return (
    <div className="px-4 pt-4 pb-6 page-enter space-y-4">

      {/* Drawdown alert */}
      {drawdownAlert && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.04))',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1 leading-relaxed">{drawdownAlert}</p>
          <button onClick={dismissDrawdownAlert} className="text-red-400 active:text-red-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* P&L Hero Card */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #091828 0%, #0d2138 55%, #081624 100%)',
          border: '1px solid rgba(77,184,255,0.12)',
          boxShadow: '0 8px 28px rgba(8,18,32,0.45)',
        }}
      >
        {/* Dynamic P&L glow — green on profit, red on loss */}
        <div
          className="absolute top-0 right-0 w-52 h-52 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${isProfit ? 'rgba(34,197,94,0.16)' : 'rgba(239,68,68,0.15)'} 0%, transparent 65%)`,
            transform: 'translate(25%, -25%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-36 h-36 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.07) 0%, transparent 65%)', transform: 'translate(-20%, 25%)' }}
        />

        {/* Label row */}
        <div className="flex items-center justify-between mb-3.5 relative">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 5px rgba(74,222,128,0.8)' }} />
            <p className="text-[10px] font-700 text-white/45 uppercase tracking-[0.14em]" style={{ fontWeight: 700 }}>
              Live P&L
            </p>
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(77,184,255,0.12)', border: '1px solid rgba(77,184,255,0.22)' }}
          >
            <Zap size={11} style={{ color: '#4DB8FF' }} />
            <span className="text-[11px] font-700 text-blue-200" style={{ fontWeight: 700 }}>{positions.length} Open</span>
          </div>
        </div>

        {/* Big P&L number */}
        <div className="flex items-center gap-2.5 relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isProfit ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${isProfit ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}
          >
            {isProfit
              ? <TrendingUp size={17} style={{ color: '#4ade80' }} />
              : <TrendingDown size={17} style={{ color: '#f87171' }} />}
          </div>
          <p
            className="font-number text-[34px] leading-none"
            style={{ fontWeight: 700, letterSpacing: '-0.04em', color: isProfit ? '#4ade80' : '#f87171' }}
          >
            {isProfit ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
          </p>
        </div>

        {/* Return % */}
        <p
          className="text-[13px] mt-2.5 font-number relative"
          style={{ color: isProfit ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)' }}
        >
          {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% return today
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Win Rate', value: stats.totalTrades > 0 ? `${Math.round((stats.winningTrades / stats.totalTrades) * 100)}%` : '—', color: 'text-success-app' },
          { label: 'Total Trades', value: stats.totalTrades, color: 'text-primary-app' },
          { label: 'Best Trade', value: stats.bestTrade > 0 ? `+$${stats.bestTrade.toFixed(0)}` : '—', color: 'text-success-app' },
        ].map((s) => (
          <div key={s.label} className="stat-tile text-center">
            <p className={`text-base font-number font-700 ${s.color}`} style={{ fontWeight: 700 }}>
              {s.value}
            </p>
            <p className="text-[11px] text-tertiary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Drawdown Monitor */}
      <DrawdownMonitor />

      {/* Tab bar */}
      <div className="tab-bar">
        {(
          [
            { id: 'positions', label: `Positions (${positions.length})` },
            { id: 'history', label: `History (${tradeRecords.length})` },
            { id: 'analytics', label: 'Analytics' },
          ] as { id: Tab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item ${activeTab === tab.id ? 'tab-item-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Positions tab */}
      {activeTab === 'positions' && (
        <div className="space-y-3 page-enter">
          {positions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-14 text-center rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'var(--bg-accent-light)' }}
              >
                <BarChart2 size={24} className="text-accent-app" />
              </div>
              <p className="text-base font-600 text-primary-app" style={{ fontWeight: 600 }}>No Open Positions</p>
              <p className="text-sm text-tertiary mt-1 max-w-[200px] leading-relaxed">
                Use Quick Swap to open a position
              </p>
            </div>
          ) : (
            positions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="space-y-3 page-enter">
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-tile text-center">
              <p className="text-base font-number font-700 text-primary-app" style={{ fontWeight: 700 }}>{stats.totalTrades}</p>
              <p className="text-[11px] text-tertiary">Total</p>
            </div>
            <div className="stat-tile text-center" style={{ borderTop: '2px solid var(--text-success)' }}>
              <p className="text-base font-number font-700 text-success-app" style={{ fontWeight: 700 }}>{stats.winningTrades}</p>
              <p className="text-[11px] text-tertiary">Wins</p>
            </div>
            <div className="stat-tile text-center" style={{ borderTop: '2px solid var(--text-danger)' }}>
              <p className="text-base font-number font-700 text-danger-app" style={{ fontWeight: 700 }}>{stats.losingTrades}</p>
              <p className="text-[11px] text-tertiary">Losses</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-tertiary" />
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'wins', label: 'Wins' },
                { id: 'losses', label: 'Losses' },
              ] as { id: HistoryFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setHistoryFilter(f.id)}
                className={`text-xs font-600 px-3.5 py-1.5 rounded-full transition-all ${
                  historyFilter === f.id
                    ? 'text-white'
                    : 'bg-surface-app text-secondary'
                }`}
                style={
                  historyFilter === f.id
                    ? { background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-accent)' }
                    : { border: '1px solid var(--border-default)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl" style={{ background: 'var(--bg-surface)' }}>
              <p className="text-sm font-medium text-secondary">No trades match this filter</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <TradeHistoryCard key={record.id} record={record} />
            ))
          )}
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <div className="page-enter">
          <PerformanceAnalytics stats={stats} compact={false} />
        </div>
      )}
    </div>
  );
}
