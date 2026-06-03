import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import WalletCard from '@/components/WalletCard';
import DrawdownMonitor from '@/components/DrawdownMonitor';
import PerformanceSummary from '@/components/PerformanceChart';
import QuickActionButton from '@/components/QuickActionButton';
import RecentActivity from '@/components/RecentActivity';
import { ArrowDownLeft, ArrowUpRight, Clock, HelpCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { balance, pnl, pnlPercent, startingBalance } = useTradingStore();
  const { activeChallenge } = useChallengeStore();

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      useTradingStore.getState().updatePrices();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isProfit = pnl >= 0;

  return (
    <div className="px-4 pt-4 pb-8 space-y-5 page-enter">

      {/* Hero gradient background */}
      <div className="relative">
        <div
          className="absolute -top-4 -right-4 w-48 h-48 rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #4DB8FF 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Wallet Card */}
        <WalletCard />

        {/* Status Overview Row */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="card-base !p-3.5 text-center">
            <p className="text-xs text-secondary mb-1">Account Type</p>
            <p className="text-base font-bold text-accent-app">
              {activeChallenge ? `Phase ${activeChallenge.phase}` : 'No Active'}
            </p>
            <p className="text-[11px] text-secondary">
              {activeChallenge?.tierName ?? 'Challenge'}
            </p>
          </div>
          <div className="card-base !p-3.5 text-center">
            <p className="text-xs text-secondary mb-1">Balance</p>
            <p className="text-base font-bold text-primary-app">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-secondary">
              Starting: ${startingBalance.toLocaleString()}
            </p>
          </div>
          <div className="card-base !p-3.5 text-center">
            <p className="text-xs text-secondary mb-1">P&L</p>
            <p className={`text-base font-bold ${isProfit ? 'text-success-app' : 'text-danger-app'}`}>
              {isProfit ? '+' : ''}${pnl.toFixed(2)}
            </p>
            <p className={`text-[11px] ${isProfit ? 'text-success-app' : 'text-danger-app'}`}>
              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-around">
        <QuickActionButton
          icon={ArrowDownLeft}
          label="Deposit"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={ArrowUpRight}
          label="Withdraw"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={Clock}
          label="History"
          onClick={() => navigate('/trading')}
        />
        <QuickActionButton
          icon={HelpCircle}
          label="Support"
          onClick={() => {}}
        />
      </div>

      {/* Performance Summary */}
      <PerformanceSummary />

      {/* Drawdown Monitor */}
      <DrawdownMonitor />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
