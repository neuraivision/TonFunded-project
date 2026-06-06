import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import WalletCard from '@/components/WalletCard';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import PerformanceSummary from '@/components/PerformanceChart';
import QuickActionButton from '@/components/QuickActionButton';
import RecentActivity from '@/components/RecentActivity';
import PayoutModal from '@/components/PayoutModal';
import LegalFooter from '@/components/LegalFooter';
import { formatPct } from '@/lib/utils';
import {
  Rocket, Banknote, Clock, LifeBuoy,
  TrendingUp, TrendingDown, Shield, Zap, ChevronRight,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { balance, pnl, pnlPercent, startingBalance } = useTradingStore();
  const { activeChallenge } = useChallengeStore();
  const [payoutOpen, setPayoutOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => useTradingStore.getState().updatePrices(), 5000);
    return () => clearInterval(id);
  }, []);

  const openSupport = () => {
    const url = 'https://t.me/tonfunded';
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener');
  };

  const isProfit = pnl >= 0;

  return (
    <div className="px-4 pt-5 pb-8 space-y-3 page-enter">

      {/* ── Hero balance card ──────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 pt-5 pb-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #091828 0%, #0d2138 55%, #081624 100%)',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-52 h-52 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.1) 0%, transparent 65%)', transform: 'translate(25%,-25%)' }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.06) 0%, transparent 65%)', transform: 'translate(-20%,20%)' }} />

        {/* Account type */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-600 text-white/40 uppercase tracking-[0.1em]" style={{ fontWeight: 600 }}>
            {activeChallenge ? `${activeChallenge.tierName} · Phase ${activeChallenge.phase}` : 'Demo Account'}
          </span>
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(77,184,255,0.12)', border: '1px solid rgba(77,184,255,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.7)' }} />
            <span className="text-[9px] font-700 text-blue-300 tracking-widest" style={{ fontWeight: 700 }}>EVALUATION</span>
          </div>
        </div>

        {/* Balance */}
        <p className="font-number text-[38px] text-white leading-none" style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-white/30 mt-1.5 font-number">
          of ${startingBalance.toLocaleString()} starting capital
        </p>

        {/* Divider */}
        <div className="mt-4 mb-3.5" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* P&L row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: isProfit ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${isProfit ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {isProfit
                ? <TrendingUp size={11} style={{ color: '#4ade80' }} />
                : <TrendingDown size={11} style={{ color: '#f87171' }} />}
              <span className="font-number text-xs font-700" style={{ color: isProfit ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                {isProfit ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
              </span>
            </div>
            <span className="font-number text-xs font-700" style={{ color: isProfit ? '#4ade80' : '#f87171', fontWeight: 700 }}>
              {formatPct(pnlPercent, 2)}
            </span>
          </div>
          <span className="text-[10px] text-white/25">Today's P&L</span>
        </div>
      </div>

      {/* ── Wallet ─────────────────────────────────────────────── */}
      <WalletCard />

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      >
        <p className="text-[10px] font-700 text-tertiary uppercase tracking-[0.1em] mb-3.5" style={{ fontWeight: 700 }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton icon={Rocket}   label="Get Funded"     color="#4DB8FF" primary onClick={() => navigate('/challenges')} />
          <QuickActionButton icon={Banknote} label="Request Payout" color="#16a34a" onClick={() => setPayoutOpen(true)} />
          <QuickActionButton icon={Clock}    label="History"        color="#6366f1" onClick={() => navigate('/trading')} />
          <QuickActionButton icon={LifeBuoy} label="Support"        color="#f59e0b" onClick={openSupport} />
        </div>
      </div>

      {/* ── Challenge CTA (only when no active challenge) ────────── */}
      {!activeChallenge && (
        <button
          onClick={() => navigate('/challenges')}
          className="w-full flex items-center justify-between px-4 py-4 rounded-2xl active:opacity-80 transition-opacity"
          style={{
            background: 'linear-gradient(130deg, #0e3a5c 0%, #0d4a7a 100%)',
            border: '1px solid rgba(77,184,255,0.2)',
            boxShadow: '0 4px 20px rgba(77,184,255,0.12)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(77,184,255,0.2)' }}
            >
              <Zap size={17} style={{ color: '#4DB8FF' }} />
            </div>
            <div className="text-left">
              <p className="text-sm text-white leading-tight" style={{ fontWeight: 700 }}>Start a Challenge</p>
              <p className="text-[11px] text-blue-300/60 mt-0.5">Get funded from $5K to $100K</p>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: 'rgba(77,184,255,0.5)' }} />
        </button>
      )}

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Balance', value: `$${(balance / 1000).toFixed(1)}K`, sub: 'Account' },
          { label: 'Return',  value: formatPct(pnlPercent, 1), sub: 'P&L', profit: isProfit },
          { label: 'Phase',   value: activeChallenge ? `P${activeChallenge.phase}` : '—', sub: activeChallenge?.tierName ?? 'Inactive' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-3 py-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-[10px] text-tertiary mb-1">{s.label}</p>
            <p
              className="font-number text-[15px] leading-none"
              style={{
                fontWeight: 700,
                color: s.profit !== undefined
                  ? (s.profit ? 'var(--text-success)' : 'var(--text-danger)')
                  : 'var(--text-primary)',
              }}
            >
              {s.value}
            </p>
            <p className="text-[10px] text-tertiary mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Performance chart ──────────────────────────────────── */}
      <PerformanceSummary />

      {/* ── Drawdown monitor ───────────────────────────────────── */}
      <DrawdownMonitor />

      {/* ── Platform pillars ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield,     text: 'Risk Managed',    color: '#4DB8FF', bg: 'rgba(77,184,255,0.06)'  },
          { icon: TrendingUp, text: '80% Profit Split', color: '#22c55e', bg: 'rgba(34,197,94,0.06)'   },
          { icon: Zap,        text: 'Instant Payouts',  color: '#f59e0b', bg: 'rgba(245,158,11,0.06)'  },
        ].map((f) => (
          <div
            key={f.text}
            className="rounded-xl py-3 px-2 flex flex-col items-center gap-1.5"
            style={{ background: f.bg }}
          >
            <f.icon size={14} style={{ color: f.color }} strokeWidth={1.8} />
            <p className="text-[9.5px] text-center leading-tight" style={{ color: f.color, fontWeight: 600 }}>{f.text}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ─────────────────────────────────────── */}
      <RecentActivity />

      {/* ── Risk disclosure + legal ─────────────────────────────── */}
      <LegalFooter />

      <PayoutModal isOpen={payoutOpen} onClose={() => setPayoutOpen(false)} />
    </div>
  );
}
