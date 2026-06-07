import { create } from 'zustand';
import type { PayoutRecord, PayoutStatus } from '@/types';
import { requestPayout as apiRequestPayout } from '@/lib/tonfunded';
import { useChallengeStore } from '@/stores/challengeStore';

interface PayoutState {
  records: PayoutRecord[];
  traderSplitPct: number;
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string;

  requestPayout: (amountRequested: number, walletAddress: string) => Promise<void>;
  calculateSplit: (grossAmount: number) => { traderAmount: number; companyAmount: number; traderPct: number };
  clearSubmitState: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);
const generateTxHash = () => Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const initialRecords: PayoutRecord[] = [
  {
    id: 'pay_1',
    requestedAt: daysAgo(7),
    processedAt: daysAgo(6),
    amountRequested: 800.0,
    amountAfterSplit: 640.0,
    traderSplitPct: 80,
    status: 'completed',
    walletAddress: 'EQDk...f4aZ',
    txHash: generateTxHash(),
  },
  {
    id: 'pay_2',
    requestedAt: daysAgo(35),
    processedAt: daysAgo(34),
    amountRequested: 500.0,
    amountAfterSplit: 400.0,
    traderSplitPct: 80,
    status: 'completed',
    walletAddress: 'EQDk...f4aZ',
    txHash: generateTxHash(),
  },
  {
    id: 'pay_3',
    requestedAt: daysAgo(2),
    amountRequested: 300.0,
    amountAfterSplit: 240.0,
    traderSplitPct: 80,
    status: 'processing',
    walletAddress: 'EQDk...f4aZ',
  },
];

export const usePayoutStore = create<PayoutState>((set, get) => ({
  records: initialRecords,
  traderSplitPct: 80,
  isSubmitting: false,
  submitSuccess: false,
  submitError: '',

  requestPayout: async (amountRequested, walletAddress) => {
    if (!walletAddress.trim()) {
      set({ submitError: 'Please enter a valid TON wallet address.' });
      return;
    }
    if (amountRequested <= 0) {
      set({ submitError: 'Please enter a valid amount.' });
      return;
    }
    if (amountRequested < 50) {
      set({ submitError: 'Minimum payout amount is $50.00.' });
      return;
    }

    set({ isSubmitting: true, submitError: '' });

    // Send the real request when there's an active backend challenge; the
    // server validates the amount against realized profit and the tier's split.
    const challengeId = useChallengeStore.getState().activeChallenge?.id;
    if (challengeId) {
      try {
        await apiRequestPayout(challengeId, amountRequested);
      } catch (e) {
        set({ isSubmitting: false, submitError: (e as Error).message || 'Payout request failed.' });
        return;
      }
    } else {
      // No backend session (preview/demo) → simulate latency.
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    }

    const { traderSplitPct } = get();
    const newRecord: PayoutRecord = {
      id: `pay_${generateId()}`,
      requestedAt: new Date().toISOString(),
      amountRequested,
      amountAfterSplit: parseFloat((amountRequested * (traderSplitPct / 100)).toFixed(2)),
      traderSplitPct,
      status: 'pending' as PayoutStatus,
      walletAddress,
    };

    set((state) => ({
      records: [newRecord, ...state.records],
      isSubmitting: false,
      submitSuccess: true,
    }));

    setTimeout(() => set({ submitSuccess: false }), 3000);
  },

  calculateSplit: (grossAmount) => {
    const { traderSplitPct } = get();
    const traderAmount = parseFloat((grossAmount * (traderSplitPct / 100)).toFixed(2));
    const companyAmount = parseFloat((grossAmount - traderAmount).toFixed(2));
    return { traderAmount, companyAmount, traderPct: traderSplitPct };
  },

  clearSubmitState: () => set({ submitSuccess: false, submitError: '', isSubmitting: false }),
}));
