import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, X, Filter, BarChart2 } from 'lucide-react';
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

  // Live price ticker every 5 seconds
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
    <div className="px-4 pt-4 pb-6 page-enter">

      {/* ── Drawdown alert banner ─────────────────────────────────────────── */}
      {drawdownAlert && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 page-enter">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1 leading-relaxed">{drawdownAlert}</p>
          <button onClick={dismissDrawdownAlert} className="text-red-400 active:text-red-600 flex-shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Account P&L summary ───────────────────────────────────────────── */}
      <div className="card-base !p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-tertiary">Open P&L</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isProfit ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <p className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-tertiary">Change</p>
            <p className={`text-base font-semibold mt-0.5 ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-tertiary">Open Positions</p>
            <p className="text-base font-semibold text-primary-app mt-0.5">{positions.length}</p>
          </div>
        </div>
      </div>

      {/* ── Drawdown Monitor ──────────────────────────────────────────────── */}
      <div className="mb-4">
        <DrawdownMonitor />
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
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
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-primary-app shadow-sm'
                : 'text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Positions tab ─────────────────────────────────────────────────── */}
      {activeTab === 'positions' && (
        <div className="space-y-3 page-enter">
          {positions.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center py-12 text-center">
              <BarChart2 size={32} className="text-gray-300 mb-3" />
              <p className="text-base font-semibold text-secondary">No Open Positions</p>
              <p className="text-sm text-tertiary mt-1">
                Use Quick Swap to open a position, or wait for a trade signal.
              </p>
            </div>
          ) : (
            positions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))
          )}
        </div>
      )}

      {/* ── History tab ───────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-3 page-enter">
          {/* Stats banner */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-primary-app">{stats.totalTrades}</p>
              <p className="text-[11px] text-tertiary">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-green-600">{stats.winningTrades}</p>
              <p className="text-[11px] text-tertiary">Wins</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-red-500">{stats.losingTrades}</p>
              <p className="text-[11px] text-tertiary">Losses</p>
            </div>
          </div>

          {/* Filter row */}
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
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  historyFilter === f.id
                    ? 'bg-accent-app text-white'
                    : 'bg-gray-100 text-secondary active:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center py-10 text-center">
              <BarChart2 size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-secondary">No trades match this filter</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <TradeHistoryCard key={record.id} record={record} />
            ))
          )}
        </div>
      )}

      {/* ── Analytics tab ─────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="page-enter">
          <PerformanceAnalytics stats={stats} compact={false} />
        </div>
      )}
    </div>
  );
}
