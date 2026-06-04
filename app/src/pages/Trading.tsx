import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, X, Filter, BarChart2, Zap, Shield } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import PositionCard from '@/components/PositionCard';
import TradeHistoryCard from '@/components/TradeHistoryCard';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';
import DrawdownMonitor from '@/components/DrawdownMonitor';

type Tab = 'positions' | 'history' | 'analytics';
type HistoryFilter = 'all' | 'wins' | 'losses';

export default function Trading() {
  const { positions, tradeRecords, stats, pnl, pnlPercent, drawdownAlert, dismissDrawdownAlert, updatePrices, dailyDrawdown, overallDrawdown } = useTradingStore();
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  const isProfit = pnl >= 0;
  const filteredRecords = tradeRecords.filter(r =>
    historyFilter === 'wins' ? r.pnl > 0 : historyFilter === 'losses' ? r.pnl <= 0 : true
  );

  return (
    <div className="px-4 pt-4 pb-6 page-enter">

      {/* Drawdown alert */}
      {drawdownAlert && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1 leading-relaxed">{drawdownAlert}</p>
          <button onClick={dismissDrawdownAlert} className="text-red-400 active:opacity-60 flex-shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* Premium P&L summary card */}
      <div className="card-base !p-0 overflow-hidden mb-4">
        <div className={`h-1 w-full ${isProfit ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />
        <div className="p-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/5">
            <div className="pr-4">
              <p className="text-[10px] text-tertiary uppercase tracking-wide mb-1">Open P&L</p>
              <div className="flex items-center gap-1.5">
                {isProfit ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-500" />}
                <p className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                  {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                </p>
              </div>
              <p className={`text-[11px] font-medium ${isProfit ? 'text-green-500' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
              </p>
            </div>
            <div className="px-4">
              <p className="text-[10px] text-tertiary uppercase tracking-wide mb-1">Win Rate</p>
              <p className="text-lg font-bold text-primary-app">{stats.winRate}%</p>
              <p className="text-[11px] text-tertiary">{stats.winningTrades}W / {stats.losingTrades}L</p>
            </div>
            <div className="pl-4">
              <p className="text-[10px] text-tertiary uppercase tracking-wide mb-1">Positions</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-lg font-bold text-primary-app">{positions.length}</p>
              </div>
              <p className="text-[11px] text-accent-app font-medium">Live</p>
            </div>
          </div>

          {/* Mini risk bars */}
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
            {[
              { label: 'Daily DD', val: dailyDrawdown.current, limit: dailyDrawdown.limit, pct: dailyDrawdown.percentOfLimit },
              { label: 'Overall DD', val: overallDrawdown.current, limit: overallDrawdown.limit, pct: overallDrawdown.percentOfLimit },
            ].map(({ label, val, limit, pct }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-tertiary">{label}</span>
                  <span className="text-[10px] font-semibold text-primary-app">${Math.abs(val).toFixed(0)} / ${limit}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drawdown monitor */}
      <div className="mb-4"><DrawdownMonitor /></div>

      {/* Tab bar */}
      <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-4 gap-1">
        {([
          { id: 'positions', label: `Positions`, count: positions.length, icon: Zap },
          { id: 'history',   label: 'History',   count: tradeRecords.length, icon: BarChart2 },
          { id: 'analytics', label: 'Analytics', count: null, icon: Shield },
        ] as { id: Tab; label: string; count: number | null; icon: any }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white dark:bg-[#2a2a2a] text-primary-app shadow-sm' : 'text-secondary'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-accent-app text-white' : 'bg-gray-200 dark:bg-white/10 text-tertiary'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Positions */}
      {activeTab === 'positions' && (
        <div className="space-y-3 page-enter">
          {positions.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3">
                <BarChart2 size={26} className="text-gray-300" />
              </div>
              <p className="text-base font-semibold text-primary-app">No Open Positions</p>
              <p className="text-sm text-tertiary mt-1.5 max-w-[200px] leading-relaxed">Use Quick Swap to open your first position</p>
            </div>
          ) : positions.map(p => <PositionCard key={p.id} position={p} />)}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="space-y-3 page-enter">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total',  val: stats.totalTrades,   color: 'text-primary-app', bg: 'bg-gray-50 dark:bg-white/5' },
              { label: 'Wins',   val: stats.winningTrades, color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Losses', val: stats.losingTrades,  color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-default`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                <p className="text-[11px] text-tertiary">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-tertiary" />
            {(['all','wins','losses'] as HistoryFilter[]).map(f => (
              <button key={f} onClick={() => setHistoryFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors ${historyFilter === f ? 'bg-accent-app text-white' : 'bg-gray-100 dark:bg-white/10 text-secondary'}`}>
                {f}
              </button>
            ))}
          </div>
          {filteredRecords.length === 0
            ? <div className="card-base flex items-center justify-center py-10"><p className="text-sm text-secondary">No trades match this filter</p></div>
            : filteredRecords.map(r => <TradeHistoryCard key={r.id} record={r} />)
          }
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="page-enter"><PerformanceAnalytics stats={stats} compact={false} /></div>
      )}
    </div>
  );
}
