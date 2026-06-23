import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
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
import { loginWithTonConnect } from '@/lib/tonfunded';
import { syncAllFromBackend } from '@/lib/backendSync';
import {
  Rocket, Banknote, Clock, LifeBuoy,
  TrendingUp, TrendingDown, Shield, Zap, ChevronRight,
  Check, BarChart3, Wallet, Trophy, RefreshCw,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const connectedWallet = useTonWallet();
  const { balance, pnl, pnlPercent, startingBalance } = useTradingStore();
  const { activeChallenge, tiers } = useChallengeStore();
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const verifyWallet = async () => {
    setVerifying(true);
    try {
      await loginWithTonConnect(tonConnectUI);
      await syncAllFromBackend();
    } catch (e) {
      console.warn('[verify-wallet]', e);
    } finally {
      setVerifying(false);
    }
  };

  // Lowest eval fee, derived from the live tiers so this never goes stale.
  const minFee = tiers.length ? Math.min(...tiers.map((t) => t.fee)) : 0;
  const minFeeLabel = Number.isInteger(minFee)
    ? `${minFee.toLocaleString()}`
    : minFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const openSupport = () => {
    const url = 'https://t.me/tonfunded';
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener');
  };

  const isProfit = pnl >= 0;

  // ── Pre-funded state: NO money shown until the user buys a challenge ──────
  if (!activeChallenge) {
    return (
      <div className="px-4 pt-5 pb-8 space-y-4 page-enter">
        {/* Hero CTA */}
        <div
          className="rounded-2xl px-5 pt-6 pb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(150deg, #091828 0%, #0d2138 55%, #081624 100%)' }}
        >
          <div className="absolute top-0 right-0 w-52 h-52 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.12) 0%, transparent 65%)', transform: 'translate(25%,-25%)' }} />
          <div className="absolute bottom-0 left-0 w-36 h-36 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.07) 0%, transparent 65%)', transform: 'translate(-20%,20%)' }} />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4"
              style={{ background: 'rgba(77,184,255,0.12)', border: '1px solid rgba(77,184,255,0.22)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.7)' }} />
              <span className="text-[9.5px] font-700 text-blue-300 tracking-widest" style={{ fontWeight: 700 }}>NOW ONBOARDING</span>
            </span>
            <h1 className="text-[26px] leading-[1.12] text-white" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
              Get funded to trade<br />on TON Blockchain.
            </h1>
            <p className="text-[13px] text-white/55 mt-2.5 leading-relaxed max-w-[310px]">
              Pass a one-phase evaluation, trade up to $200K of our capital, and keep up to 80% of your profits.
            </p>
            <button onClick={() => navigate('/challenges')} className="btn-primary w-full mt-5">
              <Rocket size={18} /> Get Funded
            </button>

            {/* If wallet already connected but challenge not loading — re-auth with fresh proof */}
            {connectedWallet && (
              <button
                onClick={verifyWallet}
                disabled={verifying}
                className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-opacity active:opacity-70"
                style={{ background: 'rgba(77,184,255,0.1)', border: '1px solid rgba(77,184,255,0.22)', color: '#4DB8FF' }}
              >
                <RefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
                {verifying ? 'Verifying wallet…' : 'Already funded? Verify wallet'}
              </button>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[11px] text-white/55">
              <span className="flex items-center gap-1.5"><Check size={13} style={{ color: '#4DB8FF' }} /> No deposit to trade</span>
              <span className="flex items-center gap-1.5"><Check size={13} style={{ color: '#4DB8FF' }} /> 80% profit split</span>
              <span className="flex items-center gap-1.5"><Check size={13} style={{ color: '#4DB8FF' }} /> Instant payouts</span>
            </div>
          </div>
        </div>

        {/* Wallet */}
        <WalletCard />

        {/* How it works */}
        <div className="rounded-2xl px-4 py-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-[10px] font-700 text-tertiary uppercase tracking-[0.1em] mb-3.5" style={{ fontWeight: 700 }}>How it works</p>
          <div className="space-y-3.5">
            {[
              { icon: BarChart3, t: 'Pass the evaluation', d: 'Hit a 45% profit target within the risk rules.' },
              { icon: Rocket, t: 'Get funded', d: 'Unlock a funded account up to $200,000.' },
              { icon: Wallet, t: 'Get paid', d: 'Withdraw up to 80% of profits to your TON wallet.' },
            ].map((s, i) => (
              <div key={s.t} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-accent-light)', border: '1px solid var(--border-accent)' }}>
                  <s.icon size={16} className="text-accent-app" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-600 text-primary-app" style={{ fontWeight: 600 }}>{s.t}</p>
                  <p className="text-[12px] text-tertiary leading-snug">{s.d}</p>
                </div>
                <span className="font-number text-[13px] text-tertiary" style={{ fontWeight: 700 }}>0{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers teaser → Challenges */}
        <button
          onClick={() => navigate('/challenges')}
          className="w-full flex items-center justify-between px-4 py-4 rounded-2xl active:opacity-80 transition-opacity"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(77,184,255,0.1)' }}>
              <Trophy size={17} style={{ color: '#4DB8FF' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>Evaluation tiers</p>
              <p className="text-[11px] text-tertiary mt-0.5">$5K to $200K · from ${minFeeLabel}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-tertiary" />
        </button>

        {/* Platform pillars */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield,     text: 'Risk Managed',     color: '#4DB8FF', bg: 'rgba(77,184,255,0.06)' },
            { icon: TrendingUp, text: '80% Profit Split', color: '#22c55e', bg: 'rgba(34,197,94,0.06)' },
            { icon: Zap,        text: 'Instant Payouts',  color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
          ].map((f) => (
            <div key={f.text} className="rounded-xl py-3 px-2 flex flex-col items-center gap-1.5" style={{ background: f.bg }}>
              <f.icon size={14} style={{ color: f.color }} strokeWidth={1.8} />
              <p className="text-[9.5px] text-center leading-tight" style={{ color: f.color, fontWeight: 600 }}>{f.text}</p>
            </div>
          ))}
        </div>

        <LegalFooter />
      </div>
    );
  }

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
          <span className="text-[10px] font-600 text-white/60 uppercase tracking-[0.1em]" style={{ fontWeight: 600 }}>
            {activeChallenge ? `${activeChallenge.tierName} · Phase ${activeChallenge.phase}` : 'Demo Account'}
          </span>
          {(() => {
            const st = activeChallenge?.status;
            const isFunded   = st === 'funded';
            const isPassed   = st === 'completed';
            const isFailed   = st === 'failed';
            const label      = isFunded ? 'FUNDED' : isPassed ? 'PASSED' : isFailed ? 'FAILED' : 'EVALUATION';
            const bg         = isFunded || isPassed ? 'rgba(34,197,94,0.14)' : isFailed ? 'rgba(239,68,68,0.14)' : 'rgba(77,184,255,0.12)';
            const border     = isFunded || isPassed ? 'rgba(34,197,94,0.3)'  : isFailed ? 'rgba(239,68,68,0.3)'  : 'rgba(77,184,255,0.2)';
            const dotColor   = isFunded || isPassed ? 'rgb(74,222,128)'      : isFailed ? 'rgb(239,68,68)'       : 'rgb(74,222,128)';
            const textColor  = isFunded || isPassed ? 'rgb(134,239,172)'     : isFailed ? 'rgb(252,165,165)'     : 'rgb(147,197,253)';
            return (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: bg, border: `1px solid ${border}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />
                <span className="text-[9px] tracking-widest" style={{ fontWeight: 700, color: textColor }}>{label}</span>
              </div>
            );
          })()}
        </div>

        {/* Balance */}
        <p className="font-number text-[38px] text-white leading-none" style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-white/55 mt-1.5 font-number">
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
          <span className="text-[10px] text-white/50">Today's P&L</span>
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
              <p className="text-[11px] text-blue-300/60 mt-0.5">Get funded from $5K to $200K</p>
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
