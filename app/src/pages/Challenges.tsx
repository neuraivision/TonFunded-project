import { useState } from 'react';
import { useChallengeStore, CHALLENGE_TIERS } from '@/stores/challengeStore';
import {
  CheckCircle, TrendingUp, Shield, Calendar, Target,
  ChevronRight, Star, Zap, Trophy,
} from 'lucide-react';

const TIER_META: Record<string, { emoji: string; accentColor: string; accentBg: string; accentBorder: string }> = {
  starter: { emoji: '🌱', accentColor: '#4DB8FF', accentBg: 'rgba(77,184,255,0.07)',  accentBorder: 'rgba(77,184,255,0.2)' },
  growth:  { emoji: '📈', accentColor: '#22c55e', accentBg: 'rgba(34,197,94,0.07)',   accentBorder: 'rgba(34,197,94,0.2)'  },
  pro:     { emoji: '⚡',  accentColor: '#f59e0b', accentBg: 'rgba(245,158,11,0.07)', accentBorder: 'rgba(245,158,11,0.2)' },
  expert:  { emoji: '👑', accentColor: '#a855f7', accentBg: 'rgba(168,85,247,0.07)', accentBorder: 'rgba(168,85,247,0.2)' },
  elite:   { emoji: '🏆', accentColor: '#ec4899', accentBg: 'rgba(236,72,153,0.07)', accentBorder: 'rgba(236,72,153,0.2)' },
};

export default function Challenges() {
  const { activeChallenge, selectedTierId, selectTier, purchaseChallenge } = useChallengeStore();
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    if (!selectedTierId) return;
    purchaseChallenge();
    setPurchased(true);
    setTimeout(() => setPurchased(false), 3000);
  };

  const selectedTier = CHALLENGE_TIERS.find((t) => t.id === selectedTierId);

  return (
    <div className="pb-32 page-enter">

      {/* ── Header ───────────────────────────────────── */}
      <div
        className="px-4 pt-5 pb-5"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)' }}
      >
        <h2 className="text-[20px] mb-1" style={{ fontWeight: 800, color: 'var(--ink-1)', letterSpacing: '-0.03em' }}>
          Evaluation Tiers
        </h2>
        <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
          Choose your challenge — trade your way to funded status
        </p>

        {/* Active challenge pill */}
        {activeChallenge && (
          <div
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(77,184,255,0.07)', border: '1px solid rgba(77,184,255,0.18)' }}
          >
            <Activity_icon />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-700" style={{ fontWeight: 700, color: 'var(--ton)' }}>
                {activeChallenge.tierName} · Phase {activeChallenge.phase} Active
              </p>
              <div className="progress-track mt-1.5">
                <div
                  className="progress-fill progress-fill-accent"
                  style={{ width: `${Math.min(100, activeChallenge.progress.percentComplete)}%` }}
                />
              </div>
            </div>
            <span className="font-number text-xs font-700" style={{ color: 'var(--ton)', fontWeight: 700 }}>
              {activeChallenge.progress.percentComplete}%
            </span>
          </div>
        )}
      </div>

      {/* ── Tier cards ───────────────────────────────── */}
      <div className="px-4 pt-4 space-y-3">
        {CHALLENGE_TIERS.map((tier) => {
          const meta = TIER_META[tier.id] ?? TIER_META.starter;
          const isSelected = selectedTierId === tier.id;

          return (
            <div
              key={tier.id}
              onClick={() => selectTier(tier.id)}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
              style={{
                background: 'var(--bg-card)',
                border: `1.5px solid ${isSelected ? meta.accentColor : 'var(--line-card)'}`,
                boxShadow: isSelected
                  ? `0 4px 20px ${meta.accentBg}, 0 0 0 1px ${meta.accentBorder}`
                  : 'var(--sh-card)',
                transform: isSelected ? 'scale(1.005)' : 'scale(1)',
              }}
            >
              {/* Color top bar */}
              <div
                className="h-[3px] w-full"
                style={{ background: meta.accentColor, opacity: isSelected ? 1 : 0.35 }}
              />

              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{meta.emoji}</span>
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                      style={{
                        fontWeight: 700, letterSpacing: '0.04em',
                        background: meta.accentBg,
                        color: meta.accentColor,
                        border: `1px solid ${meta.accentBorder}`,
                      }}
                    >
                      {tier.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-number text-xl leading-none" style={{ fontWeight: 800, color: 'var(--ink-1)', letterSpacing: '-0.04em' }}>
                      ${tier.fee}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-3)' }}>eval fee</p>
                  </div>
                </div>

                {/* Account size */}
                <p className="font-number text-[28px] leading-none mb-0.5" style={{ fontWeight: 800, color: 'var(--ink-1)', letterSpacing: '-0.045em' }}>
                  ${tier.accountSize.toLocaleString()}
                </p>
                <p className="text-[11px] mb-4" style={{ color: 'var(--ink-3)' }}>Trading Capital</p>

                {/* Rules grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                  {[
                    { icon: TrendingUp, label: 'Profit Target',  value: `${tier.profitTarget}%`,    color: meta.accentColor },
                    { icon: Target,     label: 'Daily Loss Max', value: `${tier.maxDailyLoss}%`,    color: 'var(--ink-down)' },
                    { icon: Shield,     label: 'Max Drawdown',   value: `${tier.maxOverallLoss}%`,  color: 'var(--ink-down)' },
                    { icon: Calendar,   label: 'Min Days',       value: `${tier.minTradingDays}d`,  color: 'var(--ink-2)' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-1.5">
                      <r.icon size={11} style={{ color: r.color, flexShrink: 0 }} />
                      <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                        {r.label}: <strong style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{r.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid var(--line)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[11px]" style={{ color: 'var(--ink-2)' }}>80% profit split</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all"
                    style={isSelected
                      ? { background: meta.accentColor, color: '#fff', fontWeight: 700 }
                      : { background: 'var(--bg-sunken)', color: 'var(--ink-3)', border: '1px solid var(--line)', fontWeight: 500 }
                    }
                  >
                    {isSelected ? <><CheckCircle size={11} /> Selected</> : <>Select <ChevronRight size={11} /></>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sticky purchase button ───────────────────── */}
      {selectedTierId && selectedTier && (
        <div
          className="fixed bottom-[56px] left-0 right-0 max-w-lg mx-auto px-4 py-3 z-40"
          style={{ background: 'linear-gradient(to top, var(--bg-app) 60%, transparent)', paddingBottom: '16px' }}
        >
          <button
            onClick={handlePurchase}
            className="btn-primary !py-4 text-[15px]"
          >
            {purchased ? (
              <><CheckCircle size={17} /> Challenge Purchased!</>
            ) : (
              <><Zap size={17} /> Purchase {selectedTier.name} — ${selectedTier.fee}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Activity_icon() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(77,184,255,0.15)' }}
    >
      <Trophy size={14} style={{ color: 'var(--ton)' }} />
    </div>
  );
}
