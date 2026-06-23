import { useEffect, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import AppLayout from '@/components/AppLayout';
import { syncAllFromBackend } from '@/lib/backendSync';
import { startPriceFeed, stopPriceFeed } from '@/lib/stonfi';
import { useChallengeStore } from '@/stores/challengeStore';
import { STONFI_TOKENS } from '@/stores/swapStore';

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
  const activeChallenge = useChallengeStore((s) => s.activeChallenge);

  // On mount: load data from the already-restored wallet (if any).
  // Identity = TON wallet address. No Telegram auth needed.
  useEffect(() => {
    if (pathname === '/extension-auth' || pathname === '/auth') return;
    const addr = tonConnectUI.wallet?.account?.address;
    syncAllFromBackend(addr ?? undefined).catch(console.warn);
  }, [tonConnectUI, pathname]);

  // Re-sync when wallet connects or disconnects.
  useEffect(() => {
    if (pathname === '/extension-auth' || pathname === '/auth') return;
    const unsub = tonConnectUI.onStatusChange((wallet) => {
      const addr = wallet?.account?.address;
      syncAllFromBackend(addr ?? undefined).catch(console.warn);
    });
    return unsub;
  }, [tonConnectUI, pathname]);

  // Live STON.fi price feed — runs whenever there's an active challenge.
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
    <Routes>
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
  );
}
