import {
  Target,
  ShieldAlert,
  CalendarDays,
  Wallet2,
  Rocket,
  MessageCircle,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '@/stores/challengeStore';
import LegalFooter from '@/components/LegalFooter';

function openSupport() {
  const url = 'https://t.me/tonfunded';
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openTelegramLink) tg.openTelegramLink(url);
  else window.open(url, '_blank', 'noopener');
}

function RuleRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  desc,
}: {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: iconBg }}
      >
        <Icon size={16} style={{ color: iconColor }} strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-600 text-primary-app" style={{ fontWeight: 600 }}>{title}</p>
        <p className="text-[13px] text-secondary leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const STEPS = [
  { n: '01', title: 'Pick an evaluation tier', desc: 'Choose your account size and pay the one-time eval fee in TON.' },
  { n: '02', title: 'Pass the evaluation', desc: 'Hit the profit target while staying inside the risk limits.' },
  { n: '03', title: 'Get funded & get paid', desc: 'Trade funded capital and keep up to 80% of your profits.' },
];

export default function Help() {
  const navigate = useNavigate();
  const activeChallenge = useChallengeStore((s) => s.activeChallenge);
  const isFunded = activeChallenge?.status === 'funded' || activeChallenge?.status === 'active';

  return (
    <div className="px-4 pt-4 pb-28 page-enter space-y-4">
      {/* Intro */}
      <div>
        <h2 className="text-xl font-700 text-primary-app leading-tight" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
          Help &amp; Rules
        </h2>
        <p className="text-sm text-secondary mt-1">How the TonFunded evaluation works and the rules you trade by.</p>
      </div>

      {/* How it works */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
          How it works
        </p>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="font-number text-sm font-700 text-tertiary mt-0.5" style={{ fontWeight: 700 }}>{s.n}</span>
              <div className="min-w-0">
                <p className="text-sm font-600 text-primary-app" style={{ fontWeight: 600 }}>{s.title}</p>
                <p className="text-[13px] text-secondary leading-relaxed mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading rules */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>
          Trading rules
        </p>
        <RuleRow
          icon={Target}
          iconBg="rgba(77,184,255,0.1)"
          iconColor="#4DB8FF"
          title="Profit target — 45%"
          desc="Reach a 45% gain on your starting balance to pass the evaluation."
        />
        <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
        <RuleRow
          icon={ShieldAlert}
          iconBg="rgba(239,68,68,0.1)"
          iconColor="#ef4444"
          title="Max drawdown — 25%"
          desc="Total drawdown from your starting balance must stay within 25% (end-of-day)."
        />
        <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
        <RuleRow
          icon={ShieldAlert}
          iconBg="rgba(239,68,68,0.1)"
          iconColor="#ef4444"
          title="Daily drawdown — 10%"
          desc="Your equity must not drop more than 10% below the day's starting balance."
        />
        <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
        <RuleRow
          icon={CalendarDays}
          iconBg="rgba(245,158,11,0.1)"
          iconColor="#d97706"
          title="Minimum trading days — 5"
          desc="Trade on at least 5 separate days before the evaluation can be passed."
        />
      </div>

      {/* Payouts */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>
          Funding &amp; payouts
        </p>
        <RuleRow
          icon={Wallet2}
          iconBg="rgba(34,197,94,0.1)"
          iconColor="#16a34a"
          title="Keep up to 80%"
          desc="Once funded, you keep up to 80% of the profits you generate."
        />
        <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
        <RuleRow
          icon={Rocket}
          iconBg="rgba(77,184,255,0.1)"
          iconColor="#4DB8FF"
          title="Payouts to your TON wallet"
          desc="Request a payout from your profits and receive it directly on TON."
        />
      </div>

      {/* Support */}
      <button
        onClick={openSupport}
        className="card-base !p-4 w-full flex items-center gap-3 active:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(77,184,255,0.1)' }}>
          <MessageCircle size={16} style={{ color: '#4DB8FF' }} strokeWidth={1.9} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-600 text-primary-app" style={{ fontWeight: 600 }}>Need help?</p>
          <p className="text-[13px] text-secondary leading-tight mt-0.5">Chat with the team on Telegram</p>
        </div>
        <ChevronRight size={16} className="text-tertiary" />
      </button>

      {!isFunded && (
        <button onClick={() => navigate('/challenges')} className="btn-primary w-full !py-3.5 text-base">
          <Rocket size={18} /> Get Funded
        </button>
      )}

      <LegalFooter />
    </div>
  );
}
