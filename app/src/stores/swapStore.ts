import { create } from 'zustand';
import type {
  SwapToken,
  SwapQuote,
  SwapStatus,
  SwapHistoryItem,
  SwapState,
} from '@/types';
import { fetchStonfiMarket } from '@/lib/stonfi';

// ─── STON.fi token catalogue ──────────────────────────────────────────────────
//
// Real TON Jettons tradeable on STON.fi, keyed by their actual on-chain contract
// addresses. `usdPrice` and `logoUrl` are seeded with recent values so the UI
// renders instantly, then refreshed live from the STON.fi API via
// `refreshMarket()` (see below). `balance` is a demo holding for the challenge
// account; `priceChange24h`/`volume24hUsd` are indicative.

export const STONFI_TOKENS: SwapToken[] = [
  {
    symbol: 'TON',
    name: 'Toncoin',
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    decimals: 9,
    usdPrice: 1.56,
    balance: 124.5,
    priceChange24h: 2.34,
    volume24hUsd: 48200000,
    logoColor: '#0098EA',
    logoInitials: 'TON',
    logoUrl: 'https://asset.ston.fi/img/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/c8d21a3d93f9b574381e0a8d8f16d48b325dd8f54ce172f599c1e9d6c62f03f7',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    decimals: 6,
    usdPrice: 1.0,
    balance: 850.0,
    priceChange24h: 0.01,
    volume24hUsd: 124000000,
    logoColor: '#26A17B',
    logoInitials: 'US',
    logoUrl: 'https://asset.ston.fi/img/EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs/1a87edfee9a28b05578853952e5effb8cc30af1e0fb90043aa2ce19dce490849',
  },
  {
    symbol: 'NOT',
    name: 'Notcoin',
    address: 'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT',
    decimals: 9,
    usdPrice: 0.000375,
    balance: 180000,
    priceChange24h: -3.12,
    volume24hUsd: 9100000,
    logoColor: '#000000',
    logoInitials: 'NO',
    logoUrl: 'https://asset.ston.fi/img/EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT/c0dcf1d0e16604a22040bed2a5ec97765479fdba99538fa0bb5c243bb6220c5e',
  },
  {
    symbol: 'DOGS',
    name: 'Dogs',
    address: 'EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS',
    decimals: 9,
    usdPrice: 0.0000393,
    balance: 2450000,
    priceChange24h: 8.19,
    volume24hUsd: 3800000,
    logoColor: '#F6A623',
    logoInitials: 'DO',
    logoUrl: 'https://asset.ston.fi/img/EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS/b84413017d2b6a57d31daf1281245cb39a59e189a8a107047db39470a08c0c9e',
  },
  {
    symbol: 'CATI',
    name: 'Catizen',
    address: 'EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7',
    decimals: 9,
    usdPrice: 0.0466,
    balance: 5200,
    priceChange24h: 5.42,
    volume24hUsd: 2400000,
    logoColor: '#FF8A3D',
    logoInitials: 'CA',
    logoUrl: 'https://asset.ston.fi/img/EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7/7177e55473596c552cde4be5b94cc222ee229a49347f652303086b336cf188e8',
  },
  {
    symbol: 'REDO',
    name: 'Resistance Dog',
    address: 'EQBZ_cafPyDr5KUTs0aNxh0ZTDhkpEZONmLJA2SNGlLm4Cko',
    decimals: 9,
    usdPrice: 0.0572,
    balance: 4200,
    priceChange24h: -6.84,
    volume24hUsd: 1200000,
    logoColor: '#E74C3C',
    logoInitials: 'RE',
    logoUrl: 'https://asset.ston.fi/img/EQBZ_cafPyDr5KUTs0aNxh0ZTDhkpEZONmLJA2SNGlLm4Cko/88d0249592ca2d167bbd0045754810f33b573193934114d7cc9fd33d150667f3',
  },
  {
    symbol: 'MAJOR',
    name: 'Major',
    address: 'EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR',
    decimals: 9,
    usdPrice: 0.0435,
    balance: 6800,
    priceChange24h: 11.2,
    volume24hUsd: 2100000,
    logoColor: '#2E7D32',
    logoInitials: 'MA',
    logoUrl: 'https://asset.ston.fi/img/EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR/aea6edb39acc18a2958ed78165051844b8d4cec92b860866a25dd7f300a07e50',
  },
  {
    symbol: 'STON',
    name: 'STON',
    address: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
    decimals: 9,
    usdPrice: 0.514,
    balance: 480,
    priceChange24h: 3.1,
    volume24hUsd: 1500000,
    logoColor: '#1E88E5',
    logoInitials: 'ST',
    logoUrl: 'https://asset.ston.fi/img/EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO/7c9798ce1e64707fb4cb8f025d4060f66b386ed381b50498e3b88731cedeffe8',
  },
  {
    symbol: 'GRAM',
    name: 'Gram',
    address: 'EQBrDGesI9uyzGzVi3kjiRJt1k4Vf7iXVX7AQVQyEPvBYboQ',
    decimals: 9,
    usdPrice: 0.001103,
    balance: 95000,
    priceChange24h: 5.91,
    volume24hUsd: 5600000,
    logoColor: '#3498DB',
    logoInitials: 'GR',
    logoUrl: 'https://asset.ston.fi/img/EQBrDGesI9uyzGzVi3kjiRJt1k4Vf7iXVX7AQVQyEPvBYboQ/3890d78053fcad2f26eb51f8fd436ede2591d363a4e248b2290754edbb069792',
  },
  {
    symbol: 'JETTON',
    name: 'JetTon',
    address: 'EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon',
    decimals: 9,
    usdPrice: 0.0299,
    balance: 8400,
    priceChange24h: -1.8,
    volume24hUsd: 890000,
    logoColor: '#7C4DFF',
    logoInitials: 'JE',
    logoUrl: 'https://asset.ston.fi/img/EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon/8f3d0eaf65c9f877a21f0b102832b431c0df7a6b7788b8df9a57a4d0305320bf',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Look up a known token's visual metadata by symbol (case-insensitive). */
export function getTokenBySymbol(symbol: string): SwapToken | undefined {
  const s = symbol.trim().toUpperCase();
  return STONFI_TOKENS.find((t) => t.symbol.toUpperCase() === s);
}

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const generateTxHash = (): string =>
  Array.from({ length: 64 }, () =>
    '0123456789abcdef'[Math.floor(Math.random() * 16)],
  ).join('');

const generatePoolAddress = (fromSymbol: string, toSymbol: string): string =>
  `EQPool_${fromSymbol}_${toSymbol}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

/**
 * Simulates a realistic STON.fi AMM price impact calculation.
 * Uses a simplified constant-product formula where larger trades
 * relative to the pool size cause higher slippage.
 *
 * `tradeValueUsd` — USD value of the trade being simulated.
 * `poolVolumeUsd` — 24h volume of the token used as a proxy for pool size.
 *
 * Returns a percentage between 0.01 and 15.
 */
function calculatePriceImpact(tradeValueUsd: number, poolVolumeUsd: number): number {
  // Pool liquidity proxy: assume pool holds ~8x the daily volume as TVL
  const estimatedPoolTvl = poolVolumeUsd * 8;
  if (estimatedPoolTvl <= 0) return 5.0;
  // Simplified impact formula: (trade / pool) * 100 * dampening factor
  const rawImpact = (tradeValueUsd / estimatedPoolTvl) * 100 * 2.5;
  return Math.min(15, Math.max(0.01, parseFloat(rawImpact.toFixed(2))));
}

/**
 * Builds a display route path string.
 * For TON<->USDT pairs the route is direct.
 * For all other pairs the route hops through TON as the base asset.
 */
function buildRoutePath(fromSymbol: string, toSymbol: string): string {
  const directPairs = new Set([
    'TON-USDT',
    'USDT-TON',
    'TON-NOT',
    'NOT-TON',
    'TON-DOGS',
    'DOGS-TON',
    'TON-GRAM',
    'GRAM-TON',
  ]);
  const key = `${fromSymbol}-${toSymbol}`;
  if (directPairs.has(key)) {
    return `${fromSymbol} → ${toSymbol}`;
  }
  // Multi-hop through TON
  if (fromSymbol === 'USDT' || toSymbol === 'USDT') {
    return `${fromSymbol} → TON → ${toSymbol}`;
  }
  return `${fromSymbol} → TON → ${toSymbol}`;
}

/**
 * Core mock quote engine — deterministic given the inputs so that repeated
 * calls with the same parameters return consistent results within a session.
 *
 * Adds a ±2% random spread noise on top of the direct USD conversion so that
 * each new quote session looks like a live market update.
 */
function computeQuote(
  fromToken: SwapToken,
  toToken: SwapToken,
  fromAmountNum: number,
  slippage: number,
): SwapQuote {
  // Add a small random spread each quote call to simulate live market movement
  const spreadFactor = 1 + (Math.random() - 0.5) * 0.04; // ±2%
  const fromValueUsd = fromAmountNum * fromToken.usdPrice * spreadFactor;

  const priceImpact = calculatePriceImpact(
    fromValueUsd,
    Math.min(fromToken.volume24hUsd, toToken.volume24hUsd),
  );

  // Apply price impact to output
  const impactMultiplier = 1 - priceImpact / 100;
  const rawAskUsd = fromValueUsd * impactMultiplier;

  // STON.fi charges 0.3% protocol fee
  const feeUsd = fromValueUsd * 0.003;
  const netAskUsd = rawAskUsd - feeUsd;

  const askAmount = netAskUsd / toToken.usdPrice;
  const minAskAmount = askAmount * (1 - slippage / 100);
  const exchangeRate = askAmount / fromAmountNum;

  return {
    offerAmount: fromAmountNum,
    askAmount: parseFloat(askAmount.toFixed(toToken.decimals === 0 ? 0 : 6)),
    minAskAmount: parseFloat(minAskAmount.toFixed(toToken.decimals === 0 ? 0 : 6)),
    priceImpact: parseFloat(priceImpact.toFixed(2)),
    fee: parseFloat(feeUsd.toFixed(4)),
    exchangeRate: parseFloat(exchangeRate.toFixed(8)),
    routePath: buildRoutePath(fromToken.symbol, toToken.symbol),
    poolAddress: generatePoolAddress(fromToken.symbol, toToken.symbol),
  };
}

// ─── Initial defaults ─────────────────────────────────────────────────────────

const defaultFrom = STONFI_TOKENS.find((t) => t.symbol === 'TON')!;
const defaultTo = STONFI_TOKENS.find((t) => t.symbol === 'DOGS')!;

const initialSwapHistory: SwapHistoryItem[] = [
  {
    id: 'swap_hist_1',
    fromSymbol: 'TON',
    toSymbol: 'DOGS',
    fromAmount: 5,
    toAmount: 5948220,
    exchangeRate: 1189644,
    priceImpact: 0.12,
    fee: 0.0874,
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    txHash: generateTxHash(),
  },
  {
    id: 'swap_hist_2',
    fromSymbol: 'USDT',
    toSymbol: 'NOT',
    fromAmount: 200,
    toAmount: 24361,
    exchangeRate: 121.8,
    priceImpact: 0.31,
    fee: 0.6,
    executedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    txHash: generateTxHash(),
  },
  {
    id: 'swap_hist_3',
    fromSymbol: 'DOGS',
    toSymbol: 'USDT',
    fromAmount: 1000000,
    toAmount: 4823.5,
    exchangeRate: 0.0048235,
    priceImpact: 1.84,
    fee: 14.47,
    executedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    txHash: generateTxHash(),
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSwapStore = create<SwapState>((set, get) => ({
  fromToken: defaultFrom,
  toToken: defaultTo,
  fromAmount: '',
  toAmount: '',
  slippage: 1.0,
  quote: null,
  status: 'idle',
  errorMessage: '',
  swapHistory: initialSwapHistory,
  availableTokens: STONFI_TOKENS,
  pricesLoading: false,
  pricesUpdatedAt: null,

  // ── refreshMarket ───────────────────────────────────────────────────────────
  // Pulls live USD prices + official icons from STON.fi and merges them into the
  // token catalogue. Keeps demo balances; only price/icon fields are updated.
  refreshMarket: async () => {
    if (get().pricesLoading) return;
    set({ pricesLoading: true });
    try {
      const tokens = get().availableTokens;
      const market = await fetchStonfiMarket(tokens.map((t) => t.address));
      if (Object.keys(market).length === 0) {
        set({ pricesLoading: false });
        return;
      }
      const merge = (t: SwapToken): SwapToken => {
        const m = market[t.address];
        if (!m) return t;
        return {
          ...t,
          usdPrice: m.usdPrice,
          decimals: m.decimals ?? t.decimals,
          logoUrl: m.logoUrl ?? t.logoUrl,
        };
      };
      set((state) => ({
        availableTokens: state.availableTokens.map(merge),
        fromToken: merge(state.fromToken),
        toToken: merge(state.toToken),
        pricesLoading: false,
        pricesUpdatedAt: Date.now(),
      }));
    } catch {
      set({ pricesLoading: false });
    }
  },

  // ── setFromToken ────────────────────────────────────────────────────────────
  // Guard: prevent the user from selecting the same token on both sides.
  // If the selected token matches the current toToken, flip the pair automatically.
  setFromToken: (token) => {
    const { toToken, fromAmount } = get();
    if (token.symbol === toToken.symbol) {
      set({
        fromToken: token,
        toToken: get().fromToken,
        quote: null,
        status: fromAmount ? 'idle' : 'idle',
        toAmount: '',
      });
      return;
    }
    set({ fromToken: token, quote: null, status: 'idle', toAmount: '' });
  },

  // ── setToToken ──────────────────────────────────────────────────────────────
  setToToken: (token) => {
    const { fromToken } = get();
    if (token.symbol === fromToken.symbol) {
      set({
        toToken: token,
        fromToken: get().toToken,
        quote: null,
        status: 'idle',
        toAmount: '',
      });
      return;
    }
    set({ toToken: token, quote: null, status: 'idle', toAmount: '' });
  },

  // ── setFromAmount ───────────────────────────────────────────────────────────
  // Clears the existing quote whenever the input changes so the user always
  // sees a fresh "fetching quote" cycle rather than stale numbers.
  setFromAmount: (amount) => {
    set({ fromAmount: amount, quote: null, toAmount: '', status: 'idle' });
  },

  // ── flipTokens ──────────────────────────────────────────────────────────────
  // Swaps fromToken and toToken in place and resets all quote state.
  // The previous output amount becomes the new input amount so UX feels natural.
  flipTokens: () => {
    const { fromToken, toToken, toAmount, quote } = get();
    set({
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: quote ? toAmount : '',
      toAmount: '',
      quote: null,
      status: 'idle',
    });
  },

  // ── setSlippage ─────────────────────────────────────────────────────────────
  setSlippage: (slippage) => {
    set({ slippage });
    // Invalidate quote when slippage changes so minAskAmount is recalculated
    if (get().quote) {
      set({ quote: null, status: 'idle', toAmount: '' });
    }
  },

  // ── fetchQuote ──────────────────────────────────────────────────────────────
  // Simulates an async call to STON.fi /swap/simulate with an 800ms delay.
  // Validates inputs before attempting to quote.
  fetchQuote: async () => {
    const { fromToken, toToken, fromAmount, slippage } = get();

    const fromAmountNum = parseFloat(fromAmount);

    // Input validation
    if (!fromAmount || isNaN(fromAmountNum) || fromAmountNum <= 0) {
      set({
        status: 'error',
        errorMessage: 'Enter a valid amount to swap.',
        quote: null,
        toAmount: '',
      });
      return;
    }

    if (fromAmountNum > fromToken.balance) {
      set({
        status: 'error',
        errorMessage: `Insufficient ${fromToken.symbol} balance. You have ${fromToken.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${fromToken.symbol}.`,
        quote: null,
        toAmount: '',
      });
      return;
    }

    if (fromToken.symbol === toToken.symbol) {
      set({
        status: 'error',
        errorMessage: 'Cannot swap a token for itself.',
        quote: null,
        toAmount: '',
      });
      return;
    }

    // Minimum swap threshold: $0.10 equivalent
    const fromValueUsd = fromAmountNum * fromToken.usdPrice;
    if (fromValueUsd < 0.1) {
      set({
        status: 'error',
        errorMessage: `Minimum swap value is $0.10. Current value: $${fromValueUsd.toFixed(4)}.`,
        quote: null,
        toAmount: '',
      });
      return;
    }

    set({ status: 'quoting', quote: null, toAmount: '', errorMessage: '' });

    // Simulate network latency: 600–1000ms
    const delay = 600 + Math.floor(Math.random() * 400);
    await new Promise<void>((resolve) => setTimeout(resolve, delay));

    const newQuote = computeQuote(fromToken, toToken, fromAmountNum, slippage);

    // Format toAmount with appropriate decimal places
    const toAmountDisplay =
      toToken.decimals === 0
        ? newQuote.askAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })
        : newQuote.askAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          });

    set({
      status: 'ready',
      quote: newQuote,
      toAmount: toAmountDisplay,
    });
  },

  // ── executeSwap ─────────────────────────────────────────────────────────────
  // Simulates the 2-step on-chain swap execution:
  //   1. Confirming state (2-second blockchain simulation)
  //   2. 15% random failure rate (simulates on-chain revert / slippage breach)
  //   3. On success: update token balances, persist to history
  executeSwap: async () => {
    const { fromToken, toToken, fromAmount, quote, slippage } = get();
    if (!quote || get().status !== 'ready') return;

    const fromAmountNum = parseFloat(fromAmount);
    if (isNaN(fromAmountNum) || fromAmountNum <= 0) return;

    set({ status: 'confirming', errorMessage: '' });

    // Simulate 2-second blockchain confirmation
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    // Simulate 15% failure rate (slippage breach / on-chain revert)
    const failed = Math.random() < 0.15;
    if (failed) {
      set({
        status: 'error',
        errorMessage: `Swap reverted: output amount fell below minimum (${slippage}% slippage tolerance exceeded). Try increasing your slippage or reducing the trade size.`,
      });
      return;
    }

    // Update token balances after successful swap
    const updatedTokens = get().availableTokens.map((token) => {
      if (token.symbol === fromToken.symbol) {
        return { ...token, balance: token.balance - fromAmountNum };
      }
      if (token.symbol === toToken.symbol) {
        return { ...token, balance: token.balance + quote.askAmount };
      }
      return token;
    });

    // Build history record
    const historyItem: SwapHistoryItem = {
      id: `swap_${generateId()}`,
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      fromAmount: fromAmountNum,
      toAmount: quote.askAmount,
      exchangeRate: quote.exchangeRate,
      priceImpact: quote.priceImpact,
      fee: quote.fee,
      executedAt: new Date().toISOString(),
      txHash: generateTxHash(),
    };

    set((state) => ({
      status: 'success',
      availableTokens: updatedTokens,
      // Also update fromToken and toToken references to reflect new balances
      fromToken: updatedTokens.find((t) => t.symbol === state.fromToken.symbol)!,
      toToken: updatedTokens.find((t) => t.symbol === state.toToken.symbol)!,
      swapHistory: [historyItem, ...state.swapHistory],
    }));

    // Auto-reset to idle after 3 seconds, clearing the form
    setTimeout(() => {
      set({
        status: 'idle',
        fromAmount: '',
        toAmount: '',
        quote: null,
      });
    }, 3000);
  },

  // ── resetSwap ───────────────────────────────────────────────────────────────
  resetSwap: () => {
    set({
      fromAmount: '',
      toAmount: '',
      quote: null,
      status: 'idle',
      errorMessage: '',
    });
  },

  // ── clearError ──────────────────────────────────────────────────────────────
  clearError: () => {
    set({ status: 'idle', errorMessage: '' });
  },
}));
