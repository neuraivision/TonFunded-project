import { useEffect, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import AppLayout from '@/components/AppLayout';
import { ensureSession, loginWithWallet, supabase } from '@/lib/tonfunded';
import { syncAllFromBackend, startRealtime } from '@/lib/backendSync';

// Lazy-load each page so the first paint only ships the shell + the current
// route's chunk (much faster first load on mobile/LTE).
const ExtensionAuth = lazy(() => import('@/pages/ExtensionAuth'));
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

  // Boot the backend once: authenticate, replace mock data with real data,
  // then keep balance / drawdown / positions live via realtime.
  // Fails gracefully (keeps mock data) outside Telegram / without a wallet.
  // Skip on /extension-auth — that page manages its own auth flow.
  useEffect(() => {
    if (pathname === '/extension-auth') return;
    let stop = () => {};
    (async () => {
      try {
        const session = await ensureSession({ tonConnectUI });
        await syncAllFromBackend();
        if (session?.user?.id) stop = startRealtime(session.user.id);
      } catch (e) {
        console.warn('[tonfunded] backend init skipped, using mock data:', e);
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

  return (
    <Routes>
      {/* Standalone — no nav shell */}
      <Route path="/extension-auth" element={<ExtensionAuth />} />
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
  );
}
