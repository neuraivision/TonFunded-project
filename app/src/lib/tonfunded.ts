// =============================================================================
// TonFunded — single-file Supabase client for the Telegram Mini App.
// Drop into: src/lib/tonfunded.ts
// Deps: npm i @supabase/supabase-js @tonconnect/ui-react
// Env (.env):  VITE_SUPABASE_URL=...   VITE_SUPABASE_ANON_KEY=...   (anon only)
// =============================================================================
import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TonConnectUI, Wallet } from "@tonconnect/ui-react";

/* ------------------------------- Row types -------------------------------- */
// Supabase is used without generated DB types, so we model the columns we read.
export interface RiskRulesRow {
  daily_drawdown_pct?: number;
  overall_drawdown_pct?: number;
  funded_amount?: number;
  [key: string]: unknown;
}
export interface ChallengeRow {
  id?: string;
  status?: string;
  current_balance?: number;
  breach_reason?: string | null;
  risk_rules?: RiskRulesRow | null;
  [key: string]: unknown;
}
export interface PerformanceRow {
  challenge_id?: string;
  balance?: number;
  daily_drawdown?: number;
  overall_drawdown?: number;
  profit_target_progress?: number;
  [key: string]: unknown;
}
export interface TradeRow {
  id?: string;
  challenge_id?: string;
  status?: string;
  [key: string]: unknown;
}

/* ------------------------------- 1. Client -------------------------------- */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || "";
const SUPABASE_ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || "";

/** True only when both env vars are present. When false, the app runs on local
 *  mock data and all backend calls fail fast (callers fall back gracefully). */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON);

if (!supabaseEnabled && typeof console !== "undefined") {
  console.warn(
    "[tonfunded] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — " +
      "running in offline/mock mode (no backend).",
  );
}

const FUNCTIONS = `${SUPABASE_URL}/functions/v1`;

// Use placeholder values when env is missing so createClient never THROWS at
// import time (a throw here would white-screen the whole app before React mounts).
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON || "placeholder-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } },
);

async function callFn<T = unknown>(name: string, body: unknown): Promise<T> {
  if (!supabaseEnabled) throw new Error("Backend not configured");
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

export async function loginWithTonConnect(tonConnectUI: TonConnectUI, payload = crypto.randomUUID()) {
  tonConnectUI.setConnectRequestParameters({ state: "ready", value: { tonProof: payload } });
  let wallet: Wallet | null = tonConnectUI.wallet;
  if (!wallet) {
    wallet = await new Promise<Wallet>((resolve, reject) => {
      const unsub = tonConnectUI.onStatusChange((w) => { if (w) { unsub(); resolve(w); } }, reject);
      tonConnectUI.openModal();
    });
  }
  const item = wallet.connectItems?.tonProof;
  if (!item || !("proof" in item)) throw new Error("Wallet returned no ton_proof — reconnect");
  return exchange("auth-ton", {
    address: wallet.account.address, publicKey: wallet.account.publicKey,
    proof: {
      timestamp: item.proof.timestamp, domain: item.proof.domain,
      payload: item.proof.payload, signature: item.proof.signature,
    },
  });
}

export async function loginWithTelegram(referralCode?: string) {
  const initData = window.Telegram?.WebApp?.initData ?? "";
  if (!initData) throw new Error("Not running inside Telegram");
  return exchange("auth-telegram", { initData, referralCode });
}

export async function ensureSession(opts?: { tonConnectUI?: TonConnectUI; referralCode?: string }) {
  if (!supabaseEnabled) throw new Error("Backend not configured");
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;
  if (opts?.tonConnectUI?.wallet) {
    try { return await loginWithTonConnect(opts.tonConnectUI); } catch (e) { console.warn(e); }
  }
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
  callFn<{ challenge: { id: string } }>("challenges", { action: "purchase", tier });
export const confirmPayment = (challengeId: string, txHash: string) =>
  callFn<{ ok: boolean }>("challenges", { action: "confirm_payment", challengeId, txHash });
export const recordTrade = (t: {
  token: string; side: "buy" | "sell"; amount: number;
  entryPrice: number; exitPrice?: number; challengeId?: string;
}) => callFn("trades", t);
export const requestPayout = (challengeId: string, amount?: number) =>
  callFn("payouts", { action: "request", challengeId, amount });

/* ----------------------- 5. Real-time subscriptions ----------------------- */
export function subscribeRisk(userId: string, h: {
  onPerformance?: (row: PerformanceRow) => void;
  onChallenge?: (row: ChallengeRow) => void;
  onTrade?: (row: TradeRow) => void;
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
  const [challenge, setChallenge] = useState<ChallengeRow | null>(null);
  const [perf, setPerf] = useState<PerformanceRow | null>(null);
  const [positions, setPositions] = useState<TradeRow[]>([]);
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
      onPerformance: (r) => { if (!cid.current || r.challenge_id === cid.current) setPerf(r); },
      onChallenge:   (r) => { if (!cid.current || r.id === cid.current) setChallenge((c) => ({ ...(c ?? {}), ...r })); },
      onTrade:       () => { if (cid.current) getOpenPositions(cid.current).then(({ data }) => setPositions((data ?? []) as TradeRow[])); },
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
