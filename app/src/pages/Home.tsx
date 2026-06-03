import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import RecentActivity from '@/components/RecentActivity';
import {
  TrendingUp, TrendingDown, Wallet, Target, ChevronRight,
  Zap, BarChart2, ArrowDownLeft, ArrowUpRight, Clock, HelpCircle,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const miniCurve = [
  {v:10000},{v:10120},{v:10050},{v:10245},{v:10180},{v:10300},{v:9996}
];

export default function Home() {
  const navigate = useNavigate();
  const { balance, pnl, pnlPercent, startingBalance, positions, stats, profitTarget } = useTradingStore();
  const { activeChallenge } = useChallengeStore();

  useEffect(() => {
    const iv = setInterval(() => useTradingStore.getState().updatePrices(), 5000);
    return () => clearInterval(iv);
  }, []);

  const isProfit = pnl >= 0;
  const balanceDelta = balance - startingBalance;

  return (
    <div className="pb-8 page-enter">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4DB8FF] via-[#38a8f0] to-[#1a8ed4] px-5 pt-6 pb-10">
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-6 right-14 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/70 text-[11px] font-semibold tracking-widest uppercase">Total Balance</p>
            {activeChallenge && (
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Phase {activeChallenge.phase} · {activeChallenge.tierName}
              </span>
            )}
          </div>

          <p className="text-white text-[32px] font-bold tracking-tight leading-none mt-2">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isProfit ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'}`}>
              {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
            <span className="text-white/50 text-xs">
              {isProfit ? '+' : ''}${balanceDelta.toFixed(2)} all time
            </span>
          </div>

          {/* Mini chart */}
          <div className="mt-4 h-12 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniCurve}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.7)" strokeWidth={2} fill="url(#hg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="px-4 -mt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              icon: TrendingUp, iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-accent-app',
              label: 'Open P&L', value: `${isProfit ? '+' : ''}$${Math.abs(pnl).toFixed(2)}`,
              valueColor: isProfit ? 'text-green-600' : 'text-red-500',
              sub: `${positions.length} open`,
            },
            {
              icon: BarChart2, iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600',
              label: 'Win Rate', value: `${stats.winRate}%`,
              valueColor: 'text-primary-app',
              sub: `${stats.totalTrades} trades`,
            },
            {
              icon: Target, iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500',
              label: 'Target', value: `${profitTarget.percentComplete.toFixed(0)}%`,
              valueColor: 'text-primary-app',
              sub: 'complete',
            },
          ].map(({ icon: Icon, iconBg, iconColor, label, value, valueColor, sub }) => (
            <div key={label} className="bg-card-app border border-default rounded-2xl p-3 shadow-sm">
              <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center mb-2`}>
                <Icon size={12} className={iconColor} />
              </div>
              <p className="text-[10px] text-secondary font-medium leading-none mb-1">{label}</p>
              <p className={`text-sm font-bold ${valueColor}`}>{value}</p>
              <p className="text-[10px] text-tertiary mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: ArrowDownLeft, label: 'Deposit',  bg: 'bg-blue-50 dark:bg-blue-900/20',   color: 'text-blue-500',   fn: () => {} },
            { icon: ArrowUpRight,  label: 'Withdraw', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-600',  fn: () => navigate('/payouts') },
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

      {/* ── Profit Target ─────────────────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-accent-app" />
              <span className="text-sm font-semibold text-primary-app">Profit Target</span>
            </div>
            <span className="text-sm font-bold text-accent-app">
              ${profitTarget.current.toFixed(0)} / ${profitTarget.target}
            </span>
          </div>
          <div className="h-2 bg-muted-app rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4DB8FF] to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(profitTarget.percentComplete, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-accent-app font-semibold">{profitTarget.percentComplete.toFixed(1)}% complete</span>
            <span className="text-[11px] text-tertiary">${(profitTarget.target - profitTarget.current).toFixed(0)} to go</span>
          </div>
        </div>
      </div>

      {/* ── Wallet Connect ────────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <button className="w-full flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl px-4 py-3.5 active:opacity-80 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-app/10 flex items-center justify-center">
              <Wallet size={16} className="text-accent-app" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-primary-app">Connect TON Wallet</p>
              <p className="text-[11px] text-secondary mt-0.5">Enable payouts & on-chain settlement</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-tertiary" />
        </button>
      </div>

      {/* ── Open Positions Preview ────────────────────────────────────────── */}
      {positions.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-accent-app" />
              <span className="text-sm font-semibold text-primary-app">Live Positions</span>
            </div>
            <button onClick={() => navigate('/trading')} className="flex items-center gap-0.5 text-xs text-accent-app font-semibold">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {positions.slice(0, 2).map(pos => (
              <div key={pos.id} className="card !p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-app">{pos.tokenName.slice(0,2)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary-app">{pos.tokenName}</p>
                    <p className="text-[11px] text-tertiary">{pos.tokenPair}</p>
                  </div>
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
            ))}
          </div>
        </div>
      )}

      {/* ── Risk Monitor ──────────────────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <DrawdownMonitor />
      </div>

      {/* ── Activity ──────────────────────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <RecentActivity />
      </div>
    </div>
  );
}
