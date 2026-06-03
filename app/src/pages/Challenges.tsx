import { useState } from 'react';
import { useChallengeStore, CHALLENGE_TIERS } from '@/stores/challengeStore';
import { Zap, CheckCircle, TrendingUp, Shield, Calendar, Target, ChevronRight, Star } from 'lucide-react';

const TIER_STYLES: Record<string, {
  gradient: string;
  border: string;
  badge: string;
  badgeText: string;
  icon: string;
  glow: string;
}> = {
  starter: {
    gradient: 'linear-gradient(135deg, #e8f5fd 0%, #f0f8ff 100%)',
    border: 'rgba(77,184,255,0.3)',
    badge: 'rgba(77,184,255,0.12)',
    badgeText: '#2aa8f2',
    icon: '🌱',
    glow: 'rgba(77,184,255,0.15)',
  },
  growth: {
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #f6fff9 100%)',
    border: 'rgba(34,197,94,0.3)',
    badge: 'rgba(34,197,94,0.1)',
    badgeText: '#16a34a',
    icon: '📈',
    glow: 'rgba(34,197,94,0.12)',
  },
  pro: {
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fffdf5 100%)',
    border: 'rgba(245,158,11,0.35)',
    badge: 'rgba(245,158,11,0.12)',
    badgeText: '#b45309',
    icon: '⚡',
    glow: 'rgba(245,158,11,0.12)',
  },
  expert: {
    gradient: 'linear-gradient(135deg, #faf5ff 0%, #fdf8ff 100%)',
    border: 'rgba(168,85,247,0.3)',
    badge: 'rgba(168,85,247,0.1)',
    badgeText: '#7c3aed',
    icon: '👑',
    glow: 'rgba(168,85,247,0.12)',
  },
  elite: {
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fff5fb 100%)',
    border: 'rgba(236,72,153,0.3)',
    badge: 'rgba(236,72,153,0.1)',
    badgeText: '#be185d',
    icon: '🏆',
    glow: 'rgba(236,72,153,0.12)',
  },
};

export default function Challenges() {
  const { activeChallenge, selectedTierId, selectTier, purchaseChallenge } = useChallengeStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePurchase = () => {
    if (!selectedTierId) return;
    purchaseChallenge();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="px-4 pt-4 pb-28 page-enter">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-700 text-primary-app leading-tight" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
          Evaluation Tiers
        </h2>
        <p className="text-sm text-secondary mt-1">Choose your challenge size and start trading</p>
      </div>

      {/* Active Challenge Progress */}
      {activeChallenge && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(77,184,255,0.1), rgba(42,168,242,0.05))',
            border: '1px solid rgba(77,184,255,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(77,184,255,0.15)' }}
              >
                <Zap size={15} className="text-accent-app" />
              </div>
              <div>
                <p className="text-sm font-700 text-accent-app" style={{ fontWeight: 700 }}>
                  {activeChallenge.tierName} — Phase {activeChallenge.phase}
                </p>
                <p className="text-[11px] text-tertiary">{activeChallenge.progress.tradingDays}/{activeChallenge.progress.minTradingDays} days traded</p>
              </div>
            </div>
            <span className="text-sm font-number font-700 text-accent-app" style={{ fontWeight: 700 }}>
              {activeChallenge.progress.percentComplete}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill progress-fill-accent"
              style={{ width: `${activeChallenge.progress.percentComplete}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-tertiary">
              P&L: ${activeChallenge.progress.profitCurrent.toLocaleString()} / ${activeChallenge.progress.profitTarget.toLocaleString()}
            </p>
            <button className="text-[11px] font-600 text-accent-app flex items-center gap-1">
              View details <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="toast-enter fixed top-4 left-4 right-4 z-[100] rounded-2xl p-4 flex items-center gap-3"
          style={{ background: '#fff', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 16px rgba(34,197,94,0.15)' }}>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>Challenge Purchased!</p>
            <p className="text-xs text-secondary">Your evaluation has started. Good luck!</p>
          </div>
        </div>
      )}

      {/* Challenge Tiers Grid */}
      <div className="space-y-3">
        {CHALLENGE_TIERS.map((tier) => {
          const style = TIER_STYLES[tier.id] || TIER_STYLES.starter;
          const isSelected = selectedTierId === tier.id;

          return (
            <div
              key={tier.id}
              onClick={() => selectTier(tier.id)}
              className="rounded-2xl p-4 cursor-pointer transition-all duration-200"
              style={{
                background: isSelected ? style.gradient : 'var(--bg-card)',
                border: `1.5px solid ${isSelected ? style.border : 'var(--border-card)'}`,
                boxShadow: isSelected
                  ? `0 4px 20px ${style.glow}, 0 2px 8px rgba(0,0,0,0.06)`
                  : 'var(--shadow-card)',
                transform: isSelected ? 'scale(1.005)' : 'scale(1)',
              }}
            >
              {/* Top row: badge + price */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{style.icon}</span>
                  <div>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-700"
                      style={{
                        background: style.badge,
                        color: style.badgeText,
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {tier.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-number text-xl font-700 text-primary-app leading-tight" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                    ${tier.fee}
                  </p>
                  <p className="text-[10px] text-tertiary">eval fee</p>
                </div>
              </div>

              {/* Account size */}
              <p className="font-number text-2xl font-700 text-primary-app mb-0.5" style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
                ${tier.accountSize.toLocaleString()}
              </p>
              <p className="text-xs text-secondary mb-3">Trading Capital</p>

              {/* Rules - compact 2-col grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                {[
                  { icon: TrendingUp, label: 'Profit Target', value: `${tier.profitTarget}%`, color: style.badgeText },
                  { icon: Target, label: 'Daily Loss Max', value: `${tier.maxDailyLoss}%`, color: '#dc2626' },
                  { icon: Shield, label: 'Overall Loss Max', value: `${tier.maxOverallLoss}%`, color: '#dc2626' },
                  { icon: Calendar, label: 'Min Trading Days', value: `${tier.minTradingDays} days`, color: 'var(--text-secondary)' },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <rule.icon size={12} style={{ color: rule.color, flexShrink: 0 }} />
                    <span className="text-[11px] text-secondary">{rule.label}: <span className="font-600 text-primary-app">{rule.value}</span></span>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] text-secondary">80% profit split</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-700 transition-all ${
                    isSelected ? 'text-white' : ''
                  }`}
                  style={
                    isSelected
                      ? { background: style.badgeText, boxShadow: `0 2px 8px ${style.glow}` }
                      : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                  }
                >
                  {isSelected ? (
                    <>
                      <CheckCircle size={12} />
                      Selected
                    </>
                  ) : (
                    <>Select <ChevronRight size={11} /></>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky purchase button */}
      {selectedTierId && (() => {
        const tier = CHALLENGE_TIERS.find(t => t.id === selectedTierId);
        return (
          <div className="fixed bottom-16 left-4 right-4 z-40 max-w-lg mx-auto">
            <button
              onClick={handlePurchase}
              className="btn-primary !py-4 text-base"
              style={{ boxShadow: '0 8px 24px rgba(77,184,255,0.35), 0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <Zap size={18} />
              Purchase {tier?.name} Challenge — ${tier?.fee}
            </button>
          </div>
        );
      })()}
    </div>
  );
}
