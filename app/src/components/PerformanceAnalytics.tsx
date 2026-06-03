import type { PerformanceStats } from '@/types';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface Props { stats: PerformanceStats; compact?: boolean; }

const weekData = [
  { day: 'Mon', pnl: 120 },
  { day: 'Tue', pnl: -45 },
  { day: 'Wed', pnl: 210 },
  { day: 'Thu', pnl: 80 },
  { day: 'Fri', pnl: -20 },
  { day: 'Sat', pnl: 160 },
  { day: 'Sun', pnl: 95 },
];

export default function PerformanceAnalytics({ stats }: Props) {
  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: TrendingUp, label: 'Win Rate',      val: `${stats.winRate}%`,          sub: `${stats.winningTrades}W / ${stats.losingTrades}L`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Target,     label: 'Profit Factor', val: `${stats.profitFactor}x`,      sub: 'Risk-adjusted return',                              color: 'text-accent-app', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Zap,        label: 'Avg Win',       val: `$${stats.avgWin.toFixed(0)}`, sub: 'Per winning trade',                                 color: 'text-primary-app', bg: 'bg-muted-app' },
          { icon: Award,      label: 'Best Streak',   val: `${stats.maxConsecutiveWins}`, sub: 'Consecutive wins',                                  color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(({ icon: Icon, label, val, sub, color, bg }) => (
          <div key={label} className="card !p-3.5">
            <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon size={13} className={color} />
            </div>
            <p className={`text-lg font-bold ${color}`}>{val}</p>
            <p className="text-[11px] text-secondary mt-0.5">{label}</p>
            <p className="text-[10px] text-tertiary mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly P&L bar chart */}
      <div className="card">
        <p className="text-sm font-bold text-primary-app mb-4">Weekly P&L</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barSize={18}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="pnl" radius={[6,6,0,0]}>
                {weekData.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade breakdown */}
      <div className="card">
        <p className="text-sm font-bold text-primary-app mb-3">Trade Breakdown</p>
        <div className="space-y-3">
          {[
            { label: 'Total Trades',   val: stats.totalTrades,             bar: null },
            { label: 'Win Rate',       val: `${stats.winRate}%`,           bar: stats.winRate, barColor: 'bg-green-500' },
            { label: 'Avg Win',        val: `$${stats.avgWin.toFixed(0)}`, bar: null },
            { label: 'Avg Loss',       val: `$${stats.avgLoss.toFixed(0)}`,bar: null },
            { label: 'Best Trade',     val: `$${stats.bestTrade.toFixed(0)}`, bar: null },
          ].map(({ label, val, bar, barColor }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-secondary">{label}</span>
                <span className="text-xs font-bold text-primary-app">{val}</span>
              </div>
              {bar !== null && (
                <div className="progress-track !h-1">
                  <div className={`progress-fill ${barColor ?? 'bg-accent-app'}`} style={{ width: `${Math.min(bar, 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
