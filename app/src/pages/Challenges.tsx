import { useState } from 'react';
import { useChallengeStore, CHALLENGE_TIERS } from '@/stores/challengeStore';
import { CheckCircle, Zap, TrendingUp, Shield, Clock, Star, Trophy } from 'lucide-react';

const TIER_META: Record<string, { emoji: string; gradient: string; border: string; selectedBorder: string }> = {
  starter:  { emoji: '🌱', gradient: 'from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/20',     border: 'border-gray-200 dark:border-white/8',   selectedBorder: 'border-accent-app' },
  advanced: { emoji: '⚡', gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/25 dark:to-cyan-900/15',       border: 'border-blue-100 dark:border-blue-800/30',  selectedBorder: 'border-accent-app' },
  pro:      { emoji: '🚀', gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/25 dark:to-violet-900/15', border: 'border-purple-100 dark:border-purple-800/30', selectedBorder: 'border-accent-app' },
  whale:    { emoji: '🐋', gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/25 dark:to-orange-900/15',  border: 'border-amber-100 dark:border-amber-800/30',  selectedBorder: 'border-accent-app' },
};

export default function Challenges() {
  const { activeChallenge, selectedTierId, selectTier, purchaseChallenge } = useChallengeStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selectedTierId || loading) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    purchaseChallenge();
    setLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  };

  return (
    <div className="px-4 pt-4 pb-28 space-y-4 page-enter">

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 z-[100] bg-card-app border border-green-200 dark:border-green-800/40 rounded-2xl shadow-lg p-4 flex items-center gap-3 toast-enter">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-app">Challenge Started! 🎉</p>
            <p className="text-xs text-secondary mt-0.5">Your evaluation is now live.</p>
          </div>
        </div>
      )}

      {/* Active challenge banner */}
      {activeChallenge && (
        <div className="bg-accent-light border border-accent-app/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-accent-app" />
              <span className="text-sm font-bold text-accent-app">Phase {activeChallenge.phase} Active</span>
              <span className="badge bg-accent-app/10 text-accent-app">{activeChallenge.tierName}</span>
            </div>
            <span className="text-sm font-bold text-accent-app">{activeChallenge.progress.percentComplete}%</span>
          </div>
          <div className="progress-track !h-1.5">
            <div className="progress-fill bg-accent-app" style={{ width: `${activeChallenge.progress.percentComplete}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-secondary">Day {activeChallenge.progress.tradingDays}/{activeChallenge.progress.minTradingDays}</span>
            <span className="text-[11px] text-secondary">${activeChallenge.progress.profitCurrent.toFixed(0)} / ${activeChallenge.progress.profitTarget} target</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-primary-app">Trading Challenges</h2>
        <p className="text-sm text-secondary mt-0.5">Pass evaluation → get funded → keep 80% profits</p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Trophy,     label: '1. Choose', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
          { icon: TrendingUp, label: '2. Trade',  color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
          { icon: Star,       label: '3. Funded', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="card !p-3 text-center">
            <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-1.5`}>
              <Icon size={14} />
            </div>
            <p className="text-[11px] font-bold text-primary-app">{label}</p>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <div className="space-y-3">
        {CHALLENGE_TIERS.map(tier => {
          const meta = TIER_META[tier.id] ?? TIER_META['starter'];
          const isSelected = selectedTierId === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => selectTier(tier.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 bg-gradient-to-br ${meta.gradient} ${isSelected ? meta.selectedBorder + ' shadow-accent-app' : meta.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <p className="text-base font-bold text-primary-app">${tier.accountSize.toLocaleString()}</p>
                    <p className="text-xs text-secondary">Trading Capital</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-app">${tier.fee}</p>
                  <p className="text-[11px] text-secondary">one-time fee</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { icon: TrendingUp, label: 'Profit Target', value: `${tier.profitTarget}%`,     color: 'text-green-600' },
                  { icon: Shield,     label: 'Max Daily Loss', value: `${tier.maxDailyLoss}%`,     color: 'text-red-500' },
                  { icon: Shield,     label: 'Max Overall',   value: `${tier.maxOverallLoss}%`,   color: 'text-orange-500' },
                  { icon: Clock,      label: 'Min Days',       value: `${tier.minTradingDays}d`,   color: 'text-blue-500' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2">
                    <Icon size={11} className={color} />
                    <div>
                      <p className="text-[9px] text-tertiary leading-none">{label}</p>
                      <p className="text-xs font-bold text-primary-app mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={11} className="text-green-500" />
                    <span className="text-[11px] text-secondary">80% split</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle size={11} className="text-green-500" />
                    <span className="text-[11px] text-secondary">Weekly payouts</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-accent-app bg-accent-app' : 'border-gray-300 dark:border-white/20'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 80% split bar */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star size={13} className="text-green-600" />
          <span className="text-sm font-bold text-green-700 dark:text-green-400">Your Profit Split</span>
        </div>
        <div className="flex gap-1.5 h-3">
          <div className="flex-1 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">80% You</span>
          </div>
          <div className="w-[20%] bg-gray-300 dark:bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-600 dark:text-white/50">20%</span>
          </div>
        </div>
        <p className="text-[11px] text-secondary mt-2">Keep 80% of all profits. Request payouts every week.</p>
      </div>

      {/* Purchase CTA */}
      {selectedTierId && (
        <div className="fixed bottom-[58px] left-0 right-0 max-w-lg mx-auto px-4 pb-3 z-40 bg-gradient-to-t from-primary-app via-primary-app to-transparent pt-4">
          <button onClick={handlePurchase} disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Processing...
              </span>
            ) : `Start Challenge — $${CHALLENGE_TIERS.find(t => t.id === selectedTierId)?.fee}`}
          </button>
        </div>
      )}
    </div>
  );
}
