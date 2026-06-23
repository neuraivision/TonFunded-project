import { useEffect, lazy, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import AppLayout from '@/components/AppLayout';
import { ensureSession, loginWithWallet, supabase } from '@/lib/tonfunded';
import { syncAllFromBackend, startRealtime } from '@/lib/backendSync';
import { startPriceFeed, stopPriceFeed } from '@/lib/stonfi';
import { useChallengeStore } from '@/stores/challengeStore';
import { STONFI_TOKENS } from '@/stores/swapStore';
import NamePromptModal from '@/components/NamePromptModal';

// Lazy-load each page so the first paint only ships the shell + the current
// route's chunk (much faster first load on mobile/LTE).
const ExtensionAuth = lazy(() => import('@/pages/ExtensionAuth'));
const Auth = lazy(() => import('@/pages/Auth'));
const Home = lazy(() => import('@/pages/Home'));
const Challenges = lazy(() => import('@/pages/Challenges'));
const Trading = lazy(() => import('@/pages/Trading'));
const Swap = lazy(() => import('@/pages/Swap'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Help = lazy(() => import('@/pages/Help'));

export default function App() {
  const [tonConnectUI] = useTonConnectUI();
  const { pathname } = useLocation();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const activeChallenge = useChallengeStore((s) => s.activeChallenge);

  // Boot the backend once: authenticate, replace mock data with real data,
  // then keep balance / drawdown / positions live via realtime.
  // Fails gracefully (keeps mock data) outside Telegram / without a wallet.
  // Skip on /extension-auth — that page manages its own auth flow.
  useEffect(() => {
    if (pathname === '/extension-auth' || pathname === '/auth') return;
    let stop = () => {};
    (async () => {
      try {
        const session = await ensureSession({ tonConnectUI });
        await syncAllFromBackend();
        if (session?.user?.id) {
          stop = startRealtime(session.user.id);
          // After auth, check if the user has set a display name yet.
          const { data: profile } = await supabase
            .from('users').select('name').eq('id', session.user.id).maybeSingle();
          if (!profile?.name) setShowNamePrompt(true);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('[tonfunded] backend init skipped, using mock data:', e);
        setAuthError(msg);
      }
    })();
    return () => stop();
  }, [tonConnectUI, pathname]);

  // When wallet freshly connects (has a ton_proof), immediately switch the
  // session to the wallet identity — this is the shared identity across
  // Mini App, Terminal, and Extension.
  useEffect(() => {
    let stopRealtime = () => {};
    const unsub = tonConnectUI.onStatusChange(async (wallet) => {
      if (!wallet?.account?.address) return;
      const item = wallet.connectItems?.tonProof;
      if (!item || !("proof" in item)) return; // restored session — no proof available
      try {
        const session = await loginWithWallet(wallet);
        await syncAllFromBackend();
        stopRealtime();
        if (session?.user?.id) stopRealtime = startRealtime(session.user.id);
      } catch (e) {
        console.warn('[wallet-switch]', e);
      }
    });
    return () => { unsub(); stopRealtime(); };
  }, [tonConnectUI]);

  // Live STON.fi price feed — runs whenever there's an active challenge.
  // Polls every 4s, updates open positions with real prices via applyLivePrices.
  useEffect(() => {
    const symbols = STONFI_TOKENS.map((t) => t.symbol);
    if (activeChallenge) {
      startPriceFeed(symbols, 4000);
    } else {
      stopPriceFeed();
    }
    return () => stopPriceFeed();
  }, [activeChallenge]);

  return (
    <>
      {showNamePrompt && <NamePromptModal onDone={() => setShowNamePrompt(false)} />}
      {authError && (
        <div
          onClick={() => setAuthError(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'rgba(220,38,38,0.9)', color: '#fff', fontSize: 11,
            padding: '8px 12px', textAlign: 'center', cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          Auth error (tap to dismiss): {authError}
        </div>
      )}
    <Routes>
      {/* Standalone — no nav shell */}
      <Route path="/extension-auth" element={<ExtensionAuth />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
      </Route>
    </Routes>
    </>
  );
}
