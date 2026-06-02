// ─── Core trading types ───────────────────────────────────────────────────────

export interface Position {
  id: string;
  tokenName: string;
  tokenPair: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
  icon?: string;

  // V2 Feature 1 — advanced position management fields
  direction: 'long' | 'short';
  slippage: number;
  breakevenSet: boolean;
  breakevenPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  highWaterMark: number;
  initialValue: number;
}

// ─── V2 Feature 1 — Risk check & slippage types ───────────────────────────────

export interface RiskCheckResult {
  passed: boolean;
  dailyDrawdownRemaining: number;
  overallDrawdownRemaining: number;
  positionRiskPercent: number;
  warnings: string[];
  blockers: string[];
}

export type SlippagePreset = 0.5 | 1 | 2 | 5;

export interface DrawdownMetric {
  current: number;
  limit: number;
  percentOfLimit: number;
}

export interface ProfitTargetMetric {
  current: number;
  target: number;
  percentComplete: number;
}

export interface ActivityItem {
  id: string;
  type:
    | 'trade_open'
    | 'trade_close'
    | 'deposit'
    | 'withdrawal'
    | 'challenge_purchase'
    | 'payout'
    | 'breakeven_set'
    | 'partial_close'
    | 'stop_loss_hit'
    | 'take_profit_hit'
    | 'swap';
  description: string;
  timestamp: string;
  amount?: number;
  amountFormatted?: string;
}

// ─── Challenge types ──────────────────────────────────────────────────────────

export interface ChallengeTier {
  id: string;
  name: string;
  accountSize: number;
  fee: number;
  profitTarget: number;
  maxDailyLoss: number;
  maxOverallLoss: number;
  minTradingDays: number;
  badgeBg: string;
  badgeText: string;
}

export interface ChallengeProgress {
  tradingDays: number;
  minTradingDays: number;
  profitCurrent: number;
  profitTarget: number;
  dailyLossCurrent: number;
  dailyLossLimit: number;
  maxLossCurrent: number;
  maxLossLimit: number;
  percentComplete: number;
}

export interface Challenge {
  id: string;
  tierId: string;
  tierName: string;
  accountSize: number;
  phase: 1 | 2;
  status: 'active' | 'completed' | 'failed' | 'funded';
  progress: ChallengeProgress;
  startedAt: string;
}

// ─── Trade history record ─────────────────────────────────────────────────────

/**
 * A fully closed or partially closed trade stored in persistent history.
 * Separate from ActivityItem — TradeRecord holds full trade analytics data.
 */
export interface TradeRecord {
  id: string;
  tokenName: string;
  tokenPair: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  /** Whether this was a partial close (50%) or full close (100%) */
  closePercent: number;
  openedAt: string;
  closedAt: string;
  /** Duration the trade was open, in minutes */
  durationMinutes: number;
  /** Fee paid in USD */
  fee: number;
  /** The challenge account size context, used for risk % calculation */
  accountSize: number;
}

// ─── Performance analytics ────────────────────────────────────────────────────

export interface PerformanceStats {
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  avgDurationMinutes: number;
  /** Consecutive wins streak */
  maxConsecutiveWins: number;
  /** Consecutive losses streak */
  maxConsecutiveLosses: number;
  /** Current open drawdown from equity peak */
  currentDrawdownPct: number;
  equityCurve: { day: string; value: number; label: string }[];
}

// ─── Payout ───────────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface PayoutRecord {
  id: string;
  requestedAt: string;
  processedAt?: string;
  amountRequested: number;
  amountAfterSplit: number;
  /** Trader's profit split percentage, e.g. 80 for 80/20 */
  traderSplitPct: number;
  status: PayoutStatus;
  walletAddress: string;
  txHash?: string;
  rejectionReason?: string;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  /** Two-letter country code */
  country: string;
  accountSize: number;
  profitPct: number;
  profitUsd: number;
  winRate: number;
  totalTrades: number;
  challengeTier: string;
  /** Whether this entry represents the current user */
  isCurrentUser?: boolean;
  /** Streak of profitable days */
  streakDays: number;
  avatarColor: string;
  avatarInitials: string;
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime';

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'drawdown_warning'
  | 'profit_target_reached'
  | 'challenge_passed'
  | 'challenge_failed'
  | 'payout_processed'
  | 'payout_rejected'
  | 'trade_closed'
  | 'referral_joined'
  | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  /** Optional deep-link route within the app, e.g. "/profile" */
  actionRoute?: string;
  actionLabel?: string;
}

// ─── Referral ─────────────────────────────────────────────────────────────────

export interface ReferralFriend {
  id: string;
  displayName: string;
  joinedAt: string;
  /** Whether they have purchased a challenge */
  hasPurchasedChallenge: boolean;
  /** Total earnings this referral has generated for the referring user (USD) */
  earningsGenerated: number;
  status: 'pending' | 'active' | 'earned';
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarningsUsd: number;
  pendingEarningsUsd: number;
  /** Commission rate, e.g. 10 for 10% */
  commissionPct: number;
  friends: ReferralFriend[];
}

// ─── V2 Swap types (from Feature 2, preserved) ───────────────────────────────

export interface SwapToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  usdPrice: number;
  balance: number;
  priceChange24h: number;
  volume24hUsd: number;
  logoColor: string;
  logoInitials: string;
}

export interface SwapQuote {
  offerAmount: number;
  askAmount: number;
  minAskAmount: number;
  priceImpact: number;
  fee: number;
  exchangeRate: number;
  routePath: string;
  poolAddress: string;
}

export type SwapStatus = 'idle' | 'quoting' | 'ready' | 'confirming' | 'success' | 'error';

export interface SwapHistoryItem {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  priceImpact: number;
  fee: number;
  executedAt: string;
  txHash: string;
}

export interface SwapState {
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  quote: SwapQuote | null;
  status: SwapStatus;
  errorMessage: string;
  swapHistory: SwapHistoryItem[];
  availableTokens: SwapToken[];

  setFromToken: (token: SwapToken) => void;
  setToToken: (token: SwapToken) => void;
  setFromAmount: (amount: string) => void;
  flipTokens: () => void;
  setSlippage: (slippage: number) => void;
  fetchQuote: () => Promise<void>;
  executeSwap: () => Promise<void>;
  resetSwap: () => void;
  clearError: () => void;
}
