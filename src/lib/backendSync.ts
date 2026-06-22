// TonFunded — bridge that maps live backend data into the existing zustand
// stores, so pages keep reading stores unchanged. Place at src/lib/backendSync.ts
//
// It calls Store.setState(...) directly (zustand allows external updates), so you
// do NOT need to modify the store action signatures. Initial mock state stays as
// an instant placeholder until the first sync resolves, then gets overwritten.
import {
  supabase, getTiers, getActiveChallenge, getLatestPerformance,
  getOpenPositions, subscribeRisk,
} from "@/lib/tonfunded";
import { useChallengeStore } from "@/stores/challengeStore";
import { useTradingStore } from "@/stores/tradingStore";
import { usePayoutStore } from "@/stores/payoutStore";
import { useReferralStore } from "@/stores/referralStore";
import type { ChallengeTier, Challenge, Position } from "@/types";

// Keep the page-facing badge colors stable per tier.
const BADGES: Record<string, { badgeBg: string; badgeText: string }> = {
  starter: { badgeBg: "#e8f5fd", badgeText: "#4DB8FF" },
  growth:  { badgeBg: "#ecfdf5", badgeText: "#16a34a" },
  pro:     { badgeBg: "#fef3c7", badgeText: "#d97706" },
  expert:  { badgeBg: "#f3e8ff", badgeText: "#7c3aed" },
  elite:   { badgeBg: "#fdf2f8", badgeText: "#db2777" },
  legend:  { badgeBg: "#eef2ff", badgeText: "#4f46e5" },
};

const n = (v: any) => Number(v ?? 0);

// ─── mappers: backend row → app type ─────────────────────────────────────────
function mapTier(rr: any): ChallengeTier {
  return {
    id: rr.tier,
    name: String(rr.display_name ?? rr.tier).split(" ")[0],
    accountSize: n(rr.funded_amount),
    fee: n(rr.fee),
    profitTarget: n(rr.profit_target_pct),
    maxDailyLoss: n(rr.daily_drawdown_pct),
    maxOverallLoss: n(rr.overall_drawdown_pct),
    minTradingDays: n(rr.min_trading_days),
    maxPositions: rr.max_positions != null ? n(rr.max_positions) : 5,
    drawdownMode: String(rr.drawdown_mode ?? 'EOD'),
    resetFee: n(rr.reset_fee),
    ...(BADGES[rr.tier] ?? { badgeBg: "#eef2ff", badgeText: "#4DB8FF" }),
  };
}

function mapStatus(s: string): Challenge["status"] {
  if (s === "breached" || s === "failed") return "failed";
  if (s === "passed" || s === "completed") return "completed";
  if (s === "funded") return "funded";
  return "active";
}

function mapPosition(t: any): Position {
  const entry = n(t.entry_price);
  const cur = n(t.exit_price ?? t.entry_price);
  const amt = n(t.amount);
  const pnl = n(t.pnl);
  return {
    id: t.id,
    tokenName: String(t.token).split("/")[0],
    tokenPair: t.token,
    entryPrice: entry,
    currentPrice: cur,
    quantity: entry ? amt / entry : amt,
    leverage: 1,
    pnl,
    pnlPercent: amt ? (pnl / amt) * 100 : 0,
    openedAt: t.ts,
    direction: t.side === "sell" ? "short" : "long",
    slippage: 1,
    breakevenSet: false,
    highWaterMark: cur,
    initialValue: amt,
  };
}

// Apply one challenge (+ its latest perf + open positions) to both stores.
function apply(ch: any, perf: any, positions: any[]) {
  const rr = ch.risk_rules ?? {};
  const starting = n(ch.starting_balance);
  const current = perf ? n(perf.balance) : n(ch.current_balance);
  const overallPnl = current - starting;

  const profitTargetUsd = (starting * n(rr.profit_target_pct)) / 100;
  const dailyLimitUsd = (starting * n(rr.daily_drawdown_pct)) / 100;
  const overallLimitUsd = (starting * n(rr.overall_drawdown_pct)) / 100;
  const dailyLossUsd = perf && perf.daily_pnl < 0 ? -n(perf.daily_pnl) : 0;
  const overallLossUsd = Math.max(0, starting - current);
  const dailyDDpct = perf ? n(perf.daily_drawdown) : 0;
  const overallDDpct = perf ? n(perf.overall_drawdown) : 0;
  const progressPct = perf ? n(perf.profit_target_progress) : 0;
  const tradingDays = ch.start_date
    ? Math.max(0, Math.floor((Date.now() - new Date(ch.start_date).getTime()) / 86_400_000))
    : 0;

  // challengeStore.activeChallenge
  const challenge: Challenge = {
    id: ch.id,
    tierId: ch.tier,
    tierName: String(rr.display_name ?? ch.tier).split(" ")[0],
    accountSize: n(ch.funded_amount),
    phase: 1,
    status: mapStatus(ch.status),
    startedAt: ch.start_date ?? ch.created_at,
    progress: {
      tradingDays,
      minTradingDays: n(rr.min_trading_days),
      profitCurrent: Math.max(0, overallPnl),
      profitTarget: profitTargetUsd,
      dailyLossCurrent: dailyLossUsd,
      dailyLossLimit: dailyLimitUsd,
      maxLossCurrent: overallLossUsd,
      maxLossLimit: overallLimitUsd,
      percentComplete: progressPct,
    },
  };
  useChallengeStore.setState({ activeChallenge: challenge });

  // tradingStore — balance, drawdown meters, positions
  useTradingStore.setState({
    balance: current,
    startingBalance: starting,
    pnl: overallPnl,
    pnlPercent: starting ? (overallPnl / starting) * 100 : 0,
    dailyDrawdown: {
      current: dailyLossUsd, limit: dailyLimitUsd,
      percentOfLimit: rr.daily_drawdown_pct ? (dailyDDpct / n(rr.daily_drawdown_pct)) * 100 : 0,
    },
    overallDrawdown: {
      current: overallLossUsd, limit: overallLimitUsd,
      percentOfLimit: rr.overall_drawdown_pct ? (overallDDpct / n(rr.overall_drawdown_pct)) * 100 : 0,
    },
    profitTarget: { current: Math.max(0, overallPnl), target: profitTargetUsd, percentComplete: progressPct },
    positions: (positions ?? []).map(mapPosition),
    drawdownAlert:
      ch.status === "breached" ? (ch.breach_reason ?? "Challenge breached")
      : dailyDDpct >= n(rr.daily_drawdown_pct) * 0.8 ? "Approaching daily loss limit"
      : null,
  });
}

