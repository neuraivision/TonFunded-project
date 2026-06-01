import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
import { useTradingStore } from '@/stores/tradingStore';

const data = [
  { day: 'Mon', value: 10000 },
  { day: 'Tue', value: 10120 },
  { day: 'Wed', value: 10050 },
  { day: 'Thu', value: 10245 },
  { day: 'Fri', value: 10180 },
  { day: 'Sat', value: 10020 },
  { day: 'Sun', value: 9847 },
];

export default function PerformanceSummary() {
  const { winRate, profitFactor, totalTrades, bestTrade } = useTradingStore();

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-primary-app">Performance</h3>
        <span className="text-[13px] text-tertiary">This Month</span>
      </div>

      <div className="h-20 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4DB8FF" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#4DB8FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4DB8FF"
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-default">
        <div className="text-center">
          <p className="text-base font-semibold text-primary-app">{winRate}%</p>
          <p className="text-[11px] text-tertiary font-medium">Win Rate</p>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-primary-app">{profitFactor}</p>
          <p className="text-[11px] text-tertiary font-medium">Profit Factor</p>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-primary-app">{totalTrades}</p>
          <p className="text-[11px] text-tertiary font-medium">Trades</p>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-success-app">
            +${bestTrade}
          </p>
          <p className="text-[11px] text-tertiary font-medium">Best</p>
        </div>
      </div>
    </div>
  );
}
