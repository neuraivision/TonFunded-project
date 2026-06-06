import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import WalletCard from '@/components/WalletCard';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import PerformanceSummary from '@/components/PerformanceChart';
import QuickActionButton from '@/components/QuickActionButton';
import RecentActivity from '@/components/RecentActivity';
import {
  ArrowDownLeft, ArrowUpRight, Clock, HelpCircle,
  TrendingUp, TrendingDown, Shield, Zap, ChevronRight, Activity,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { balance, pnl, pnlPercent, startingBalance, stats } = useTradingStore();
  const { activeChallenge } = useChallengeStore();

  useEffect(() => {
    const id = setInterval(() => useTradingStore.getState().updatePrices(), 5000);
    return () => clearInterval(id);
  }, []);

  const isProfit = pnl >= 0;
  const winRate = stats.totalTrades > 0 ? Math.round((stats.winningTrades / stats.totalTrades) * 100) : 0;

  return (
    <div className="pb-10 page-enter">

      {/* ── Hero balance panel ────────────────────────── */}
      <div
        className="px-5 pt-6 pb-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(158deg,#08182E 0%,#0D2440 55%,#091C34 100%)',
          borderBottom: '1px solid rgba(77,184,255,0.1)',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 85% 20%, rgba(77,184,255,0.09) 0%, transparent 70%)',
        }} />

        {/* Account label */}
        <div className="flex items-center justify-between mb-5 relative">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}
            >
              {activeChallenge ? `${activeChallenge.tierName} · Phase ${activeChallenge.phase}` : 'Demo Account'}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(77,184,255,0.1)', border: '1px solid rgba(77,184,255,0.18)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 5px rgba(74,222,128,0.8)' }} />
            <span className="text-[9px] font-700 tracking-widest" style={{ color: '#7ECFFF', fontWeight: 700 }}>LIVE</span>
          </div>
        </div>

        {/* Balance */}
        <div className="relative mb-4">
          <p className="text-[11px] mb-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Account Balance</p>
          <p className="font-number leading-none" style={{ fontSize: '40px', fontWeight: 800, color: '#fff', letterSpacing: '-0.045em' }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="font-number text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            of ${startingBalance.toLocaleString()} capital
          </p>
        </div>

        {/* P&L + stats strip */}
        <div
          className="rounded-2xl px-4 py-3 relative"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between">
            {/* P&L */}
            <div>
              <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Session P&L</p>
              <div className="flex items-center gap-2">
                <span
                  className="font-number text-[18px] leading-none"
                  style={{ fontWeight: 700, color: isProfit ? '#4ade80' : '#f87171', letterSpacing: '-0.03em' }}
                >
                  {isProfit ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                </span>
                <span
                  className="font-number text-[12px]"
                  style={{ fontWeight: 600, color: isProfit ? '#4ade80' : '#f87171' }}
                >
                  {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Win rate */}
            <div className="text-center">
              <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Win Rate</p>
              <p className="font-number text-[18px] leading-none" style={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
                {winRate}%
              </p>
            </div>

            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Trades */}
            <div className="text-right">
              <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Trades</p>
              <p className="font-number text-[18px] leading-none" style={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
                {stats.totalTrades}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* ── Wallet ─────────────────────────────────────── */}
        <WalletCard />

        {/* ── Quick Actions ───────────────────────────────── */}
        <div className="card-base !px-4 !py-4">
          <p
            className="text-[10px] uppercase tracking-[0.1em] mb-3.5"
            style={{ color: 'var(--ink-3)', fontWeight: 700 }}
          >
            Quick Actions
          </p>
          <div className="grid grid-cols-4 gap-1">
            <QuickActionButton icon={ArrowDownLeft} label="Deposit"  onClick={() => {}} />
            <QuickActionButton icon={ArrowUpRight}  label="Withdraw" onClick={() => {}} />
            <QuickActionButton icon={Clock}          label="History"  onClick={() => navigate('/trading')} />
            <QuickActionButton icon={HelpCircle}     label="Support"  onClick={() => {}} />
          </div>
        </div>

        {/* ── Challenge CTA ───────────────────────────────── */}
        {!activeChallenge && (
          <button
            onClick={() => navigate('/challenges')}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl active:opacity-80 transition-opacity"
            style={{
              background: 'linear-gradient(135deg,rgba(77,184,255,0.12) 0%,rgba(42,168,242,0.06) 100%)',
              border: '1px solid rgba(77,184,255,0.22)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(77,184,255,0.15)' }}
              >
                <Zap size={18} style={{ color: 'var(--ton)' }} />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>Start a Challenge</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-3)' }}>Get funded from $5K → $100K</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--ton)' }} />
          </button>
        )}

        {/* ── Active challenge progress ────────────────────── */}
        {activeChallenge && (
          <div className="card-base !p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: 'var(--ton)' }} />
                <p className="text-sm" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>
                  {activeChallenge.tierName} · Phase {activeChallenge.phase}
                </p>
              </div>
              <span className="font-number text-xs" style={{ fontWeight: 700, color: 'var(--ton)' }}>
                {activeChallenge.progress.percentComplete}%
              </span>
            </div>
            <div className="progress-track mb-2">
              <div
                className="progress-fill progress-fill-accent"
                style={{ width: `${Math.min(100, activeChallenge.progress.percentComplete)}%` }}
              />
            </div>
            <div className="flex justify-between">
              <p className="font-number text-[11px]" style={{ color: 'var(--ink-3)' }}>
                ${activeChallenge.progress.profitCurrent.toLocaleString()} earned
              </p>
              <p className="font-number text-[11px]" style={{ color: 'var(--ink-3)' }}>
                ${activeChallenge.progress.profitTarget.toLocaleString()} target
              </p>
            </div>
          </div>
        )}

        {/* ── Performance chart ────────────────────────────── */}
        <PerformanceSummary />

        {/* ── Drawdown monitor ─────────────────────────────── */}
        <DrawdownMonitor />

        {/* ── Platform pillars ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield,     label: 'Risk Managed',    color: 'var(--ton)',     bg: 'rgba(77,184,255,0.06)'  },
            { icon: TrendingUp, label: '80% Profit Split', color: 'var(--ink-up)', bg: 'rgba(34,197,94,0.06)'   },
            { icon: Zap,        label: 'Instant Payouts',  color: 'var(--ink-warn)',bg: 'rgba(245,158,11,0.06)' },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl py-3 px-2 flex flex-col items-center gap-1.5"
              style={{ background: f.bg }}
            >
              <f.icon size={14} style={{ color: f.color }} strokeWidth={1.8} />
              <p className="text-[9.5px] text-center leading-tight" style={{ color: f.color, fontWeight: 600 }}>{f.label}</p>
            </div>
          ))}
        </div>

        {/* ── Recent Activity ──────────────────────────────── */}
        <RecentActivity />
      </div>
    </div>
  );
}
