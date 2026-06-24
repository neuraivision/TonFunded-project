import { create } from 'zustand';
import { useSwapStore } from '@/stores/swapStore';
import { useChallengeStore } from '@/stores/challengeStore';
import type {
  Position,
  DrawdownMetric,
  ProfitTargetMetric,
  ActivityItem,
  TradeRecord,
  PerformanceStats,
} from '@/types';
import { recordTrade } from '@/lib/tonfunded';

// Fire-and-forget backend risk engine calls. No-op without a session / active challenge.
// The engine recomputes balance + drawdown and auto-breaches if a limit is hit.
function reportOpen(pos: { tokenPair: string; direction: 'long' | 'short'; entryPrice: number; quantity: number }) {
  recordTrade({
    token: pos.tokenPair,
    side: pos.direction === 'long' ? 'buy' : 'sell',
    amount: Math.abs(pos.quantity * pos.entryPrice),
    entryPrice: pos.entryPrice,
  }).catch(() => {});
}

function reportClose(pos: { tokenPair: string; direction: 'long' | 'short'; entryPrice: number; currentPrice: number; quantity: number }, pnl: number) {
  recordTrade({
    token: pos.tokenPair,
    side: pos.direction === 'short' ? 'buy' : 'sell',
    amount: Math.abs(pos.quantity * pos.entryPrice),
    entryPrice: pos.entryPrice,
    exitPrice: pos.currentPrice,
    pnl,
  }).catch(() => {});
}

interface TradingState {
  // Balance & PnL
  balance: number;
  startingBalance: number;
  pnl: number;
  pnlPercent: number;

  // Drawdown
  dailyDrawdown: DrawdownMetric;
  overallDrawdown: DrawdownMetric;
  profitTarget: ProfitTargetMetric;

  // Positions
  positions: Position[];

  // Activity feed (home screen)
  tradingHistory: ActivityItem[];

  // Full closed-trade records (Trade History tab)
  tradeRecords: TradeRecord[];

  // Computed performance stats
  stats: PerformanceStats;

  // Tracks closed-trade profits so balance doesn't reset when positions close
  realizedPnl: number;

  // Drawdown alert — set when daily drawdown crosses 80%
  drawdownAlert: string | null;

  // Actions
  openPosition: (position: Omit<Position, 'id' | 'pnl' | 'pnlPercent'>) => void;
  closePosition: (id: string) => void;
  partialClose: (id: string, percent: number) => void;
  setTakeProfit: (id: string, percent: number) => void;
  updatePrices: () => void;
  // Apply real STON.fi prices: symbol→USD price (e.g. { "GRAM": 3.21, "NOT": 0.0041 })
  applyLivePrices: (prices: Record<string, number>) => void;
  addActivity: (item: Omit<ActivityItem, 'id'>) => void;
  dismissDrawdownAlert: () => void;
  recomputeStats: () => void;
  updateSlippage: (id: string, slippage: number) => void;
  setBreakeven: (id: string) => void;
  clearBreakeven: (id: string) => void;
  runRiskCheck: (id: string, closePercent: number) => import('@/types').RiskCheckResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substring(2, 10);

const now = new Date();

function computeStats(records: TradeRecord[]): PerformanceStats {
  if (records.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgWin: 0,
      avgLoss: 0,
      avgDurationMinutes: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      currentDrawdownPct: 0,
      equityCurve: [],
    };
  }

  const wins = records.filter((r) => r.pnl > 0);
  const losses = records.filter((r) => r.pnl <= 0);
  const totalWinPnl = wins.reduce((s, r) => s + r.pnl, 0);
  const totalLossPnl = Math.abs(losses.reduce((s, r) => s + r.pnl, 0));
  const avgWin = wins.length > 0 ? totalWinPnl / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossPnl / losses.length : 0;
  const profitFactor = totalLossPnl > 0 ? parseFloat((totalWinPnl / totalLossPnl).toFixed(2)) : totalWinPnl > 0 ? 99 : 0;
  const bestTrade = records.reduce((m, r) => Math.max(m, r.pnl), 0);
  const worstTrade = records.reduce((m, r) => Math.min(m, r.pnl), 0);
  const avgDuration = records.reduce((s, r) => s + r.durationMinutes, 0) / records.length;

