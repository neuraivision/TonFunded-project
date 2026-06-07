import { create } from 'zustand';
import type { ReferralInfo } from '@/types';

interface ReferralState {
  info: ReferralInfo;
  linkCopied: boolean;

  copyReferralLink: () => void;
  resetCopied: () => void;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const initialInfo: ReferralInfo = {
  referralCode: 'TONFUND-X4K9',
  referralLink: 'https://t.me/TonFundedBot?start=TONFUND-X4K9',
  totalReferrals: 4,
  activeReferrals: 2,
  totalEarningsUsd: 28.5,
  pendingEarningsUsd: 9.0,
  commissionPct: 10,
  friends: [
    {
      id: 'rf_1',
      displayName: 'CryptoNova',
      joinedAt: daysAgo(3),
      hasPurchasedChallenge: true,
      earningsGenerated: 9.0,
      status: 'active',
    },
    {
      id: 'rf_2',
      displayName: 'MoonSniper',
      joinedAt: daysAgo(8),
      hasPurchasedChallenge: true,
      earningsGenerated: 19.5,
      status: 'earned',
    },
    {
      id: 'rf_3',
      displayName: 'DeFiNova',
      joinedAt: daysAgo(14),
      hasPurchasedChallenge: false,
      earningsGenerated: 0,
      status: 'pending',
    },
    {
      id: 'rf_4',
      displayName: 'TonLurker',
      joinedAt: daysAgo(21),
      hasPurchasedChallenge: false,
      earningsGenerated: 0,
      status: 'pending',
    },
  ],
};

export const useReferralStore = create<ReferralState>((set) => ({
  info: initialInfo,
  linkCopied: false,

  copyReferralLink: () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(initialInfo.referralLink).catch(() => {
        // Clipboard API not available in this context — silently ignore
      });
    }
    set({ linkCopied: true });
    setTimeout(() => set({ linkCopied: false }), 2500);
  },

  resetCopied: () => set({ linkCopied: false }),
}));
