import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, X,
  Filter, BarChart2, Zap, Clock, Shield, RefreshCw,
} from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import PositionCard from '@/components/PositionCard';
import TradeHistoryCard from '@/components/TradeHistoryCard';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';
import DrawdownMonitor from '@/components/DrawdownMonitor';

type Tab = 'positions' | 'history' | 'analytics' | 'risk';
type HistoryFilter = 'all' | 'wins' | 'losses';

export default function Trading() {
  const {
    positions, tradeRecords, stats, pnl, pnlPercent,
    balance, startingBalance,
    drawdownAlert, dismissDrawdownAlert, updatePrices,
    dailyDrawdown, overallDrawdown, profitTarget,
  } = useTradingStore();
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => {
      updatePrices();
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(iv);
  }, [updatePrices]);

  const isProfit = pnl >= 0;
  const filteredRecords = tradeRecords.filter(r =>
    historyFilter === 'wins' ? r.pnl > 0 :
    historyFilter === 'losses' ? r.pnl <= 0 : true
  );

  const totalOpenValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);

  return (
    <div className="px-4 pt-4 pb-8 page-enter">

      {/* Drawdown alert */}
      {drawdownAlert && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1 leading-relaxed">{drawdownAlert}</p>
          <button onClick={dismissDrawdownAlert} className="text-red-400 active:opacity-60 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Rich P&L header */}
      <div className="card !p-0 overflow-hidden mb-4">
        {/* Top gradient strip */}
        <div className={`h-1 w-full ${isProfit ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Portfolio Summary</span>
            <div className="flex items-center gap-1.5 text-[11px] text-tertiary">
              <RefreshCw size={10} />
              {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <p className="text-[10px] text-tertiary mb-0.5">Open P&L</p>
              <div className="flex items-center gap-1">
                {isProfit ? <TrendingUp size={12} className="text-green-600" /> : <TrendingDown size={12} className="text-red-500" />}
                <p className={`text-sm font-bold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                  {isProfit?'+':''}${Math.abs(pnl).toFixed(2)}
                </p>
              </div>
              <p className={`text-[10px] ${isProfit ? 'text-green-500' : 'text-red-400'}`}>
                {isProfit?'+':''}{pnlPercent.toFixed(2)}%
              </p>
            </div>
            <div className="border-l border-default pl-3">
              <p className="text-[10px] text-tertiary mb-0.5">Win Rate</p>
              <p className="text-sm font-bold text-primary-app">{stats.winRate}%</p>
              <p className="text-[10px] text-tertiary">{stats.winningTrades}W/{stats.losingTrades}L</p>
            </div>
            <div className="border-l border-default pl-3">
              <p className="text-[10px] text-tertiary mb-0.5">Positions</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-bold text-primary-app">{positions.length}</p>
              </div>
              <p className="text-[10px] text-accent-app font-medium">Live</p>
            </div>
            <div className="border-l border-default pl-3">
              <p className="text-[10px] text-tertiary mb-0.5">Balance</p>
              <p className="text-sm font-bold text-primary-app">
                ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-tertiary">${startingBalance.toLocaleString()} start</p>
            </div>
          </div>

          {/* Mini drawdown bars */}
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-default">
            {[
              { label: 'Daily DD', val: dailyDrawdown.current, limit: dailyDrawdown.limit, pct: dailyDrawdown.percentOfLimit },
              { label: 'Overall DD', val: overallDrawdown.current, limit: overallDrawdown.limit, pct: overallDrawdown.percentOfLimit },
            ].map(({ label, val, limit, pct }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-tertiary">{label}</span>
                  <span className="text-[10px] font-semibold text-primary-app">${Math.abs(val).toFixed(0)}/${limit}</span>
                </div>
                <div className="h-1 bg-muted-app rounded-full overflow-hidden">
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

      {/* Tab bar */}
      <div className="flex bg-muted-app rounded-xl p-1 mb-4 gap-0.5">
        {([
          { id: 'positions',  label: 'Positions',  count: positions.length,    icon: Zap },
          { id: 'history',    label: 'History',    count: tradeRecords.length, icon: Clock },
          { id: 'analytics',  label: 'Analytics',  count: null,                icon: BarChart2 },
          { id: 'risk',       label: 'Risk',       count: null,                icon: Shield },
        ] as { id: Tab; label: string; count: number | null; icon: any }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === tab.id ? 'bg-card-app text-primary-app shadow-sm' : 'text-secondary'
            }`}
          >
            <tab.icon size={11} />
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-accent-app text-white' : 'bg-gray-200 dark:bg-white/10 text-tertiary'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Positions tab */}
      {activeTab === 'positions' && (
        <div className="space-y-3 page-enter">
          {positions.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted-app flex items-center justify-center mb-4">
                <BarChart2 size={26} className="text-tertiary" />
              </div>
              <p className="text-base font-bold text-primary-app">No Open Positions</p>
              <p className="text-sm text-tertiary mt-1.5 max-w-[200px] leading-relaxed">
                Go to Quick Swap to open your first trade
              </p>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div className="card !p-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-tertiary">Open Value</p>
                    <p className="text-xs font-bold text-primary-app mt-0.5">${totalOpenValue.toFixed(2)}</p>
                  </div>
                  <div className="border-x border-default">
                    <p className="text-[10px] text-tertiary">Total P&L</p>
                    <p className={`text-xs font-bold mt-0.5 ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                      {isProfit?'+':''}${pnl.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-tertiary">Count</p>
                    <p className="text-xs font-bold text-primary-app mt-0.5">{positions.length} open</p>
                  </div>
                </div>
              </div>
              {positions.map(p => <PositionCard key={p.id} position={p} />)}
            </>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="space-y-3 page-enter">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total',  val: stats.totalTrades,   color: 'text-primary-app', bg: 'bg-muted-app' },
              { label: 'Wins',   val: stats.winningTrades, color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Losses', val: stats.losingTrades,  color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-default`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                <p className="text-[11px] text-tertiary">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Extra stats */}
          <div className="card !p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { label: 'Avg Win',      val: `+$${stats.avgWin.toFixed(2)}`,  color: 'text-green-600' },
                { label: 'Avg Loss',     val: `-$${stats.avgLoss.toFixed(2)}`, color: 'text-red-500' },
                { label: 'Best Trade',   val: `$${stats.bestTrade.toFixed(2)}`, color: 'text-primary-app' },
                { label: 'Profit Factor',val: `${stats.profitFactor}x`,         color: 'text-accent-app' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-tertiary">{label}</span>
                  <span className={`text-xs font-bold ${color}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-tertiary flex-shrink-0" />
            {(['all','wins','losses'] as HistoryFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors ${
                  historyFilter === f ? 'bg-accent-app text-white' : 'bg-muted-app text-secondary'
                }`}
              >{f}</button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="card flex items-center justify-center py-10">
              <p className="text-sm text-secondary">No trades match this filter</p>
            </div>
          ) : filteredRecords.map(r => <TradeHistoryCard key={r.id} record={r} />)}
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <div className="page-enter">
          <PerformanceAnalytics stats={stats} compact={false} />
        </div>
      )}

      {/* Risk tab */}
      {activeTab === 'risk' && (
        <div className="space-y-4 page-enter">
          <DrawdownMonitor />

          {/* Challenge rules */}
          <div className="card">
            <p className="text-sm font-bold text-primary-app mb-3">Challenge Rules</p>
            <div className="space-y-3">
              {[
                { label: 'Max Daily Loss',     val: '$500',   pct: dailyDrawdown.percentOfLimit,   status: dailyDrawdown.percentOfLimit > 80 ? 'danger' : dailyDrawdown.percentOfLimit > 50 ? 'warn' : 'ok' },
                { label: 'Max Overall Loss',   val: '$1,000', pct: overallDrawdown.percentOfLimit, status: overallDrawdown.percentOfLimit > 80 ? 'danger' : overallDrawdown.percentOfLimit > 50 ? 'warn' : 'ok' },
                { label: 'Profit Target',      val: '$1,000', pct: profitTarget.percentComplete,   status: 'ok' },
              ].map(({ label, val, pct, status }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-secondary">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-primary-app">{pct.toFixed(0)}%</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${status === 'danger' ? 'bg-red-500' : status === 'warn' ? 'bg-amber-400' : 'bg-green-500'}`} />
                    </div>
                  </div>
                  <div className="h-2 bg-muted-app rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${status === 'danger' ? 'bg-red-500' : status === 'warn' ? 'bg-amber-400' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
