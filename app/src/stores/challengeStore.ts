import { create } from 'zustand';
import type { ChallengeTier, Challenge, ChallengeProgress } from '@/types';

interface ChallengeState {
  tiers: ChallengeTier[];
  activeChallenge: Challenge | null;
  selectedTierId: string | null;

  // Actions
  selectTier: (id: string) => void;
  purchaseChallenge: () => void;
  updateProgress: (progress: Partial<ChallengeProgress>) => void;
  resetChallenge: () => void;
}

export const CHALLENGE_TIERS: ChallengeTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    accountSize: 5000,
    fee: 50,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#e8f5fd',
    badgeText: '#4DB8FF',
  },
  {
    id: 'growth',
    name: 'Growth',
    accountSize: 10000,
    fee: 90,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#ecfdf5',
    badgeText: '#16a34a',
  },
  {
    id: 'pro',
    name: 'Pro',
    accountSize: 25000,
    fee: 199,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#fef3c7',
    badgeText: '#d97706',
  },
  {
    id: 'expert',
    name: 'Expert',
    accountSize: 50000,
    fee: 349,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#f3e8ff',
    badgeText: '#7c3aed',
  },
];

const generateId = () => Math.random().toString(36).substring(2, 10);

const initialChallenge: Challenge = {
  id: 'ch_1',
  tierId: 'starter',
  tierName: 'Starter',
  accountSize: 5000,
  phase: 1,
  status: 'active',
  progress: {
    tradingDays: 3,
    minTradingDays: 5,
    profitCurrent: 800,
    profitTarget: 1000,
    dailyLossCurrent: 200,
    dailyLossLimit: 500,
    maxLossCurrent: 400,
    maxLossLimit: 1000,
    percentComplete: 65,
  },
  startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
};

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  tiers: CHALLENGE_TIERS,
  activeChallenge: initialChallenge,
  selectedTierId: null,

  selectTier: (id) => set({ selectedTierId: id }),

  purchaseChallenge: () => {
    const tierId = get().selectedTierId;
    if (!tierId) return;
    const tier = get().tiers.find((t) => t.id === tierId);
    if (!tier) return;

    const newChallenge: Challenge = {
      id: generateId(),
      tierId: tier.id,
      tierName: tier.name,
      accountSize: tier.accountSize,
      phase: 1,
      status: 'active',
      progress: {
        tradingDays: 0,
        minTradingDays: tier.minTradingDays,
        profitCurrent: 0,
        profitTarget: tier.accountSize * (tier.profitTarget / 100),
        dailyLossCurrent: 0,
        dailyLossLimit: tier.accountSize * (tier.maxDailyLoss / 100),
        maxLossCurrent: 0,
        maxLossLimit: tier.accountSize * (tier.maxOverallLoss / 100),
        percentComplete: 0,
      },
      startedAt: new Date().toISOString(),
    };

    set({ activeChallenge: newChallenge, selectedTierId: null });
  },

  updateProgress: (progress) => {
    set((state) => {
      if (!state.activeChallenge) return state;
      return {
        activeChallenge: {
          ...state.activeChallenge,
          progress: { ...state.activeChallenge.progress, ...progress },
        },
      };
    });
  },

  resetChallenge: () => set({ activeChallenge: null, selectedTierId: null }),
}));
