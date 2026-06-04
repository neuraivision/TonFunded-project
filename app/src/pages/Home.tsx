import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import WalletCard from '@/components/WalletCard';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import PerformanceSummary from '@/components/PerformanceChart';
import QuickActionButton from '@/components/QuickActionButton';
import RecentActivity from '@/components/RecentActivity';
import { ArrowDownLeft, ArrowUpRight, Clock, HelpCircle, TrendingUp, TrendingDown, ChevronRight, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { balance, pnl, pnlPercent, startingBalance, positions, stats, profitTarget } = useTradingStore();
  const { activeChallenge } = useChallengeStore();

  useEffect(() => {
    const interval = setInterval(() => useTradingStore.getState().updatePrices(), 5000);
    return () => clearInterval(interval);
  }, []);

  const isProfit = pnl >= 0;
  const balanceDelta = balance - startingBalance;

  return (
    <div className="pb-8 page-enter">

      {/* ── Hero gradient banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4DB8FF] via-[#2aa8f0] to-[#1a7fc4] px-5 pt-5 pb-8">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/75 text-[11px] font-semibold">
                {activeChallenge ? `${activeChallenge.tierName} · Phase ${activeChallenge.phase}` : 'Demo Account'}
              </span>
            </div>
          </div>

          <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Total Balance</p>
          <p className="text-white text-[32px] font-bold tracking-tight leading-tight mt-0.5">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <div className="flex items-center gap-3 mt-1.5">
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isProfit ? 'bg-green-400/25 text-green-200' : 'bg-red-400/25 text-red-200'}`}>
              {isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% today
            </div>
            <span className="text-white/50 text-xs">
              {balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(2)} all time
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-2 pt-4">

        {/* ── 3-stat cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="card-base !p-3.5 text-center">
            <p className="text-[10px] text-secondary mb-1 font-medium">Account Type</p>
            <p className="text-sm font-bold text-accent-app">
              {activeChallenge ? `Phase ${activeChallenge.phase}` : 'Demo'}
            </p>
            <p className="text-[10px] text-secondary mt-0.5">{activeChallenge?.tierName ?? 'No challenge'}</p>
          </div>
          <div className="card-base !p-3.5 text-center">
            <p className="text-[10px] text-secondary mb-1 font-medium">Balance</p>
            <p className="text-sm font-bold text-primary-app">
              ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-secondary mt-0.5">of ${startingBalance.toLocaleString()}</p>
          </div>
          <div className="card-base !p-3.5 text-center">
            <p className="text-[10px] text-secondary mb-1 font-medium">P&L</p>
            <p className={`text-sm font-bold ${isProfit ? 'text-success-app' : 'text-danger-app'}`}>
              {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
            </p>
            <p className={`text-[10px] mt-0.5 ${isProfit ? 'text-success-app' : 'text-danger-app'}`}>
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* ── Profit target progress ────────────────────────────────── */}
        <div className="card-base">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-primary-app">Profit Target</span>
            <span className="text-sm font-bold text-accent-app">
              ${profitTarget.current.toFixed(0)} / ${profitTarget.target}
            </span>
          </div>
          <div className="progress-track !h-2">
            <div
              className="progress-fill bg-gradient-to-r from-[#4DB8FF] to-cyan-400"
              style={{ width: `${Math.min(profitTarget.percentComplete, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-accent-app font-semibold">{profitTarget.percentComplete.toFixed(1)}% complete</span>
            <span className="text-[11px] text-tertiary">${(profitTarget.target - profitTarget.current).toFixed(0)} to funded</span>
          </div>
        </div>

        {/* ── Wallet card ───────────────────────────────────────────── */}
        <WalletCard />

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2.5">
          <QuickActionButton icon={ArrowDownLeft} label="Deposit"  onClick={() => {}} />
          <QuickActionButton icon={ArrowUpRight}  label="Withdraw" onClick={() => {}} />
          <QuickActionButton icon={Clock}         label="History"  onClick={() => navigate('/trading')} />
          <QuickActionButton icon={HelpCircle}    label="Support"  onClick={() => {}} />
        </div>

        {/* ── Live positions preview ────────────────────────────────── */}
        {positions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-primary-app">Live Positions ({positions.length})</span>
              </div>
              <button onClick={() => navigate('/trading')} className="flex items-center gap-0.5 text-xs font-bold text-accent-app">
                Manage <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {positions.map(pos => (
                <div key={pos.id} className={`card-base !p-3 border-l-[3px] ${pos.pnl >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-accent-app">{pos.tokenName.slice(0,2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-primary-app">{pos.tokenName}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${pos.direction === 'long' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {pos.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                        </span>
                      </div>
                      <p className="text-[11px] text-tertiary">{pos.tokenPair}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                      </p>
                      <p className={`text-[11px] ${pos.pnl >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Performance Summary ───────────────────────────────────── */}
        <PerformanceSummary />

        {/* ── Drawdown Monitor ──────────────────────────────────────── */}
        <DrawdownMonitor />

        {/* ── Recent Activity ───────────────────────────────────────── */}
        <RecentActivity />
      </div>
    </div>
  );
}
