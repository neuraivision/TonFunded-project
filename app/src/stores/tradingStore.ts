import { create } from 'zustand';
import type {
  Position,
  DrawdownMetric,
  ProfitTargetMetric,
  ActivityItem,
  TradeRecord,
  PerformanceStats,
} from '@/types';

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

  // Drawdown alert — set when daily drawdown crosses 80%
  drawdownAlert: string | null;

  // Actions
  openPosition: (position: Omit<Position, 'id' | 'pnl' | 'pnlPercent'>) => void;
  closePosition: (id: string) => void;
  partialClose: (id: string, percent: number) => void;
  setTakeProfit: (id: string, percent: number) => void;
  updatePrices: () => void;
  addActivity: (item: Omit<ActivityItem, 'id'>) => void;
  dismissDrawdownAlert: () => void;
  recomputeStats: () => void;
  updateSlippage: (id: string, slippage: number) => void;
  setBreakeven: (id: string) => void;
  runRiskCheck: (id: string, closePercent: number) => import('@/types').RiskCheckResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substring(2, 10);

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

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

// ─── Mock initial data ────────────────────────────────────────────────────────

const initialPositions: Position[] = [
  {
    id: 'pos_1',
    tokenName: 'DOGS',
    tokenPair: 'DOGS/USDT',
    entryPrice: 0.00452,
    currentPrice: 0.00489,
    quantity: 10000,
    leverage: 1,
    pnl: 45.2,
    pnlPercent: 8.19,
    openedAt: minutesAgo(45),
    direction: 'short',
    slippage: 1,
    breakevenSet: false,
    highWaterMark: 0.00489,
    initialValue: 452,
  },
  {
    id: 'pos_2',
    tokenName: 'REDO',
    tokenPair: 'REDO/USDT',
    entryPrice: 0.0234,
    currentPrice: 0.0218,
    quantity: 5000,
    leverage: 1,
    pnl: -152.5,
    pnlPercent: -6.84,
    openedAt: minutesAgo(120),
    direction: 'short',
    slippage: 1,
    breakevenSet: false,
    highWaterMark: 0.0234,
    initialValue: 117,
  },
];

