import { useNavigate } from 'react-router-dom';
import { Lock, Rocket, ChevronRight } from 'lucide-react';

/**
 * Honest empty state shown on money-bearing pages when the user has no active
 * challenge yet. No balances or P&L — just a clear path to get funded.
 */
export default function GetFundedGate({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-10 pb-8 page-enter flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--bg-accent-light)', border: '1px solid var(--border-accent)' }}
      >
        <Lock size={26} className="text-accent-app" />
      </div>
      <h2 className="text-lg font-700 text-primary-app" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p className="text-sm text-secondary mt-2 max-w-[300px] leading-relaxed">{subtitle}</p>

      <button onClick={() => navigate('/challenges')} className="btn-primary mt-6 !px-6">
        <Rocket size={17} />
        Get Funded
        <ChevronRight size={16} />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-6 text-[11px] text-tertiary">
        <span>Up to $200K capital</span>
        <span>·</span>
        <span>80% profit split</span>
        <span>·</span>
        <span>Instant payouts</span>
      </div>
    </div>
  );
}