// Reload the active challenge slice and apply it.
async function refreshActive() {
  const { data: ch } = await getActiveChallenge();
  if (!ch) return;
  const [{ data: perf }, { data: positions }] = await Promise.all([
    getLatestPerformance(ch.id),
    getOpenPositions(ch.id),
  ]);
  apply(ch, perf, positions ?? []);
}

async function refreshPayouts() {
  const { data } = await supabase
    .from("payouts").select("*").order("requested_at", { ascending: false });
  if (!data) return;
  const statusMap: Record<string, string> = {
    requested: "pending", approved: "processing", processing: "processing",
    paid: "completed", rejected: "rejected",
  };
  usePayoutStore.setState({
    records: data.map((p: any) => ({
      id: p.id,
      requestedAt: p.requested_at,
      processedAt: p.processed_at ?? undefined,
      amountRequested: n(p.requested_amount),
      amountAfterSplit: n(p.net_amount ?? (n(p.requested_amount) * n(p.profit_share)) / 100),
      traderSplitPct: n(p.profit_share),
      status: statusMap[p.status] ?? "pending",
      walletAddress: "",
      txHash: p.ton_tx_hash ?? undefined,
    })) as any,
  });
}

// ─── public API ──────────────────────────────────────────────────────────────

/** One-shot full load after login. Replaces mock data in all stores. */
async function refreshReferral() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;
  const { data: user } = await supabase
    .from("users")
    .select("referral_code, referrals:referrals(id,referee_id,status,earned_amount,created_at,users!referee_id(name))")
    .eq("id", session.user.id)
    .maybeSingle();
  if (!user) return;

  const code = user.referral_code ?? "TONFUND-XXXX";
  const referrals: any[] = Array.isArray(user.referrals) ? user.referrals : [];
  const friends = referrals.map((r: any, i: number) => ({
    id: r.id ?? `rf_${i}`,
    displayName: r.users?.name ?? `Trader ${i + 1}`,
    joinedAt: r.created_at ?? new Date().toISOString(),
    hasPurchasedChallenge: r.status !== "pending",
    earningsGenerated: Number(r.earned_amount ?? 0),
    status: (r.status === "paid" ? "earned" : r.status === "active" ? "active" : "pending") as "earned" | "active" | "pending",
  }));

  const totalEarned = friends.reduce((s, f) => s + f.earningsGenerated, 0);
  const pendingEarned = friends.filter((f) => f.status === "pending").reduce((s, f) => s + f.earningsGenerated, 0);

  useReferralStore.setState((prev) => ({
    info: {
      ...prev.info,
      referralCode: code,
      referralLink: `https://t.me/TonFundedBot?start=${code}`,
      totalReferrals: friends.length,
      activeReferrals: friends.filter((f) => f.status === "active").length,
      totalEarningsUsd: totalEarned,
      pendingEarningsUsd: pendingEarned,
      friends,
    },
  }));
}

export async function syncAllFromBackend() {
  const { data: tiers } = await getTiers();
  if (tiers) useChallengeStore.setState({ tiers: tiers.map(mapTier) });
  await refreshActive();
  await refreshPayouts();
  await refreshReferral();
}

/** Live updates. Returns an unsubscribe function. Call with the user id. */
export function startRealtime(userId: string) {
  return subscribeRisk(userId, {
    onPerformance: () => refreshActive(),
    onChallenge:   () => refreshActive(),
    onTrade:       () => refreshActive(),
  });
}
