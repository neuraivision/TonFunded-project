import { create } from 'zustand';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  isLoading: boolean;
  lastRefreshed: string;
  currentUserRank: number;

  setPeriod: (period: LeaderboardPeriod) => void;
  refresh: () => Promise<void>;
}

// ─── Mock leaderboard data ────────────────────────────────────────────────────

const mockEntries: LeaderboardEntry[] = [
  { rank: 1, userId: 'u_001', displayName: 'AlphaWolf', country: 'US', accountSize: 25000, profitPct: 18.42, profitUsd: 4605, winRate: 74, totalTrades: 31, challengeTier: 'Pro', streakDays: 7, avatarColor: '#F59E0B', avatarInitials: 'AW' },
  { rank: 2, userId: 'u_002', displayName: 'TonTrader', country: 'RU', accountSize: 50000, profitPct: 16.91, profitUsd: 8455, winRate: 68, totalTrades: 44, challengeTier: 'Expert', streakDays: 5, avatarColor: '#8B5CF6', avatarInitials: 'TT' },
  { rank: 3, userId: 'u_003', displayName: 'JettonKing', country: 'DE', accountSize: 10000, profitPct: 15.33, profitUsd: 1533, winRate: 71, totalTrades: 19, challengeTier: 'Growth', streakDays: 9, avatarColor: '#10B981', avatarInitials: 'JK' },
  { rank: 4, userId: 'u_004', displayName: 'CryptoNova', country: 'SG', accountSize: 25000, profitPct: 13.88, profitUsd: 3470, winRate: 65, totalTrades: 28, challengeTier: 'Pro', streakDays: 4, avatarColor: '#EF4444', avatarInitials: 'CN' },
  { rank: 5, userId: 'u_005', displayName: 'MoonSniper', country: 'GB', accountSize: 10000, profitPct: 12.74, profitUsd: 1274, winRate: 63, totalTrades: 22, challengeTier: 'Growth', streakDays: 3, avatarColor: '#3B82F6', avatarInitials: 'MS' },
  { rank: 6, userId: 'u_006', displayName: 'DeFiMaster', country: 'AE', accountSize: 50000, profitPct: 11.52, profitUsd: 5760, winRate: 60, totalTrades: 51, challengeTier: 'Expert', streakDays: 6, avatarColor: '#F97316', avatarInitials: 'DM' },
  { rank: 7, userId: 'u_007', displayName: 'TonPulse', country: 'PL', accountSize: 5000, profitPct: 10.88, profitUsd: 544, winRate: 67, totalTrades: 15, challengeTier: 'Starter', streakDays: 2, avatarColor: '#06B6D4', avatarInitials: 'TP' },
  { rank: 8, userId: 'u_008', displayName: 'BlockChaser', country: 'CA', accountSize: 25000, profitPct: 9.91, profitUsd: 2477, winRate: 58, totalTrades: 36, challengeTier: 'Pro', streakDays: 1, avatarColor: '#84CC16', avatarInitials: 'BC' },
  { rank: 9, userId: 'u_009', displayName: 'StellarFin', country: 'BR', accountSize: 10000, profitPct: 9.14, profitUsd: 914, winRate: 62, totalTrades: 18, challengeTier: 'Growth', streakDays: 4, avatarColor: '#EC4899', avatarInitials: 'SF' },
  {
    rank: 10,
    userId: 'u_me',
    displayName: 'You',
    country: 'NG',
    accountSize: 10000,
    profitPct: 8.0,
    profitUsd: 800,
    winRate: 62,
    totalTrades: 24,
    challengeTier: 'Starter',
    streakDays: 3,
    avatarColor: '#4DB8FF',
    avatarInitials: 'ME',
    isCurrentUser: true,
  },
  { rank: 11, userId: 'u_011', displayName: 'GainSeeker', country: 'KR', accountSize: 5000, profitPct: 7.64, profitUsd: 382, winRate: 55, totalTrades: 12, challengeTier: 'Starter', streakDays: 0, avatarColor: '#64748B', avatarInitials: 'GS' },
  { rank: 12, userId: 'u_012', displayName: 'PumpDetect', country: 'NL', accountSize: 50000, profitPct: 6.99, profitUsd: 3495, winRate: 53, totalTrades: 62, challengeTier: 'Expert', streakDays: 2, avatarColor: '#A78BFA', avatarInitials: 'PD' },
  { rank: 13, userId: 'u_013', displayName: 'TonViking', country: 'SE', accountSize: 25000, profitPct: 6.41, profitUsd: 1602, winRate: 57, totalTrades: 29, challengeTier: 'Pro', streakDays: 1, avatarColor: '#FB923C', avatarInitials: 'TV' },
  { rank: 14, userId: 'u_014', displayName: 'AltReaper', country: 'AU', accountSize: 10000, profitPct: 5.88, profitUsd: 588, winRate: 50, totalTrades: 24, challengeTier: 'Growth', streakDays: 0, avatarColor: '#4ADE80', avatarInitials: 'AR' },
  { rank: 15, userId: 'u_015', displayName: 'JetPilot', country: 'IN', accountSize: 5000, profitPct: 5.12, profitUsd: 256, winRate: 52, totalTrades: 10, challengeTier: 'Starter', streakDays: 2, avatarColor: '#F43F5E', avatarInitials: 'JP' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: mockEntries,
  period: 'weekly',
  isLoading: false,
  lastRefreshed: new Date().toISOString(),
  currentUserRank: 10,

  setPeriod: (period) => {
    // In a real app each period fetches a different dataset.
    // Here we shuffle profits slightly to simulate period differences.
    const shuffled = mockEntries.map((e) => ({
      ...e,
      profitPct: parseFloat((e.profitPct * (period === 'alltime' ? 3.2 : period === 'monthly' ? 1.8 : 1)).toFixed(2)),
      profitUsd: parseFloat((e.profitUsd * (period === 'alltime' ? 3.2 : period === 'monthly' ? 1.8 : 1)).toFixed(0)),
    }));
    set({ period, entries: shuffled });
  },

  refresh: async () => {
    set({ isLoading: true });
    await new Promise<void>((resolve) => setTimeout(resolve, 900));
    // Simulate minor ranking shifts on refresh
    const refreshed = mockEntries.map((e) => ({
      ...e,
      profitPct: parseFloat((e.profitPct + (Math.random() - 0.5) * 0.4).toFixed(2)),
    }));
    set({ isLoading: false, entries: refreshed, lastRefreshed: new Date().toISOString() });
  },
}));
