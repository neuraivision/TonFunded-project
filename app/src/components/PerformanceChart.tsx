import { useTradingStore } from '@/stores/tradingStore';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const weekData = [
  { day: 'Tue', value: 10020 }, { day: 'Wed', value: 10145 },
  { day: 'Thu', value: 10080 }, { day: 'Fri', value: 10245 },
  { day: 'Sat', value: 10180 }, { day: 'Sun', value: 9996 },
];

export default function PerformanceChart() {
  const { stats } = useTradingStore();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-primary-app">Performance</p>
        <span className="text-xs text-tertiary">This Month</span>
      </div>

      <div className="h-20 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weekData}>
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4DB8FF" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#4DB8FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 11 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Balance']}
            />
            <Area type="monotone" dataKey="value" stroke="#4DB8FF" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 divide-x divide-default">
        {[
          { label: 'Win Rate',  val: `${stats.winRate}%` },
          { label: 'P. Factor', val: `${stats.profitFactor}x` },
          { label: 'Trades',    val: String(stats.totalTrades) },
          { label: 'Best',      val: `+$${stats.bestTrade.toFixed(0)}` },
        ].map(({ label, val }) => (
          <div key={label} className="px-2 first:pl-0 last:pr-0 text-center">
            <p className="text-xs font-bold text-primary-app">{val}</p>
            <p className="text-[10px] text-tertiary mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
