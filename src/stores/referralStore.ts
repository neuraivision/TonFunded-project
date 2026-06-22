import { create } from 'zustand';
import type { ReferralInfo } from '@/types';

interface ReferralState {
  info: ReferralInfo;
  linkCopied: boolean;

  copyReferralLink: () => void;
  resetCopied: () => void;
}

const initialInfo: ReferralInfo = {
  referralCode: 'TONFUND-X4K9',
  referralLink: 'https://t.me/TonFundedBot?start=TONFUND-X4K9',
  totalReferrals: 0,
  activeReferrals: 0,
  totalEarningsUsd: 0,
  pendingEarningsUsd: 0,
  commissionPct: 10,
  friends: [],
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
