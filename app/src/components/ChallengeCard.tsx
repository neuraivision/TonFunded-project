import { Check, Target, Shield, Calendar, TrendingUp, Zap } from 'lucide-react';
import type { ChallengeTier } from '@/types';

interface Props {
  tier: ChallengeTier;
  isSelected: boolean;
  onSelect: () => void;
}

const TIER_META: Record<string, { emoji: string; gradient: string; border: string }> = {
  starter:  { emoji: '🌱', gradient: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/10',     border: 'border-gray-200 dark:border-white/8' },
  advanced: { emoji: '⚡', gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10',       border: 'border-blue-100 dark:border-blue-800/30' },
  pro:      { emoji: '🚀', gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/10', border: 'border-purple-100 dark:border-purple-800/30' },
  whale:    { emoji: '🐋', gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10',  border: 'border-amber-100 dark:border-amber-800/30' },
};

export default function ChallengeCard({ tier, isSelected, onSelect }: Props) {
  const meta = TIER_META[tier.id] ?? TIER_META['starter'];

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer
        bg-gradient-to-br ${meta.gradient}
        ${isSelected ? 'border-accent-app shadow-[0_0_0_3px_rgba(77,184,255,0.15)]' : meta.border}
      `}
      onClick={onSelect}
    >
      {/* Top bar */}
      <div className={`px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-primary-app">${tier.accountSize.toLocaleString()}</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tier.badgeBg, color: tier.badgeText }}
                >
                  {tier.name}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">Trading Capital</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-app">${tier.fee}</p>
            <p className="text-[11px] text-secondary">one-time fee</p>
          </div>
        </div>

        {/* Rules grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: TrendingUp, label: 'Profit Target', value: `${tier.profitTarget}%`,    color: 'text-green-600' },
            { icon: Target,     label: 'Max Daily Loss', value: `${tier.maxDailyLoss}%`,   color: 'text-red-500' },
            { icon: Shield,     label: 'Max Overall',    value: `${tier.maxOverallLoss}%`, color: 'text-orange-500' },
            { icon: Calendar,   label: 'Min Days',       value: `${tier.minTradingDays}d`, color: 'text-blue-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2 bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2">
              <Icon size={12} className={color} />
              <div>
                <p className="text-[9px] text-tertiary leading-none">{label}</p>
                <p className="text-xs font-bold text-primary-app mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Perks row */}
        <div className="flex items-center gap-3 mb-4">
          {['80% profit split', 'Weekly payouts', 'TON settlement'].map(perk => (
            <div key={perk} className="flex items-center gap-1">
              <Check size={11} className="text-green-500 flex-shrink-0" />
              <span className="text-[11px] text-secondary">{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
            ${isSelected
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-gradient-to-r from-[#4DB8FF] to-[#38a8f0] text-white shadow-[0_4px_14px_rgba(77,184,255,0.3)]'
            }`}
        >
          {isSelected ? (
            <><Check size={15} /> Selected</>
          ) : (
            <><Zap size={14} /> Select This Tier</>
          )}
        </button>
      </div>
    </div>
  );
}
