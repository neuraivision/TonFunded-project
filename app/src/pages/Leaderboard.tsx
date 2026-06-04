import { useEffect } from 'react';
import { RefreshCw, Trophy, TrendingUp, Flame, Medal } from 'lucide-react';
import { useLeaderboardStore } from '@/stores/leaderboardStore';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types';

// ─── Country flag emoji helper ────────────────────────────────────────────────

function countryFlag(code: string): string {
  const offset = 127397;
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + offset))
    .join('');
}

// ─── Medal / rank display ─────────────────────────────────────────────────────

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return (
    <span className="text-sm font-bold text-tertiary w-7 text-center">
      #{rank}
    </span>
  );
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  Starter: { bg: 'bg-gray-100', text: 'text-gray-600' },
  Growth: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Pro: { bg: 'bg-purple-50', text: 'text-purple-600' },
  Expert: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

function TierBadge({ tier }: { tier: string }) {
  const colors = TIER_COLORS[tier] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
      {tier}
    </span>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
        entry.isCurrentUser
          ? 'bg-accent-light border border-accent-app'
          : isTop3
            ? 'bg-gray-50'
            : 'bg-white'
      }`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <RankDisplay rank={entry.rank} />
      </div>

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: entry.avatarColor }}
      >
        {entry.avatarInitials}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={`text-sm font-bold truncate ${entry.isCurrentUser ? 'text-accent-app' : 'text-primary-app'}`}>
            {entry.displayName}
            {entry.isCurrentUser && (
              <span className="text-[10px] font-semibold text-accent-app ml-1">(You)</span>
            )}
          </p>
          <span className="text-sm">{countryFlag(entry.country)}</span>
          <TierBadge tier={entry.challengeTier} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-tertiary">{entry.totalTrades} trades</span>
          <span className="text-[11px] text-tertiary">·</span>
          <span className={`text-[11px] font-medium ${entry.winRate >= 60 ? 'text-green-600' : 'text-secondary'}`}>
            {entry.winRate}% WR
          </span>
          {entry.streakDays > 0 && (
            <>
              <span className="text-[11px] text-tertiary">·</span>
              <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-600">
                <Flame size={10} />
                {entry.streakDays}d
              </span>
            </>
          )}
        </div>
      </div>

      {/* Profit */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-green-600">+{entry.profitPct.toFixed(2)}%</p>
        <p className="text-[11px] text-tertiary">
          ${entry.profitUsd >= 1000
            ? `${(entry.profitUsd / 1000).toFixed(1)}K`
            : entry.profitUsd.toFixed(0)}
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PERIOD_LABELS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
];

function formatRefreshed(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60_000);
  if (diff < 1) return 'Just now';
  if (diff === 1) return '1 min ago';
  return `${diff} mins ago`;
}

export default function Leaderboard() {
  const { entries, period, isLoading, lastRefreshed, currentUserRank, setPeriod, refresh } =
    useLeaderboardStore();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);
  const currentUser = entries.find((e) => e.isCurrentUser);

  return (
    <div className="px-4 pt-4 pb-6 page-enter">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-tertiary">Updated {formatRefreshed(lastRefreshed)}</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="w-9 h-9 rounded-full bg-white border border-default flex items-center justify-center active:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={`text-secondary ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* ── Period tabs ────────────────────────────────────────────────────── */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {PERIOD_LABELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              period === p.id ? 'bg-white text-primary-app shadow-sm' : 'text-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Your rank card ──────────────────────────────────────────────────── */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-accent-app/30 rounded-2xl px-5 py-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-accent-app">
              <Trophy size={18} className="text-accent-app" />
            </div>
            <div>
              <p className="text-xs text-secondary">Your Rank</p>
              <p className="text-xl font-bold text-accent-app">#{currentUserRank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary">Profit</p>
            <p className="text-lg font-bold text-green-600">+{currentUser.profitPct.toFixed(2)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary">Win Rate</p>
            <div className="flex items-center justify-end gap-1">
              <TrendingUp size={12} className="text-green-600" />
              <p className="text-base font-bold text-primary-app">{currentUser.winRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Podium top 3 ───────────────────────────────────────────────────── */}
      {top3.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Medal size={14} className="text-amber-500" />
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Top Performers</p>
          </div>
          <div className="space-y-2">
            {top3.map((entry) => (
              <LeaderboardRow key={entry.userId} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] text-tertiary font-medium">Ranks 4–{entries.length}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* ── Full list ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {rest.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </div>
      )}

      <p className="text-xs text-center text-tertiary mt-6">
        Rankings update every 15 minutes · Profit % measured from challenge start
      </p>
    </div>
  );
}
