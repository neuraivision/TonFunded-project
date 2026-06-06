import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import WalletCard from '@/components/WalletCard';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import PerformanceSummary from '@/components/PerformanceChart';
import QuickActionButton from '@/components/QuickActionButton';
import RecentActivity from '@/components/RecentActivity';
import { ArrowDownLeft, ArrowUpRight, Clock, HelpCircle, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { balance, pnl, pnlPercent, startingBalance } = useTradingStore();
  const { activeChallenge } = useChallengeStore();

  useEffect(() => {
    const interval = setInterval(() => {
      useTradingStore.getState().updatePrices();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isProfit = pnl >= 0;

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 page-enter">

      {/* Background glow */}
      <div className="relative">
        <div
          className="absolute -top-4 -right-6 w-52 h-52 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(77,184,255,0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        <WalletCard />

        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <div className="stat-tile text-center">
            <p className="text-[10px] text-tertiary mb-1 uppercase tracking-wide">Phase</p>
            <p className="text-sm font-700 text-accent-app leading-tight" style={{ fontWeight: 700 }}>
              {activeChallenge ? `Phase ${activeChallenge.phase}` : 'No Active'}
            </p>
            <p className="text-[10px] text-tertiary mt-0.5">
              {activeChallenge?.tierName ?? 'Challenge'}
            </p>
          </div>
          <div className="stat-tile text-center">
            <p className="text-[10px] text-tertiary mb-1 uppercase tracking-wide">Balance</p>
            <p className="font-number text-sm font-700 text-primary-app leading-tight" style={{ fontWeight: 700 }}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-tertiary mt-0.5 font-number">
              /${startingBalance.toLocaleString()}
            </p>
          </div>
          <div className="stat-tile text-center">
            <p className="text-[10px] text-tertiary mb-1 uppercase tracking-wide">P&L</p>
            <p className={`font-number text-sm font-700 leading-tight ${isProfit ? 'text-success-app' : 'text-danger-app'}`} style={{ fontWeight: 700 }}>
              {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(0)}
            </p>
            <p className={`text-[10px] mt-0.5 font-number ${isProfit ? 'text-success-app' : 'text-danger-app'}`}>
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-3" style={{ fontWeight: 700 }}>Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton icon={ArrowDownLeft} label="Deposit" onClick={() => {}} />
          <QuickActionButton icon={ArrowUpRight} label="Withdraw" onClick={() => {}} />
          <QuickActionButton icon={Clock} label="History" onClick={() => navigate('/trading')} />
          <QuickActionButton icon={HelpCircle} label="Support" onClick={() => {}} />
        </div>
      </div>

      {/* Challenge CTA if no active */}
      {!activeChallenge && (
        <button
          onClick={() => navigate('/challenges')}
          className="w-full flex items-center justify-between p-4 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #1a6faa 0%, #4DB8FF 100%)', boxShadow: 'var(--shadow-accent)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-700 leading-tight" style={{ fontWeight: 700 }}>Start a Challenge</p>
              <p className="text-[11px] text-white/70">Get funded — from $5K to $100K</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-white/70" />
        </button>
      )}

      {/* Performance Summary */}
      <PerformanceSummary />

      {/* Drawdown Monitor */}
      <DrawdownMonitor />

      {/* Info pills row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield, label: 'Risk Managed', color: '#4DB8FF', bg: 'rgba(77,184,255,0.08)' },
          { icon: TrendingUp, label: '80% Profit Split', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { icon: Zap, label: 'Instant Payouts', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2"
            style={{ background: item.bg }}
          >
            <item.icon size={16} style={{ color: item.color }} />
            <p className="text-[10px] font-600 text-center leading-tight" style={{ color: item.color, fontWeight: 600 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