  // Consecutive win/loss streaks
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const r of [...records].sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime())) {
    if (r.pnl > 0) {
      curWin++;
      curLoss = 0;
      if (curWin > maxWinStreak) maxWinStreak = curWin;
    } else {
      curLoss++;
      curWin = 0;
      if (curLoss > maxLossStreak) maxLossStreak = curLoss;
    }
  }

  // Equity curve — group by calendar day, running cumulative PnL from 10000 base
  const startingBalance = 10000;
  const sorted = [...records].sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime());
  const dayMap = new Map<string, number>();
  for (const r of sorted) {
    const day = new Date(r.closedAt).toLocaleDateString('en-US', { weekday: 'short' });
    dayMap.set(day, (dayMap.get(day) ?? 0) + r.pnl);
  }
  let running = startingBalance;
  const equityCurve = Array.from(dayMap.entries()).map(([day, pnl]) => {
    running += pnl;
    return { day, value: parseFloat(running.toFixed(2)), label: `$${running.toFixed(0)}` };
  });

  return {
    winRate: records.length > 0 ? parseFloat(((wins.length / records.length) * 100).toFixed(1)) : 0,
    profitFactor,
    totalTrades: records.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    bestTrade: parseFloat(bestTrade.toFixed(2)),
    worstTrade: parseFloat(worstTrade.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    avgDurationMinutes: parseFloat(avgDuration.toFixed(0)),
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak,
    currentDrawdownPct: 1.53,
    equityCurve,
  };
}

// Syncs USDT swap balance and challenge profit progress after any position close.
function syncPortfolio(state: TradingState) {
  const openPnl = state.positions.reduce((s, p) => s + p.pnl, 0);
  const totalPnl = state.realizedPnl + openPnl;
  const newBalance = state.startingBalance + totalPnl;
  const invested = state.positions.reduce((s, p) => s + p.initialValue, 0);
  useSwapStore.getState().syncUsdtBalance(Math.max(0, newBalance - invested));
  const ch = useChallengeStore.getState().activeChallenge;
  if (ch) {
    const profitCurrent = Math.max(0, totalPnl);
    useChallengeStore.getState().updateProgress({
      profitCurrent,
      percentComplete: Math.min(100, parseFloat(((profitCurrent / ch.progress.profitTarget) * 100).toFixed(1))),
    });
  }
}

// ─── Mock initial data ────────────────────────────────────────────────────────

const initialPositions: Position[] = [];

const initialTradeRecords: TradeRecord[] = [];

