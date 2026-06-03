import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import { useNotificationStore } from '@/stores/notificationStore';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import RecentActivity from '@/components/RecentActivity';
import PerformanceChart from '@/components/PerformanceChart';
import {
  TrendingUp, TrendingDown, Wallet, Target, ChevronRight,
  Zap, BarChart2, ArrowDownLeft, ArrowUpRight, Clock,
  HelpCircle, Shield, Activity, Bell, Star,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const miniCurve = [
  {v:10000},{v:10120},{v:10050},{v:10245},{v:10180},{v:10300},{v:9996}
];

export default function Home() {
  const navigate = useNavigate();
  const {
    balance, pnl, pnlPercent, startingBalance,
    positions, stats, profitTarget,
    dailyDrawdown, overallDrawdown, tradingHistory,
  } = useTradingStore();
  const { activeChallenge } = useChallengeStore();
  const { unreadCount } = useNotificationStore();
  const [walletConnected] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => useTradingStore.getState().updatePrices(), 5000);
    return () => clearInterval(iv);
  }, []);

  const isProfit = pnl >= 0;
  const balanceDelta = balance - startingBalance;
  const balancePct = ((balance - startingBalance) / startingBalance) * 100;

  return (
    <div className="pb-8 page-enter">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4DB8FF] via-[#2aa8f0] to-[#1a7fc4] px-5 pt-5 pb-8">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-4 right-12 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

        <div className="relative">
          {/* Account type badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-[11px] font-semibold tracking-wide">
                {activeChallenge ? `${activeChallenge.tierName} · Phase ${activeChallenge.phase}` : 'Demo Account'}
              </span>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} alerts
              </div>
            )}
          </div>

          <p className="text-white/70 text-xs font-medium tracking-widest uppercase mb-1">Total Balance</p>
          <p className="text-white text-[34px] font-bold tracking-tight leading-none">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isProfit ? 'bg-green-400/25 text-green-200' : 'bg-red-400/25 text-red-200'}`}>
              {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% today
            </div>
            <span className="text-white/50 text-xs">
              {balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(2)} all time
            </span>
          </div>

          {/* Mini equity chart */}
          <div className="mt-3 h-14 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniCurve}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.8)" strokeWidth={2} fill="url(#hg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 4-Stat Cards ─────────────────────────────────────────────────── */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: TrendingUp,
              iconBg: 'bg-blue-50 dark:bg-blue-900/30',
              iconColor: 'text-accent-app',
              label: 'P&L',
              value: `${isProfit ? '+' : ''}$${Math.abs(pnl).toFixed(0)}`,
              valueColor: isProfit ? 'text-green-600' : 'text-red-500',
              sub: `${isProfit ? '+' : ''}${pnlPercent.toFixed(1)}%`,
            },
            {
              icon: BarChart2,
              iconBg: 'bg-green-50 dark:bg-green-900/30',
              iconColor: 'text-green-600',
              label: 'Win Rate',
              value: `${stats.winRate}%`,
              valueColor: 'text-primary-app',
              sub: `${stats.totalTrades} trades`,
            },
            {
              icon: Activity,
              iconBg: 'bg-purple-50 dark:bg-purple-900/30',
              iconColor: 'text-purple-500',
              label: 'Open',
              value: String(positions.length),
              valueColor: 'text-primary-app',
              sub: 'positions',
            },
            {
              icon: Target,
              iconBg: 'bg-amber-50 dark:bg-amber-900/30',
              iconColor: 'text-amber-500',
              label: 'Target',
              value: `${profitTarget.percentComplete.toFixed(0)}%`,
              valueColor: 'text-primary-app',
              sub: 'funded',
            },
          ].map(({ icon: Icon, iconBg, iconColor, label, value, valueColor, sub }) => (
            <div key={label} className="bg-card-app border border-default rounded-2xl p-2.5 shadow-sm">
              <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center mb-1.5`}>
                <Icon size={12} className={iconColor} />
              </div>
              <p className="text-[9px] text-secondary font-medium leading-none mb-1">{label}</p>
              <p className={`text-sm font-bold leading-none ${valueColor}`}>{value}</p>
              <p className="text-[9px] text-tertiary mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Account Summary ───────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-primary-app">Account Overview</span>
            <span className="badge bg-accent-light text-accent-app text-[10px]">Phase 1 · Starter</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-tertiary mb-1">Starting</p>
              <p className="text-sm font-bold text-primary-app">${startingBalance.toLocaleString()}</p>
            </div>
            <div className="border-x border-default">
              <p className="text-xs text-tertiary mb-1">Current</p>
              <p className={`text-sm font-bold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-tertiary mb-1">P&L</p>
              <p className={`text-sm font-bold ${balanceDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profit Target Progress ───────────────────────────────────────── */}
      <div className="px-4 mt-3">
        <div className="card">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Target size={13} className="text-accent-app" />
              <span className="text-sm font-bold text-primary-app">Profit Target</span>
            </div>
            <span className="text-sm font-bold text-accent-app">
              ${profitTarget.current.toFixed(0)} / ${profitTarget.target}
            </span>
          </div>
          <div className="h-2.5 bg-muted-app rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4DB8FF] to-cyan-400 transition-all duration-700"
              style={{ width: `${Math.min(profitTarget.percentComplete, 100)}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-accent-app font-semibold">{profitTarget.percentComplete.toFixed(1)}% complete</span>
            <span className="text-[11px] text-tertiary">${(profitTarget.target - profitTarget.current).toFixed(0)} remaining to funded</span>
          </div>

          {/* Challenge rules mini summary */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-default">
            <div className="text-center">
              <p className="text-[10px] text-tertiary">Daily Loss</p>
              <p className={`text-xs font-bold mt-0.5 ${dailyDrawdown.percentOfLimit > 70 ? 'text-red-500' : 'text-primary-app'}`}>
                ${Math.abs(dailyDrawdown.current).toFixed(0)} / ${dailyDrawdown.limit}
              </p>
            </div>
            <div className="text-center border-x border-default">
              <p className="text-[10px] text-tertiary">Overall</p>
              <p className={`text-xs font-bold mt-0.5 ${overallDrawdown.percentOfLimit > 70 ? 'text-red-500' : 'text-primary-app'}`}>
                ${Math.abs(overallDrawdown.current).toFixed(0)} / ${overallDrawdown.limit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-tertiary">Win Rate</p>
              <p className="text-xs font-bold mt-0.5 text-green-600">{stats.winRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: ArrowDownLeft, label: 'Deposit',  bg: 'bg-blue-50 dark:bg-blue-900/20',    color: 'text-blue-500',   fn: () => {} },
            { icon: ArrowUpRight,  label: 'Withdraw', bg: 'bg-green-50 dark:bg-green-900/20',  color: 'text-green-600',  fn: () => navigate('/payouts') },
            { icon: Clock,         label: 'History',  bg: 'bg-orange-50 dark:bg-orange-900/20',color: 'text-orange-500', fn: () => navigate('/trading') },
            { icon: HelpCircle,    label: 'Support',  bg: 'bg-purple-50 dark:bg-purple-900/20',color: 'text-purple-500', fn: () => {} },
          ].map(({ icon: Icon, label, bg, color, fn }) => (
            <button key={label} onClick={fn} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card-app border border-default shadow-sm active:scale-95 transition-transform">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <span className="text-[10px] font-semibold text-secondary">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Wallet Connect Banner ─────────────────────────────────────────── */}
      {!walletConnected && (
        <div className="px-4 mt-4">
          <button className="w-full flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl px-4 py-3.5 active:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-app/10 flex items-center justify-center">
                <Wallet size={16} className="text-accent-app" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-primary-app">Connect TON Wallet</p>
                <p className="text-[11px] text-secondary mt-0.5">Enable payouts & on-chain settlement</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-tertiary" />
          </button>
        </div>
      )}

      {/* ── Live Positions Preview ────────────────────────────────────────── */}
      {positions.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-primary-app">Live Positions ({positions.length})</span>
            </div>
            <button onClick={() => navigate('/trading')} className="flex items-center gap-0.5 text-xs text-accent-app font-bold">
              Manage <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {positions.map(pos => (
              <div key={pos.id} className={`card !p-3 border-l-[3px] ${pos.pnl >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-accent-app">{pos.tokenName.slice(0,2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-primary-app">{pos.tokenName}</p>
                      <span className={`badge text-[9px] ${pos.direction === 'long' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                        {pos.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-tertiary mt-0.5">{pos.tokenPair} · ${pos.currentPrice.toFixed(5)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    </p>
                    <p className={`text-[11px] ${pos.pnl >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Performance Chart ─────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <PerformanceChart />
      </div>

      {/* ── Risk Monitor ──────────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <DrawdownMonitor />
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-amber-500" />
            <span className="text-sm font-bold text-primary-app">Performance Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Trades',    val: String(stats.totalTrades) },
              { label: 'Win Rate',        val: `${stats.winRate}%` },
              { label: 'Profit Factor',   val: `${stats.profitFactor}x` },
              { label: 'Avg Win',         val: `$${stats.avgWin.toFixed(2)}` },
              { label: 'Avg Loss',        val: `$${stats.avgLoss.toFixed(2)}` },
              { label: 'Best Trade',      val: `$${stats.bestTrade.toFixed(2)}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-default last:border-0">
                <span className="text-xs text-secondary">{label}</span>
                <span className="text-xs font-bold text-primary-app">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <RecentActivity />
      </div>
    </div>
  );
}
