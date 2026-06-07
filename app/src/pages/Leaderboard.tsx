import { useEffect } from 'react';
import { RefreshCw, Trophy, TrendingUp, Flame, Medal } from 'lucide-react';
import { useLeaderboardStore } from '@/stores/leaderboardStore';
import { useChallengeStore } from '@/stores/challengeStore';
import GetFundedGate from '@/components/GetFundedGate';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types';

function countryFlag(code: string): string {
  const offset = 127397;
  return code.toUpperCase().split('').map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join('');
}

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-700 text-tertiary w-7 text-center" style={{ fontWeight: 700 }}>#{rank}</span>;
}

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  Starter: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  Growth:  { bg: 'rgba(77,184,255,0.12)',  color: '#4DB8FF' },
  Pro:     { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc' },
  Expert:  { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  Elite:   { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
};

function TierBadge({ tier }: { tier: string }) {
  const s = TIER_STYLES[tier] ?? TIER_STYLES.Starter;
  return (
    <span
      className="text-[10px] font-700 px-1.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, fontWeight: 700 }}
    >
      {tier}
    </span>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
      style={{
        background: entry.isCurrentUser
          ? 'var(--bg-accent-light)'
          : isTop3
            ? 'var(--bg-surface)'
            : 'var(--bg-card)',
        border: entry.isCurrentUser
          ? '1px solid var(--border-accent)'
          : '1px solid var(--border-card)',
      }}
    >
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <RankDisplay rank={entry.rank} />
      </div>

      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-700 flex-shrink-0"
        style={{ backgroundColor: entry.avatarColor, fontWeight: 700 }}
      >
        {entry.avatarInitials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={`text-sm font-700 truncate ${entry.isCurrentUser ? 'text-accent-app' : 'text-primary-app'}`} style={{ fontWeight: 700 }}>
            {entry.displayName}
            {entry.isCurrentUser && (
              <span className="text-[10px] font-600 text-accent-app ml-1">(You)</span>
            )}
          </p>
          <span className="text-sm">{countryFlag(entry.country)}</span>
          <TierBadge tier={entry.challengeTier} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-tertiary">{entry.totalTrades} trades</span>
          <span className="text-[11px] text-tertiary">·</span>
          <span className={`text-[11px] font-500 ${entry.winRate >= 60 ? 'text-success-app' : 'text-secondary'}`}>
            {entry.winRate}% WR
          </span>
          {entry.streakDays > 0 && (
            <>
              <span className="text-[11px] text-tertiary">·</span>
              <span className="flex items-center gap-0.5 text-[11px] font-500 text-warning-app">
                <Flame size={10} />
                {entry.streakDays}d
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-number text-sm font-700 text-success-app" style={{ fontWeight: 700 }}>
          +{entry.profitPct.toFixed(2)}%
        </p>
        <p className="font-number text-[11px] text-tertiary">
          ${entry.profitUsd >= 1000 ? `${(entry.profitUsd / 1000).toFixed(1)}K` : entry.profitUsd.toFixed(0)}
        </p>
      </div>
    </div>
  );
}

const PERIOD_LABELS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'weekly',  label: 'This Week' },
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
  const { entries, period, isLoading, lastRefreshed, currentUserRank, setPeriod, refresh } = useLeaderboardStore();
  const activeChallenge = useChallengeStore((s) => s.activeChallenge);

  useEffect(() => { if (activeChallenge) refresh(); }, [refresh, activeChallenge]);

  if (!activeChallenge) {
    return (
      <GetFundedGate
        title="Leaderboard is locked"
        subtitle="See how you rank against other funded traders once you pass a challenge and get funded."
      />
    );
  }

  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);
  const currentUser = entries.find((e) => e.isCurrentUser);

  return (
    <div className="px-4 pt-4 pb-6 page-enter space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-tertiary">Updated {formatRefreshed(lastRefreshed)}</p>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:opacity-70 disabled:opacity-40 transition-opacity"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <RefreshCw size={15} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Period tabs */}
      <div className="tab-bar">
        {PERIOD_LABELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`tab-item ${period === p.id ? 'tab-item-active' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Your rank card */}
      {currentUser && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(77,184,255,0.1), rgba(42,168,242,0.05))',
            border: '1px solid rgba(77,184,255,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full border-2"
              style={{ background: 'var(--bg-card)', borderColor: '#4DB8FF' }}
            >
              <Trophy size={18} className="text-accent-app" />
            </div>
            <div>
              <p className="text-xs text-secondary">Your Rank</p>
              <p className="font-number text-xl font-700 text-accent-app" style={{ fontWeight: 700 }}>
                #{currentUserRank}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary">Profit</p>
            <p className="font-number text-lg font-700 text-success-app" style={{ fontWeight: 700 }}>
              +{currentUser.profitPct.toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary">Win Rate</p>
            <div className="flex items-center justify-end gap-1">
              <TrendingUp size={12} className="text-success-app" />
              <p className="font-number text-base font-700 text-primary-app" style={{ fontWeight: 700 }}>
                {currentUser.winRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Medal size={14} className="text-warning-app" />
            <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest" style={{ fontWeight: 700 }}>
              Top Performers
            </p>
          </div>
          <div className="space-y-2">
            {top3.map((entry) => <LeaderboardRow key={entry.userId} entry={entry} />)}
          </div>
        </div>
      )}

      {/* Divider */}
      {rest.length > 0 && (
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
          <span className="text-[11px] text-tertiary font-500">Ranks 4–{entries.length}</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
        </div>
      )}

      {/* Full list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {rest.map((entry) => <LeaderboardRow key={entry.userId} entry={entry} />)}
        </div>
      )}

      <p className="text-xs text-center text-tertiary mt-2">
        Rankings update every 15 minutes · Profit % from challenge start
      </p>
    </div>
  );
}
