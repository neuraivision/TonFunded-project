import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTradingStore } from '@/stores/tradingStore';
import { TrendingUp } from 'lucide-react';

const data = [
  { day: 'Mon', value: 10000 },
  { day: 'Tue', value: 10120 },
  { day: 'Wed', value: 10050 },
  { day: 'Thu', value: 10245 },
  { day: 'Fri', value: 10180 },
  { day: 'Sat', value: 10420 },
  { day: 'Sun', value: 10615 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <p className="text-tertiary">{label}</p>
      <p className="font-number font-700 text-primary-app" style={{ fontWeight: 700 }}>
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function PerformanceSummary() {
  const { stats } = useTradingStore();
  const { winRate, profitFactor, totalTrades, bestTrade } = stats;

  const gain = ((data[data.length - 1].value - data[0].value) / data[0].value * 100).toFixed(2);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(77,184,255,0.08)' }}
          >
            <TrendingUp size={13} style={{ color: '#4DB8FF' }} />
          </div>
          <h3 className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>
            Performance
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-600 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 600 }}
          >
            +{gain}%
          </span>
          <span className="text-xs text-tertiary">This Month</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[88px] px-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4DB8FF" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#4DB8FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
              dy={4}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(77,184,255,0.2)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4DB8FF"
              strokeWidth={1.8}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#4DB8FF', stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-4 divide-x px-0"
        style={{ borderTop: '1px solid var(--border-default)', divideColor: 'var(--border-default)' }}
      >
        {[
          { label: 'Win Rate', value: `${winRate}%` },
          { label: 'Profit Factor', value: profitFactor },
          { label: 'Trades', value: totalTrades },
          { label: 'Best', value: `+$${bestTrade}`, accent: true },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center py-3 px-1"
            style={{ borderRight: '1px solid var(--border-default)' }}>
            <p
              className="text-sm font-700 font-number leading-none"
              style={{ fontWeight: 700, color: s.accent ? '#22c55e' : 'var(--text-primary)' }}
            >
              {s.value}
            </p>
            <p className="text-[10px] text-tertiary mt-1 text-center leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
