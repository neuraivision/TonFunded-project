import { useState } from 'react';
import { useChallengeStore, CHALLENGE_TIERS } from '@/stores/challengeStore';
import ChallengeCard from '@/components/ChallengeCard';
import { Zap, CheckCircle } from 'lucide-react';

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
    <div className="px-4 pt-4 pb-8 space-y-5 page-enter">
      {/* Header */}
      <p className="text-sm text-secondary">Choose your evaluation tier</p>

      {/* Active Challenge Banner */}
      {activeChallenge && (
        <div className="bg-accent-light rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-accent-app" />
              <span className="text-sm font-semibold text-accent-app">
                Phase {activeChallenge.phase} in progress
              </span>
            </div>
            <span className="text-sm font-bold text-accent-app">
              {activeChallenge.progress.percentComplete}%
            </span>
          </div>
          <div className="progress-track mt-2 !h-1">
            <div
              className="progress-fill bg-accent-app"
              style={{ width: `${activeChallenge.progress.percentComplete}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="toast-enter fixed top-4 left-4 right-4 z-[100] bg-white border border-default rounded-xl shadow-lg p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary-app">Challenge Purchased!</p>
            <p className="text-xs text-secondary">Your evaluation has started</p>
          </div>
        </div>
      )}

      {/* Challenge Tiers */}
      <div className="space-y-3">
        {CHALLENGE_TIERS.map((tier) => (
          <ChallengeCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTierId === tier.id}
            onSelect={() => selectTier(tier.id)}
          />
        ))}
      </div>

      {/* Purchase Button */}
      {selectedTierId && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <button
            onClick={handlePurchase}
            className="btn-primary !py-4 shadow-lg"
          >
            Purchase Challenge
          </button>
        </div>
      )}
    </div>
  );
}
