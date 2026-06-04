import { useState } from 'react';
import { useChallengeStore, CHALLENGE_TIERS } from '@/stores/challengeStore';
import ChallengeCard from '@/components/ChallengeCard';
import { Zap, CheckCircle, Trophy, TrendingUp, Star } from 'lucide-react';

export default function Challenges() {
  const { activeChallenge, selectedTierId, selectTier, purchaseChallenge } = useChallengeStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selectedTierId || loading) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    purchaseChallenge();
    setLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  };

  const selectedTier = CHALLENGE_TIERS.find(t => t.id === selectedTierId);

  return (
    <div className="px-4 pt-4 pb-28 space-y-4 page-enter">

      {/* Success toast */}
      {showSuccess && (
        <div className="toast-enter fixed top-20 left-4 right-4 z-[100] bg-white dark:bg-[#1e1e1e] border border-green-100 dark:border-green-800/30 rounded-2xl shadow-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-app">Challenge Started! 🎉</p>
            <p className="text-xs text-secondary mt-0.5">Your evaluation is now live. Trade carefully!</p>
          </div>
        </div>
      )}

      {/* Active challenge banner */}
      {activeChallenge && (
        <div className="card-base bg-gradient-to-r from-[#4DB8FF]/10 to-cyan-50 dark:from-[#4DB8FF]/10 dark:to-cyan-900/10 border border-[#4DB8FF]/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-accent-app" />
              <span className="text-sm font-bold text-accent-app">Phase {activeChallenge.phase} in progress</span>
              <span className="text-[10px] font-bold bg-accent-app/10 text-accent-app px-2 py-0.5 rounded-full">
                {activeChallenge.tierName}
              </span>
            </div>
            <span className="text-sm font-bold text-accent-app">{activeChallenge.progress.percentComplete}%</span>
          </div>
          <div className="progress-track !h-2">
            <div className="progress-fill bg-gradient-to-r from-[#4DB8FF] to-cyan-400" style={{ width: `${activeChallenge.progress.percentComplete}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-secondary">
            <span>Day {activeChallenge.progress.tradingDays} of {activeChallenge.progress.minTradingDays}</span>
            <span>${activeChallenge.progress.profitCurrent.toFixed(0)} / ${activeChallenge.progress.profitTarget} profit</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-primary-app">Trading Challenges</h2>
        <p className="text-sm text-secondary mt-0.5">Pass evaluation to become a funded trader</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Trophy,     label: '1. Choose Tier',  color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
          { icon: TrendingUp, label: '2. Trade & Pass',  color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
          { icon: Star,       label: '3. Get Funded',    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="card-base !p-3 text-center">
            <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-1.5`}>
              <Icon size={14} />
            </div>
            <p className="text-[11px] font-bold text-primary-app leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Challenge tier cards */}
      <div className="space-y-3">
        {CHALLENGE_TIERS.map(tier => (
          <ChallengeCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTierId === tier.id}
            onSelect={() => selectTier(tier.id)}
          />
        ))}
      </div>

      {/* 80% split info */}
      <div className="card-base bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Star size={13} className="text-green-600" />
          <span className="text-sm font-bold text-green-700 dark:text-green-400">Your Profit Split</span>
        </div>
        <div className="flex gap-1.5 h-3 mb-2">
          <div className="flex-1 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">80% You</span>
          </div>
          <div className="w-[20%] bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-600 dark:text-white/50">20%</span>
          </div>
        </div>
        <p className="text-[11px] text-secondary">Keep 80% of all profits. Weekly payout requests available.</p>
      </div>

      {/* Sticky purchase button */}
      {selectedTierId && (
        <div className="fixed bottom-[64px] left-0 right-0 max-w-lg mx-auto px-4 pb-3 z-40 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-6">
          <button onClick={handlePurchase} disabled={loading} className="btn-primary !py-4">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Processing...
              </span>
            ) : `Start ${selectedTier?.name} Challenge — $${selectedTier?.fee}`}
          </button>
        </div>
      )}
    </div>
  );
}
