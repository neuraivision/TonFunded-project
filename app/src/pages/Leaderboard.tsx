import { useEffect } from 'react';
import { RefreshCw, Trophy, Flame, Crown } from 'lucide-react';
import { useLeaderboardStore } from '@/stores/leaderboardStore';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types';

function flag(code: string) {
  return code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

const TIER_COLORS: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  Growth:  'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  Pro:     'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  Expert:  'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

function Row({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  return (
    <div className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
      entry.isCurrentUser
        ? 'bg-accent-light border border-accent-app/40'
        : isTop3
        ? 'bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10 border border-amber-100/50 dark:border-amber-800/20'
        : 'bg-card-app border border-default'
    }`}>
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {entry.rank === 1 ? <span className="text-xl">🥇</span>
        : entry.rank === 2 ? <span className="text-xl">🥈</span>
        : entry.rank === 3 ? <span className="text-xl">🥉</span>
        : <span className="text-sm font-bold text-tertiary">#{entry.rank}</span>}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: entry.avatarColor }}
      >
        {entry.avatarInitials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold truncate ${entry.isCurrentUser ? 'text-accent-app' : 'text-primary-app'}`}>
            {entry.displayName}
          </span>
          {entry.isCurrentUser && <span className="badge bg-accent-app/10 text-accent-app text-[9px]">You</span>}
          <span className="text-sm">{flag(entry.country)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`badge text-[9px] ${TIER_COLORS[entry.challengeTier] ?? TIER_COLORS['Starter']}`}>
            {entry.challengeTier}
          </span>
          {entry.streakDays > 0 && (
            <div className="flex items-center gap-0.5">
              <Flame size={10} className="text-orange-400" />
              <span className="text-[10px] text-orange-500 font-semibold">{entry.streakDays}d</span>
            </div>
          )}
          <span className="text-[10px] text-tertiary">{entry.totalTrades} trades</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-green-600">+{entry.profitPct.toFixed(2)}%</p>
        <p className="text-[11px] text-tertiary">${entry.profitUsd.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { entries, period, isLoading, lastRefreshed, setPeriod, refresh } = useLeaderboardStore();
  const myEntry = entries.find(e => e.isCurrentUser);

  useEffect(() => { refresh(); }, [refresh]);

  const periods: { id: LeaderboardPeriod; label: string }[] = [
    { id: 'weekly', label: 'Week' },
    { id: 'monthly', label: 'Month' },
    { id: 'alltime', label: 'All Time' },
  ];

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 page-enter">

      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex bg-muted-app rounded-xl p-1 gap-1">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.id ? 'bg-card-app text-primary-app shadow-sm' : 'text-secondary'
              }`}
            >{p.label}</button>
          ))}
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="w-9 h-9 rounded-xl bg-muted-app flex items-center justify-center active:opacity-70"
        >
          <RefreshCw size={14} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 3 podium */}
      <div className="card bg-gradient-to-b from-amber-50/60 to-transparent dark:from-amber-900/10 dark:to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={15} className="text-amber-500" />
          <span className="text-sm font-bold text-primary-app">Top Traders</span>
          <span className="text-[11px] text-tertiary ml-auto">Updated {timeAgo(lastRefreshed)}</span>
        </div>
        <div className="flex items-end justify-center gap-3">
          {/* 2nd */}
          {top3[1] && (
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: top3[1].avatarColor }}>
                {top3[1].avatarInitials}
              </div>
              <span className="text-[11px] font-bold text-primary-app truncate max-w-[60px]">{top3[1].displayName}</span>
              <span className="text-xs font-bold text-green-600">+{top3[1].profitPct.toFixed(1)}%</span>
              <div className="w-full h-12 bg-gray-200 dark:bg-white/10 rounded-t-lg flex items-center justify-center">
                <span className="text-lg">🥈</span>
              </div>
            </div>
          )}
          {/* 1st */}
          {top3[0] && (
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-md ring-2 ring-amber-400" style={{ backgroundColor: top3[0].avatarColor }}>
                {top3[0].avatarInitials}
              </div>
              <span className="text-[11px] font-bold text-primary-app truncate max-w-[60px]">{top3[0].displayName}</span>
              <span className="text-xs font-bold text-green-600">+{top3[0].profitPct.toFixed(1)}%</span>
              <div className="w-full h-16 bg-amber-400/30 dark:bg-amber-500/20 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl">🥇</span>
              </div>
            </div>
          )}
          {/* 3rd */}
          {top3[2] && (
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: top3[2].avatarColor }}>
                {top3[2].avatarInitials}
              </div>
              <span className="text-[11px] font-bold text-primary-app truncate max-w-[60px]">{top3[2].displayName}</span>
              <span className="text-xs font-bold text-green-600">+{top3[2].profitPct.toFixed(1)}%</span>
              <div className="w-full h-8 bg-orange-200/50 dark:bg-orange-900/20 rounded-t-lg flex items-center justify-center">
                <span className="text-lg">🥉</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My rank */}
      {myEntry && (
        <div>
          <p className="text-xs font-semibold text-secondary mb-2">Your Ranking</p>
          <Row entry={myEntry} />
        </div>
      )}

      {/* Full list */}
      <div>
        <p className="text-xs font-semibold text-secondary mb-2">All Traders</p>
        <div className="space-y-2">
          {entries.map(e => <Row key={e.userId} entry={e} />)}
        </div>
      </div>

      <p className="text-center text-[11px] text-tertiary pt-2">
        <Trophy size={11} className="inline mr-1" />
        Rankings update every 24 hours
      </p>
    </div>
  );
}
