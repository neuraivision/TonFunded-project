import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, Award, BarChart2 } from 'lucide-react';
import type { PerformanceStats } from '@/types';

interface Props {
  stats: PerformanceStats;
  /** Whether to show only the compact summary (for the Home page card) */
  compact?: boolean;
}

// ─── Custom tooltip for equity curve ─────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-default rounded-xl px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-primary-app">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Single stat tile ─────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  subValue,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className={color} />
        <span className="text-[11px] font-medium text-tertiary">{label}</span>
      </div>
      <p className={`text-base font-bold ${color}`}>{value}</p>
      {subValue && <p className="text-[11px] text-tertiary mt-0.5">{subValue}</p>}
    </div>
  );
}

export default function PerformanceAnalytics({ stats, compact = false }: Props) {
  const equityData = stats.equityCurve.length > 0
    ? stats.equityCurve
    : [
        { day: 'Mon', value: 10000, label: '$10,000' },
        { day: 'Tue', value: 10120, label: '$10,120' },
        { day: 'Wed', value: 10050, label: '$10,050' },
        { day: 'Thu', value: 10245, label: '$10,245' },
        { day: 'Fri', value: 10180, label: '$10,180' },
        { day: 'Sat', value: 10020, label: '$10,020' },
        { day: 'Sun', value: 9847, label: '$9,847' },
      ];

  const latestEquity = equityData[equityData.length - 1]?.value ?? 10000;
  const firstEquity = equityData[0]?.value ?? 10000;
  const curveUp = latestEquity >= firstEquity;
  const curveColor = curveUp ? '#16a34a' : '#dc2626';
  const curveGradientId = curveUp ? 'equityGradientGreen' : 'equityGradientRed';

  return (
    <div className="card-base space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary-app">Performance</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-tertiary">
            {stats.totalTrades} trades
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              stats.winRate >= 60
                ? 'bg-green-50 text-green-600'
                : stats.winRate >= 45
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-500'
            }`}
          >
            {stats.winRate}% WR
          </span>
        </div>
      </div>

      {/* Equity curve */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={curveGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={curveColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={curveColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={curveColor}
              strokeWidth={2}
              fill={`url(#${curveGradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: curveColor, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Primary stats row */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-default">
        <div className="text-center">
          <p className={`text-base font-bold ${stats.winRate >= 50 ? 'text-green-600' : 'text-red-500'}`}>
            {stats.winRate}%
          </p>
          <p className="text-[11px] text-tertiary">Win Rate</p>
        </div>
        <div className="text-center">
          <p className={`text-base font-bold ${stats.profitFactor >= 1.5 ? 'text-green-600' : stats.profitFactor >= 1 ? 'text-amber-600' : 'text-red-500'}`}>
            {stats.profitFactor.toFixed(2)}
          </p>
          <p className="text-[11px] text-tertiary">P. Factor</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-primary-app">{stats.totalTrades}</p>
          <p className="text-[11px] text-tertiary">Trades</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-green-600">+${stats.bestTrade}</p>
          <p className="text-[11px] text-tertiary">Best</p>
        </div>
      </div>

      {/* Expanded stats — hidden in compact mode */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <StatTile
            label="Avg Win"
            value={`+$${stats.avgWin.toFixed(2)}`}
            subValue={`${stats.winningTrades} wins`}
            color="text-green-600"
            icon={TrendingUp}
          />
          <StatTile
            label="Avg Loss"
            value={`-$${stats.avgLoss.toFixed(2)}`}
            subValue={`${stats.losingTrades} losses`}
            color="text-red-500"
            icon={TrendingDown}
          />
          <StatTile
            label="Best Trade"
            value={`+$${stats.bestTrade.toFixed(2)}`}
            color="text-green-600"
            icon={Award}
          />
          <StatTile
            label="Worst Trade"
            value={`-$${Math.abs(stats.worstTrade).toFixed(2)}`}
            color="text-red-500"
            icon={Target}
          />
          <StatTile
            label="Win Streak"
            value={`${stats.maxConsecutiveWins} trades`}
            color="text-accent-app"
            icon={Zap}
          />
          <StatTile
            label="Avg Duration"
            value={
              stats.avgDurationMinutes < 60
                ? `${stats.avgDurationMinutes}m`
                : `${Math.floor(stats.avgDurationMinutes / 60)}h ${stats.avgDurationMinutes % 60}m`
            }
            color="text-secondary"
            icon={BarChart2}
          />
        </div>
      )}
    </div>
  );
}