const initialHistory: ActivityItem[] = [];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTradingStore = create<TradingState>((set, get) => ({
  // Clean funded account: balance = starting capital, zero P&L, zero progress.
  // Real figures arrive from the backend (backendSync) once the account is funded.
  balance: 10000,
  startingBalance: 10000,
  pnl: 0,
  pnlPercent: 0,

  dailyDrawdown: { current: 0, limit: 500, percentOfLimit: 0 },
  overallDrawdown: { current: 0, limit: 1000, percentOfLimit: 0 },
  profitTarget: { current: 0, target: 1000, percentComplete: 0 },

  realizedPnl: 0,
  positions: initialPositions,
  tradingHistory: initialHistory,
  tradeRecords: initialTradeRecords,
  stats: computeStats(initialTradeRecords),
  drawdownAlert: null,

  // ── openPosition ────────────────────────────────────────────────────────────
  openPosition: (positionData) => {
    const newPos: Position = {
      ...positionData,
      id: generateId(),
      pnl: (positionData.currentPrice - positionData.entryPrice) * positionData.quantity,
      pnlPercent: ((positionData.currentPrice - positionData.entryPrice) / positionData.entryPrice) * 100,
    };
    set((state) => ({ positions: [newPos, ...state.positions] }));
    get().addActivity({
      type: 'trade_open',
      description: `Opened ${positionData.tokenName} position`,
      timestamp: new Date().toISOString(),
      amount: newPos.pnl,
      amountFormatted: newPos.pnl >= 0 ? `+$${newPos.pnl.toFixed(2)}` : `-$${Math.abs(newPos.pnl).toFixed(2)}`,
    });
    reportOpen(newPos);
  },

  // ── closePosition ────────────────────────────────────────────────────────────
  closePosition: (id) => {
    const pos = get().positions.find((p) => p.id === id);
    if (!pos) return;

    const closedAt = new Date().toISOString();
    const durationMinutes = Math.floor(
      (Date.now() - new Date(pos.openedAt).getTime()) / 60_000,
    );
    const record: TradeRecord = {
      id: generateId(),
      tokenName: pos.tokenName,
      tokenPair: pos.tokenPair,
      direction: 'long',
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      quantity: pos.quantity,
      pnl: pos.pnl,
      pnlPercent: pos.pnlPercent,
      closePercent: 100,
      openedAt: pos.openedAt,
      closedAt,
      durationMinutes,
      fee: parseFloat((Math.abs(pos.pnl) * 0.001).toFixed(4)),
      accountSize: get().startingBalance,
    };

    set((state) => {
      const newRecords = [record, ...state.tradeRecords];
      return {
        positions: state.positions.filter((p) => p.id !== id),
        tradeRecords: newRecords,
        stats: computeStats(newRecords),
        realizedPnl: state.realizedPnl + pos.pnl,
      };
    });

    // Sync USDT balance and challenge progress immediately after close
    syncPortfolio(get());

    get().addActivity({
      type: 'trade_close',
      description: `Closed ${pos.tokenName} position`,
      timestamp: closedAt,
      amount: pos.pnl,
      amountFormatted: pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`,
    });

    reportClose(pos, pos.pnl);
  },

  // ── partialClose ─────────────────────────────────────────────────────────────
  partialClose: (id, percent) => {
    const pos = get().positions.find((p) => p.id === id);
    if (!pos) return;

    const closeQty = Math.floor(pos.quantity * (percent / 100));
    const remainingQty = pos.quantity - closeQty;
    const pnlRealized = (pos.currentPrice - pos.entryPrice) * closeQty;

    if (remainingQty <= 0) {
      get().closePosition(id);
      return;
    }

    const closedAt = new Date().toISOString();
    const durationMinutes = Math.floor(
      (Date.now() - new Date(pos.openedAt).getTime()) / 60_000,
    );
    const record: TradeRecord = {
      id: generateId(),
      tokenName: pos.tokenName,
      tokenPair: pos.tokenPair,
      direction: 'long',
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      quantity: closeQty,
      pnl: pnlRealized,
      pnlPercent: ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100,
      closePercent: percent,
      openedAt: pos.openedAt,
      closedAt,
      durationMinutes,
      fee: parseFloat((Math.abs(pnlRealized) * 0.001).toFixed(4)),
      accountSize: get().startingBalance,
    };

    set((state) => {
      const newRecords = [record, ...state.tradeRecords];
      return {
        positions: state.positions.map((p) =>
          p.id === id
            ? { ...p, quantity: remainingQty, pnl: (p.currentPrice - p.entryPrice) * remainingQty }
            : p,
        ),
        tradeRecords: newRecords,
        stats: computeStats(newRecords),
        realizedPnl: state.realizedPnl + pnlRealized,
      };
    });

    syncPortfolio(get());

    get().addActivity({
      type: 'trade_close',
      description: `Partial close ${pos.tokenName} (${percent}%)`,
      timestamp: closedAt,
      amount: pnlRealized,
      amountFormatted: pnlRealized >= 0 ? `+$${pnlRealized.toFixed(2)}` : `-$${Math.abs(pnlRealized).toFixed(2)}`,
    });

    reportClose({ ...pos, quantity: closeQty }, pnlRealized);
  },

  // ── setTakeProfit ─────────────────────────────────────────────────────────────
  setTakeProfit: (id, percent) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === id
          ? { ...p, takeProfitPct: percent }
          : p,
      ),
    }));
  },

  // ── updatePrices ──────────────────────────────────────────────────────────────
  updatePrices: () => {
    set((state) => {
      const updatedPositions = state.positions.map((p) => {
        const fluctuation = (Math.random() - 0.48) * 0.003;
        const newPrice = Math.max(0.0001, p.currentPrice * (1 + fluctuation));
        const newPnl = (newPrice - p.entryPrice) * p.quantity;
        return {
          ...p,
          currentPrice: newPrice,
          pnl: newPnl,
          pnlPercent: ((newPrice - p.entryPrice) / p.entryPrice) * 100,
        };
      });

      const openPnl = updatedPositions.reduce((sum, p) => sum + p.pnl, 0);
      const totalPnl = state.realizedPnl + openPnl;
      const newBalance = state.startingBalance + totalPnl;
      const overallLoss = Math.max(0, state.startingBalance - newBalance);
      const overallPct = (overallLoss / state.startingBalance) * 100;

      // Daily drawdown check — warn at 80%
      const dailyPct = state.dailyDrawdown.percentOfLimit;
      const drawdownAlert =
        dailyPct >= 80 && !state.drawdownAlert
          ? `Daily drawdown at ${dailyPct.toFixed(0)}% of limit — reduce exposure now`
          : state.drawdownAlert;

      return {
        positions: updatedPositions,
        pnl: parseFloat(totalPnl.toFixed(2)),
        pnlPercent: parseFloat(((totalPnl / state.startingBalance) * 100).toFixed(2)),
        balance: parseFloat(newBalance.toFixed(2)),
        overallDrawdown: {
          ...state.overallDrawdown,
          current: -overallLoss,
          percentOfLimit: parseFloat(Math.min((overallPct / 10) * 100, 100).toFixed(1)),
        },
        drawdownAlert,
      };
    });
  },

  // ── applyLivePrices ───────────────────────────────────────────────────────────
  // Receives { symbol: usdPrice } from the STON.fi price feed and updates every
  // open position whose tokenPair matches a known symbol (e.g. "GRAM/USDT" → "GRAM").
  applyLivePrices: (prices) => {
    set((state) => {
      if (state.positions.length === 0) return {};
      const updatedPositions = state.positions.map((p) => {
        // tokenPair is like "GRAM/USDT" or just "GRAM"
        const symbol = p.tokenPair.split('/')[0].trim().toUpperCase();
        const livePrice = prices[symbol];
        if (!livePrice || livePrice <= 0) return p;
        const newPnl = (livePrice - p.entryPrice) * p.quantity;
        return {
          ...p,
          currentPrice: livePrice,
          pnl: newPnl,
          pnlPercent: ((livePrice - p.entryPrice) / p.entryPrice) * 100,
        };
      });

      const openPnl = updatedPositions.reduce((sum, p) => sum + p.pnl, 0);
      const totalPnl = state.realizedPnl + openPnl;
      const newBalance = state.startingBalance + totalPnl;
      const overallLoss = Math.max(0, state.startingBalance - newBalance);
      const overallPct = (overallLoss / state.startingBalance) * 100;

      const dailyPct = state.dailyDrawdown.percentOfLimit;
      const drawdownAlert =
        dailyPct >= 80 && !state.drawdownAlert
          ? `Daily drawdown at ${dailyPct.toFixed(0)}% of limit — reduce exposure now`
          : state.drawdownAlert;

      // Sync USDT balance and challenge progress on every price tick
      const invested = updatedPositions.reduce((s, p) => s + p.initialValue, 0);
      const availableUsdt = Math.max(0, parseFloat((newBalance - invested).toFixed(2)));
      useSwapStore.getState().syncUsdtBalance(availableUsdt);
      const ch = useChallengeStore.getState().activeChallenge;
      if (ch) {
        const profitCurrent = Math.max(0, totalPnl);
        useChallengeStore.getState().updateProgress({
          profitCurrent,
          percentComplete: Math.min(100, parseFloat(((profitCurrent / ch.progress.profitTarget) * 100).toFixed(1))),
        });
      }

      return {
        positions: updatedPositions,
        pnl: parseFloat(totalPnl.toFixed(2)),
        pnlPercent: parseFloat(((totalPnl / state.startingBalance) * 100).toFixed(2)),
        balance: parseFloat(newBalance.toFixed(2)),
        overallDrawdown: {
          ...state.overallDrawdown,
          current: -overallLoss,
          percentOfLimit: parseFloat(Math.min((overallPct / 10) * 100, 100).toFixed(1)),
        },
        drawdownAlert,
      };
    });
  },

  // ── addActivity ───────────────────────────────────────────────────────────────
  addActivity: (item) => {
    const newItem: ActivityItem = { ...item, id: generateId() };
    set((state) => ({
      tradingHistory: [newItem, ...state.tradingHistory].slice(0, 100),
    }));
  },

  // ── dismissDrawdownAlert ──────────────────────────────────────────────────────
  dismissDrawdownAlert: () => set({ drawdownAlert: null }),

  // ── recomputeStats ────────────────────────────────────────────────────────────
  recomputeStats: () => {
    set((state) => ({ stats: computeStats(state.tradeRecords) }));
  },

  updateSlippage: (id: string, slippage: number) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === id ? { ...p, slippage } : p
      ),
    }));
  },

  setBreakeven: (id: string) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === id ? { ...p, breakevenSet: true, breakevenPrice: p.entryPrice } : p
      ),
    }));
  },

  clearBreakeven: (id: string) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === id ? { ...p, breakevenSet: false, breakevenPrice: undefined } : p
      ),
    }));
  },

  runRiskCheck: (id: string, closePercent: number) => {
    const { positions, dailyDrawdown, overallDrawdown } = get();
    const position = positions.find((p) => p.id === id);
    const warnings: string[] = [];
    const blockers: string[] = [];
    if (!position) {
      return { passed: false, dailyDrawdownRemaining: 0, overallDrawdownRemaining: 0, positionRiskPercent: 0, warnings, blockers: ['Position not found'] };
    }
    const dailyRemaining = dailyDrawdown.limit - Math.abs(dailyDrawdown.current);
    const overallRemaining = overallDrawdown.limit - Math.abs(overallDrawdown.current);
    const estimatedPnl = position.pnl * (closePercent / 100);
    const positionRiskPercent = Math.abs(estimatedPnl / 10000) * 100;
    if (dailyRemaining < 50) blockers.push('Daily drawdown limit nearly reached');
    if (overallRemaining < 100) blockers.push('Overall drawdown limit nearly reached');
    if (position.pnlPercent < -5) warnings.push('Position is significantly in drawdown');
    if (closePercent < 100) warnings.push(`Partial close: ${closePercent}% of position`);
    return { passed: blockers.length === 0, dailyDrawdownRemaining: dailyRemaining, overallDrawdownRemaining: overallRemaining, positionRiskPercent, warnings, blockers };
  },
}));
