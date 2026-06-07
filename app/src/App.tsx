import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import Challenges from '@/pages/Challenges';
import Trading from '@/pages/Trading';
import Swap from '@/pages/Swap';
import Leaderboard from '@/pages/Leaderboard';
import Profile from '@/pages/Profile';
import { ensureSession } from '@/lib/tonfunded';
import { syncAllFromBackend, startRealtime } from '@/lib/backendSync';

export default function App() {
  const [tonConnectUI] = useTonConnectUI();

  // Boot the backend once: authenticate, replace mock data with real data,
  // then keep balance / drawdown / positions live via realtime.
  // Fails gracefully (keeps mock data) outside Telegram / without a wallet.
  useEffect(() => {
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
  }, [tonConnectUI]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
