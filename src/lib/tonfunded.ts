// =============================================================================
// TonFunded — single-file Supabase client for the Telegram Mini App.
// Drop into: src/lib/tonfunded.ts
// Deps: npm i @supabase/supabase-js @tonconnect/ui-react
// Env (.env):  VITE_SUPABASE_URL=...   VITE_SUPABASE_ANON_KEY=...   (anon only)
// =============================================================================
import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TonConnectUI, Wallet } from "@tonconnect/ui-react";

/* ------------------------------- 1. Client -------------------------------- */
const URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FUNCTIONS = `${URL}/functions/v1`;

export const supabase = createClient(URL, ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

async function callFn<T = any>(name: string, body: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${FUNCTIONS}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const out = await res.json();
  if (!res.ok || out?.error) throw new Error(out?.error ?? `HTTP ${res.status}`);
  return out as T;
}

/* ----------------------------- 2. Auth ------------------------------------ */
declare global { interface Window { Telegram?: { WebApp?: { initData?: string } } } }

async function exchange(path: "auth-ton" | "auth-telegram", body: unknown): Promise<Session> {
  const res = await fetch(`${FUNCTIONS}/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const out = await res.json();
  if (!res.ok || out?.error || !out?.session) throw new Error(out?.error ?? "auth failed");
  await supabase.auth.setSession(out.session);
  return out.session;
}

// Sign in immediately from a wallet object that already has a fresh ton_proof.
// Called from onStatusChange so we switch sessions the moment the wallet connects.
export async function loginWithWallet(wallet: Wallet): Promise<Session> {
  const item = wallet.connectItems?.tonProof;
  if (!item || !("proof" in item)) throw new Error("no ton_proof on wallet");
  return exchange("auth-ton", {
    address: wallet.account.address, publicKey: wallet.account.publicKey,
    proof: {
      timestamp: item.proof.timestamp, domain: item.proof.domain,
      payload: item.proof.payload, signature: item.proof.signature,
    },
  });
}

export async function loginWithTonConnect(tonConnectUI: TonConnectUI, payload = crypto.randomUUID()) {
  tonConnectUI.setConnectRequestParameters({ state: "ready", value: { tonProof: payload } });
  // If wallet is restored (no fresh proof) disconnect so we can reconnect with one.
  if (tonConnectUI.wallet) {
    const item = tonConnectUI.wallet.connectItems?.tonProof;
    if (!item || !("proof" in item)) await tonConnectUI.disconnect();
  }
  let wallet: Wallet | null = tonConnectUI.wallet;
  if (!wallet) {
    wallet = await new Promise<Wallet>((resolve, reject) => {
      const unsub = tonConnectUI.onStatusChange((w) => { if (w) { unsub(); resolve(w); } }, reject);
      tonConnectUI.openModal();
    });
  }
  return loginWithWallet(wallet);
}

export async function loginWithTelegram(referralCode?: string) {
  const initData = window.Telegram?.WebApp?.initData ?? "";
  if (!initData) throw new Error("Not running inside Telegram");
  return exchange("auth-telegram", { initData, referralCode });
}

export async function ensureSession(opts?: { tonConnectUI?: TonConnectUI; referralCode?: string }) {
  const { data: { session } } = await supabase.auth.getSession();

  // If there's a cached session, verify it belongs to the connected wallet.
  // Telegram sessions are secondary — if a wallet is connected, wallet wins.
  if (session && opts?.tonConnectUI?.wallet) {
    const { data: profile } = await supabase
      .from("users").select("ton_address").eq("id", session.user.id).maybeSingle();
    const walletAddr = opts.tonConnectUI.wallet.account.address;
    if (profile?.ton_address && profile.ton_address !== walletAddr) {
      // Session belongs to a different user than the connected wallet — clear it.
      await supabase.auth.signOut();
    } else if (profile?.ton_address === walletAddr) {
      return session; // session already matches wallet — all good
    }
  } else if (session) {
    return session;
  }

  // Do NOT auto-open the TON Connect modal on boot. Wallet auth happens only when
  // the user explicitly connects (handled by the onStatusChange handler in App.tsx).
  // If a wallet is already connected with a fresh proof, authenticate silently.
  const w = opts?.tonConnectUI?.wallet;
  const proofItem = w?.connectItems?.tonProof;
  if (w && proofItem && "proof" in proofItem) {
    try { return await loginWithWallet(w); } catch (e) { console.warn('[ton-auth]', e); }
  }
  // Telegram initData auth (no popup); throws outside Telegram → app runs in mock mode.
  return loginWithTelegram(opts?.referralCode);
}

export const logout = () => supabase.auth.signOut();

/* --------------------------- 3. Data fetching ----------------------------- */
export const getMyProfile = () => supabase.from("users").select("*").maybeSingle();
export const getTiers = () =>
  supabase.from("risk_rules").select("*").eq("is_active", true).order("funded_amount");
export const getMyChallenges = () =>
  supabase.from("challenges").select("*, risk_rules(*)").order("created_at", { ascending: false });
export const getActiveChallenge = () =>
  supabase.from("challenges").select("*, risk_rules(*)")
    .eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
export const getLatestPerformance = (challengeId: string) =>
  supabase.from("performance_logs").select("*")
    .eq("challenge_id", challengeId).order("ts", { ascending: false }).limit(1).maybeSingle();
export const getOpenPositions = (challengeId: string) =>
  supabase.from("trades").select("*").eq("challenge_id", challengeId).eq("status", "open");
export const getLeaderboard = (limit = 50) => supabase.rpc("get_leaderboard", { p_limit: limit });

/* ----------------------------- 4. Actions --------------------------------- */
export const purchaseChallenge = (tier: string) =>
  callFn("challenges", { action: "purchase", tier });
export const confirmPayment = (challengeId: string, txHash: string) =>
  callFn("challenges", { action: "confirm_payment", challengeId, txHash });

/* ── Real TON payments ─────────────────────────────────────────────────────
 * Treasury wallet (fee destination). The authoritative copy lives server-side
 * (TREASURY_WALLET secret); this VITE var only sets the on-chain destination
 * the wallet pays to — keep both equal. */
export const TREASURY = import.meta.env.VITE_TONFUND_TREASURY as string | undefined;

export const startChallengePurchase = (tier: string) =>
  callFn<any>("purchase-challenge", { tier });
export const verifyPayment = (transactionId: string) =>
  callFn<any>("verify-payment", { transactionId });

/** Full purchase flow: create → pay via TON Connect → poll verification.
 *  `tonConnectUI` is the instance from useTonConnectUI(). */
export async function purchaseAndPay(tier: string, tonConnectUI: any) {
  // Bind the paying wallet to this account so verify-payment can match the
  // on-chain payer (works even when the user logged in via Telegram). RLS lets
  // a user update only their own ton_address.
  const wallet = tonConnectUI?.account?.address as string | undefined;
  if (wallet) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("users").update({ ton_address: wallet }).eq("id", session.user.id);
    }
  }

  const res = await startChallengePurchase(tier);
  if (res?.simulated) return res; // dev fallback — challenge already active

  const messages = TREASURY
    ? [{ address: TREASURY, amount: res.payment.messages[0].amount }]
    : res.payment.messages;

  await tonConnectUI.sendTransaction({ validUntil: res.payment.validUntil, messages });

  for (let i = 0; i < 12; i++) {              // poll up to ~36s for confirmation
    await new Promise((r) => setTimeout(r, 3000));
    const v = await verifyPayment(res.transactionId);
    if (v?.verified) return v;
  }
  throw new Error("Payment sent but not yet confirmed — check your challenge in a moment.");
}
export const recordTrade = (t: {
  token: string; side: "buy" | "sell"; amount: number;
  entryPrice: number; exitPrice?: number; pnl?: number; challengeId?: string;
}) => callFn("trades", t);
export const requestPayout = (challengeId: string, amount?: number) =>
  callFn("payouts", { action: "request", challengeId, amount });

/* ── Admin (RLS: admins read all rows; non-admins only their own → no leak) ── */
export async function getMyRole(): Promise<string | null> {
  const { data } = await supabase.from("users").select("role").maybeSingle();
  return data?.role ?? null;
}

export async function getAdminData() {
  const [usersCount, verified, active, recentTx, fundedRows] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("transactions").select("amount_usd").eq("status", "verified"),
    supabase.from("challenges")
      .select("id,tier,status,starting_balance,current_balance,created_at,user_id,users(username,ton_address)")
      .eq("status", "active").order("created_at", { ascending: false }),
    supabase.from("transactions")
      .select("id,created_at,status,tier,amount_usd,amount_ton,tx_hash,user_id,users(username,ton_address)")
      .order("created_at", { ascending: false }).limit(25),
    supabase.from("challenges").select("user_id,status")
      .in("status", ["active", "passed", "funded", "completed"]),
  ]);
  const totalRevenue = (verified.data ?? []).reduce((s, r: any) => s + Number(r.amount_usd), 0);
  const fundedTraders = new Set((fundedRows.data ?? []).map((r: any) => r.user_id)).size;
  return {
    totalUsers: usersCount.count ?? 0,
    fundedTraders,
    activeCount: (active.data ?? []).length,
    totalRevenue,
    activeChallenges: active.data ?? [],
    transactions: recentTx.data ?? [],
  };
}

/* ----------------------- 5. Real-time subscriptions ----------------------- */
export function subscribeRisk(userId: string, h: {
  onPerformance?: (row: any) => void; onChallenge?: (row: any) => void; onTrade?: (row: any) => void;
}) {
  const ch = supabase.channel(`risk:${userId}`)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "performance_logs", filter: `user_id=eq.${userId}` },
      (p) => h.onPerformance?.(p.new))
    .on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "challenges", filter: `user_id=eq.${userId}` },
      (p) => h.onChallenge?.(p.new))
    .on("postgres_changes",
      { event: "*", schema: "public", table: "trades", filter: `user_id=eq.${userId}` },
      (p) => h.onTrade?.(p.new))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

/* ------------------------- 6. React hooks --------------------------------- */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, loading };
}

const WARN = 0.8; // amber at 80% of a limit
export function useRiskMonitor(userId?: string) {
  const [challenge, setChallenge] = useState<any>(null);
  const [perf, setPerf] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cid = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return; let alive = true;
    (async () => {
      const { data: ch } = await getActiveChallenge();
      if (!alive) return; setChallenge(ch); cid.current = ch?.id ?? null;
      if (ch) {
        const [{ data: p }, { data: pos }] = await Promise.all([
          getLatestPerformance(ch.id), getOpenPositions(ch.id)]);
        if (alive) { setPerf(p); setPositions(pos ?? []); }
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    return subscribeRisk(userId, {
      onPerformance: (r) => (!cid.current || r.challenge_id === cid.current) && setPerf(r),
      onChallenge:   (r) => (!cid.current || r.id === cid.current) && setChallenge((c: any) => ({ ...c, ...r })),
      onTrade:       () => cid.current && getOpenPositions(cid.current).then(({ data }) => setPositions(data ?? [])),
    });
  }, [userId]);

  return useMemo(() => {
    const rr = challenge?.risk_rules;
    const dLim = rr?.daily_drawdown_pct ?? 5, oLim = rr?.overall_drawdown_pct ?? 10;
    const dDD = perf?.daily_drawdown ?? 0, oDD = perf?.overall_drawdown ?? 0;
    const breached = challenge?.status === "breached";
    return {
      challenge, performance: perf, positions, loading,
      balance: perf?.balance ?? challenge?.current_balance ?? 0,
      dailyDrawdownPct: dDD, overallDrawdownPct: oDD,
      profitProgressPct: perf?.profit_target_progress ?? 0,
      dailyLimitPct: dLim, overallLimitPct: oLim,
      dailyWarning: dDD >= dLim * WARN && !breached,
      overallWarning: oDD >= oLim * WARN && !breached,
      breached, breachReason: challenge?.breach_reason ?? null,
      locked: breached || (challenge ? challenge.status !== "active" : true),
    };
  }, [challenge, perf, positions, loading]);
}
