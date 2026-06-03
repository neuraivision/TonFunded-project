import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import Challenges from '@/pages/Challenges';
import Trading from '@/pages/Trading';
import Swap from '@/pages/Swap';
import Payouts from '@/pages/Payouts';
import Leaderboard from '@/pages/Leaderboard';
import Profile from '@/pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
