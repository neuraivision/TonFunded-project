import { Check, Target, Shield, Calendar, TrendingUp } from 'lucide-react';
import type { ChallengeTier } from '@/types';

interface Props {
  tier: ChallengeTier;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ChallengeCard({ tier, isSelected, onSelect }: Props) {
  return (
    <div className="card-base !p-5 transition-shadow">
      {/* Badge */}
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: tier.badgeBg, color: tier.badgeText }}
      >
        {tier.name}
      </span>

      {/* Account Size */}
      <p className="text-2xl font-bold text-primary-app mt-2">
        ${tier.accountSize.toLocaleString()}
      </p>
      <p className="text-xs text-secondary">Trading Capital</p>

      {/* Rules */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-app flex-shrink-0" />
          <span className="text-[13px] text-secondary">
            Profit Target: {tier.profitTarget}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target size={14} className="text-accent-app flex-shrink-0" />
          <span className="text-[13px] text-secondary">
            Max Daily Loss: {tier.maxDailyLoss}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-accent-app flex-shrink-0" />
          <span className="text-[13px] text-secondary">
            Max Overall Loss: {tier.maxOverallLoss}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-accent-app flex-shrink-0" />
          <span className="text-[13px] text-secondary">
            Min Trading Days: {tier.minTradingDays}
          </span>
        </div>
      </div>

      {/* Fee & CTA */}
      <div className="mt-4 pt-4 border-t border-default">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-secondary">Evaluation Fee</span>
          <span className="text-lg font-bold text-primary-app">${tier.fee}</span>
        </div>
        <button
          onClick={onSelect}
          className={`w-full py-3 rounded-full text-sm font-semibold transition-all ${
            isSelected
              ? 'bg-green-500 text-white'
              : 'btn-primary !w-full'
          }`}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check size={16} />
              Selected
            </span>
          ) : (
            'Select'
          )}
        </button>
      </div>
    </div>
  );
}
