import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, X, Filter, BarChart2, Zap } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import PositionCard from '@/components/PositionCard';
import TradeHistoryCard from '@/components/TradeHistoryCard';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';
import DrawdownMonitor from '@/components/DrawdownMonitor';

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

  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  const isProfit = pnl >= 0;

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
        style={{ background: 'linear-gradient(135deg, #1a6faa 0%, #2aa8f2 50%, #4DB8FF 100%)' }}
      >
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.07)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-10 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translateY(40%)' }}
        />

        <p className="text-xs font-600 text-white/70 uppercase tracking-widest mb-2">
          Live P&L
        </p>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isProfit ? (
                <TrendingUp size={18} className="text-white/80" />
              ) : (
                <TrendingDown size={18} className="text-white/80" />
              )}
              <p className="font-number text-3xl font-700 leading-none" style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
                {isProfit ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-white/70">
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% return
            </p>
          </div>
          <div className="text-right">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            >
              <Zap size={12} className="text-white" />
              <span className="text-xs font-700 text-white">{positions.length} Open</span>
            </div>
          </div>
        </div>
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