const initialTradeRecords: TradeRecord[] = [
  {
    id: 'tr_1',
    tokenName: 'NOT',
    tokenPair: 'NOT/USDT',
    direction: 'long',
    entryPrice: 0.00741,
    exitPrice: 0.00821,
    quantity: 200000,
    pnl: 160.0,
    pnlPercent: 10.8,
    closePercent: 100,
    openedAt: hoursAgo(26),
    closedAt: hoursAgo(24),
    durationMinutes: 120,
    fee: 0.48,
    accountSize: 10000,
  },
  {
    id: 'tr_2',
    tokenName: 'DOGS',
    tokenPair: 'DOGS/USDT',
    direction: 'long',
    entryPrice: 0.00501,
    exitPrice: 0.00478,
    quantity: 50000,
    pnl: -115.0,
    pnlPercent: -4.59,
    closePercent: 100,
    openedAt: daysAgo(2),
    closedAt: daysAgo(2),
    durationMinutes: 45,
    fee: 0.35,
    accountSize: 10000,
  },
  {
    id: 'tr_3',
    tokenName: 'GRAM',
    tokenPair: 'GRAM/USDT',
    direction: 'long',
    entryPrice: 0.0388,
    exitPrice: 0.0441,
    quantity: 8000,
    pnl: 424.0,
    pnlPercent: 13.66,
    closePercent: 100,
    openedAt: daysAgo(3),
    closedAt: daysAgo(3),
    durationMinutes: 200,
    fee: 1.27,
    accountSize: 10000,
  },
  {
    id: 'tr_4',
    tokenName: 'BOLT',
    tokenPair: 'BOLT/USDT',
    direction: 'long',
    entryPrice: 0.00172,
    exitPrice: 0.00158,
    quantity: 100000,
    pnl: -140.0,
    pnlPercent: -8.14,
    closePercent: 100,
    openedAt: daysAgo(4),
    closedAt: daysAgo(4),
    durationMinutes: 88,
    fee: 0.42,
    accountSize: 10000,
  },
  {
    id: 'tr_5',
    tokenName: 'SCALE',
    tokenPair: 'SCALE/USDT',
    direction: 'long',
    entryPrice: 0.741,
    exitPrice: 0.824,
    quantity: 600,
    pnl: 498.0,
    pnlPercent: 11.2,
    closePercent: 100,
    openedAt: daysAgo(5),
    closedAt: daysAgo(5),
    durationMinutes: 310,
    fee: 1.49,
    accountSize: 10000,
  },
  {
    id: 'tr_6',
    tokenName: 'NOT',
    tokenPair: 'NOT/USDT',
    direction: 'long',
    entryPrice: 0.00812,
    exitPrice: 0.00795,
    quantity: 150000,
    pnl: -255.0,
    pnlPercent: -2.09,
    closePercent: 50,
    openedAt: daysAgo(6),
    closedAt: daysAgo(6),
    durationMinutes: 60,
    fee: 0.77,
    accountSize: 10000,
  },
  {
    id: 'tr_7',
    tokenName: 'HYDRA',
    tokenPair: 'HYDRA/USDT',
    direction: 'long',
    entryPrice: 0.000281,
    exitPrice: 0.000334,
    quantity: 2000000,
    pnl: 106.0,
    pnlPercent: 18.86,
    closePercent: 100,
    openedAt: daysAgo(7),
    closedAt: daysAgo(7),
    durationMinutes: 480,
    fee: 0.32,
    accountSize: 10000,
  },
  {
    id: 'tr_8',
    tokenName: 'FISH',
    tokenPair: 'FISH/USDT',
    direction: 'long',
    entryPrice: 0.0000589,
    exitPrice: 0.0000712,
    quantity: 5000000,
    pnl: 615.0,
    pnlPercent: 20.88,
    closePercent: 100,
    openedAt: daysAgo(8),
    closedAt: daysAgo(8),
    durationMinutes: 720,
    fee: 1.85,
    accountSize: 10000,
  },
];

const initialHistory: ActivityItem[] = [
  { id: 'act_1', type: 'trade_open', description: 'Opened DOGS/USDT long', timestamp: minutesAgo(45), amount: 45.2, amountFormatted: '+$45.20' },
  { id: 'act_2', type: 'trade_close', description: 'Closed NOT/USDT long', timestamp: minutesAgo(90), amount: 120.0, amountFormatted: '+$120.00' },
  { id: 'act_3', type: 'trade_open', description: 'Opened REDO/USDT long', timestamp: minutesAgo(120), amount: -152.5, amountFormatted: '-$152.50' },
  { id: 'act_4', type: 'challenge_purchase', description: 'Purchased Starter Challenge', timestamp: minutesAgo(180), amountFormatted: '$50.00' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTradingStore = create<TradingState>((set, get) => ({
  balance: 9847.5,
  startingBalance: 10000,
  pnl: -152.5,
  pnlPercent: -1.53,

  dailyDrawdown: { current: -200, limit: 500, percentOfLimit: 40 },
  overallDrawdown: { current: -400, limit: 1000, percentOfLimit: 40 },
  profitTarget: { current: 800, target: 1000, percentComplete: 80 },

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
      };
    });

    get().addActivity({
      type: 'trade_close',
      description: `Closed ${pos.tokenName} position`,
      timestamp: closedAt,
      amount: pos.pnl,
      amountFormatted: pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`,
    });
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
      };
    });

    get().addActivity({
      type: 'trade_close',
      description: `Partial close ${pos.tokenName} (${percent}%)`,
      timestamp: closedAt,
      amount: pnlRealized,
      amountFormatted: pnlRealized >= 0 ? `+$${pnlRealized.toFixed(2)}` : `-$${Math.abs(pnlRealized).toFixed(2)}`,
    });
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

      // Recalculate total unrealised PnL
      const totalPnl = updatedPositions.reduce((sum, p) => sum + p.pnl, 0);
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
