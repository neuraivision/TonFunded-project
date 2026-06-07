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
    fee: 59,
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
    fee: 109,
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
    fee: 229,
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
    fee: 399,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#f3e8ff',
    badgeText: '#7c3aed',
  },
  {
    id: 'elite',
    name: 'Elite',
    accountSize: 100000,
    fee: 749,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#fdf2f8',
    badgeText: '#db2777',
  },
  {
    id: 'legend',
    name: 'Legend',
    accountSize: 200000,
    fee: 1299,
    profitTarget: 10,
    maxDailyLoss: 5,
    maxOverallLoss: 10,
    minTradingDays: 5,
    badgeBg: '#eef2ff',
    badgeText: '#4f46e5',
  },
];

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  tiers: CHALLENGE_TIERS,
  // No funded account until the user buys a challenge — keeps the dashboard honest.
  activeChallenge: null,
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
