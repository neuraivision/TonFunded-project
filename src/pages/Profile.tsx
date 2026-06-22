import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/tonfunded';
import {
  ChevronRight,
  Copy,
  CheckCircle,
  DollarSign,
  Users,
  Trophy,
  HelpCircle,
  FileText,
  Bell,
  LogOut,
  Wallet,
  TrendingUp,
  Flame,
  Camera,
  Share2,
  Gift,
  Star,
  ArrowUpRight,
  Rocket,
} from 'lucide-react';
import { useTonWallet } from '@/hooks/useTonWallet';
import { useReferralStore } from '@/stores/referralStore';
import { useTradingStore } from '@/stores/tradingStore';
import { useChallengeStore } from '@/stores/challengeStore';
import PayoutModal from '@/components/PayoutModal';
import LegalFooter from '@/components/LegalFooter';
import { formatPct } from '@/lib/utils';

function MenuItem({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  onClick,
  danger,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  danger?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 active:bg-surface-app transition-colors rounded-xl px-1"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ background: iconBg }}
      >
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <span
        className={`flex-1 text-sm font-500 text-left`}
        style={{ color: danger ? '#dc2626' : 'var(--text-primary)', fontWeight: 500 }}
      >
        {label}
      </span>
      {badge && (
        <span
          className="text-[10px] font-700 px-2 py-0.5 rounded-full mr-1"
          style={{ background: 'rgba(77,184,255,0.12)', color: '#2aa8f2', fontWeight: 700 }}
        >
          {badge}
        </span>
      )}
      {value && <span className="text-xs font-600 text-secondary mr-1">{value}</span>}
      <ChevronRight size={14} className="text-tertiary" />
    </button>
  );
}

function ReferralFriendRow({
  displayName,
  status,
  earnings,
}: {
  displayName: string;
  status: string;
  earnings: number;
}) {
  const statusStyle =
    status === 'earned'
      ? { bg: 'rgba(22,163,74,0.1)', color: '#15803d' }
      : status === 'active'
        ? { bg: 'rgba(77,184,255,0.1)', color: '#2aa8f2' }
        : { bg: 'var(--bg-surface)', color: 'var(--text-tertiary)' };

  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-accent-light)' }}
        >
          <span className="text-xs font-700 text-accent-app" style={{ fontWeight: 700 }}>
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-500 text-primary-app leading-tight" style={{ fontWeight: 500 }}>{displayName}</p>
          <span
            className="text-[10px] font-700 px-2 py-0.5 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      <p className={`text-sm font-number font-600 ${earnings > 0 ? 'text-success-app' : 'text-tertiary'}`} style={{ fontWeight: 600 }}>
        {earnings > 0 ? `+$${earnings.toFixed(2)}` : '—'}
      </p>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { truncatedAddress, isConnected, connect, disconnect } = useTonWallet();
  const { info, linkCopied, copyReferralLink } = useReferralStore();
  const { stats, profitTarget, balance, startingBalance, pnl } = useTradingStore();
  const activeChallenge = useChallengeStore((s) => s.activeChallenge);

  // Payout is available only when the challenge is funded/completed AND there's actual profit
  const challengeStatus = activeChallenge?.status;
  const payoutAvailable =
    (challengeStatus === 'funded' || challengeStatus === 'completed') && pnl > 0;

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState<string>('/logo-192.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real name from Supabase
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('users').select('name').eq('id', session.user.id).maybeSingle()
        .then(({ data }) => {
          const n = data?.name || session.user.user_metadata?.name || '';
          setDisplayName(n);
          setNameInput(n);
        });
    });
  }, []);

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === displayName) { setEditingName(false); return; }
    setSavingName(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await supabase.from('users').update({ name: trimmed }).eq('id', session.user.id);
    setDisplayName(trimmed);
    setEditingName(false);
    setSavingName(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAvatarSrc(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const profitPct = ((balance - startingBalance) / startingBalance) * 100;

  return (
    <div className="px-4 pt-4 pb-6 page-enter space-y-4">

      {/* Profile Hero Card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f1a2a 0%, #1a2a40 50%, #0f1e30 100%)',
        }}
      >
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.15) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
        />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,184,255,0.1) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }}
        />

        <div className="flex items-center gap-4 relative">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative block w-16 h-16 rounded-2xl overflow-hidden active:opacity-80 transition-opacity focus:outline-none"
              style={{ boxShadow: '0 0 0 2px rgba(77,184,255,0.4), 0 4px 16px rgba(0,0,0,0.3)' }}
              aria-label="Change profile photo"
            >
              <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1.5 opacity-0 hover:opacity-100 transition-opacity">
                <Camera size={13} className="text-white" />
              </div>
            </button>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}
              style={{ borderColor: '#1a2a40' }}
            />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="text-sm font-700 text-white bg-white/10 rounded-lg px-2 py-1 outline-none border border-white/20 w-36"
                  style={{ fontWeight: 700 }}
                />
                <button onClick={saveName} disabled={savingName} className="text-xs text-[#4DB8FF] font-700 disabled:opacity-50">
                  {savingName ? '…' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-lg font-700 text-white leading-tight text-left group flex items-center gap-1.5"
                style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                {displayName || (activeChallenge ? 'Funded Trader' : 'New Trader')}
                <span className="opacity-0 group-hover:opacity-60 transition-opacity text-xs text-blue-300">✏</span>
              </button>
            )}
            {isConnected && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.6)' }} />
                <p className="text-xs font-mono text-blue-300 truncate">{truncatedAddress}</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              {activeChallenge ? (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-700 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(77,184,255,0.2)', color: '#4DB8FF', fontWeight: 700 }}
                >
                  <Star size={10} className="fill-current" />
                  Prop Trader
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-700 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.18)', color: '#fbbf24', fontWeight: 700 }}
                >
                  Unfunded
                </span>
              )}
              {isConnected && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-600 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 600 }}
                >
                  Connected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Performance mini stats — only once funded */}
        {activeChallenge ? (
          <div className="grid grid-cols-3 gap-2 mt-4 relative">
            {[
              { label: 'P&L', value: formatPct(profitPct, 1), color: profitPct >= 0 ? '#4ade80' : '#f87171', icon: TrendingUp },
              { label: 'Win Rate', value: `${stats.winRate}%`, color: '#4DB8FF', icon: Trophy },
              { label: 'Best Streak', value: `${stats.maxConsecutiveWins}W`, color: '#fbbf24', icon: Flame },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 rounded-xl py-2.5"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <p className="font-number text-base font-700 leading-none" style={{ color: s.color, fontWeight: 700 }}>{s.value}</p>
                <p className="text-[10px] text-blue-200/60">{s.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 relative">
            <p className="text-[12.5px] text-blue-200/70 leading-snug mb-3">
              Get Funded to unlock trading, payouts, the leaderboard &amp; your stats.
            </p>
            <button onClick={() => navigate('/challenges')} className="btn-primary w-full !py-3.5 text-base">
              <Rocket size={18} /> Get Funded
            </button>
          </div>
        )}
      </div>

      {/* Profit Target Progress — only once funded */}
      {activeChallenge && (
        <div className="card-base !p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>Profit Target</p>
            <span className="text-xs font-600 text-accent-app">
              {profitTarget.percentComplete.toFixed(1)}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill progress-fill-accent"
              style={{ width: `${Math.min(100, profitTarget.percentComplete)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-tertiary font-number">
              ${profitTarget.current.toFixed(0)} earned
            </p>
            <p className="text-[11px] text-tertiary font-number">
              ${(profitTarget.target - profitTarget.current).toFixed(0)} remaining
            </p>
          </div>
        </div>
      )}

      {/* Referral System — funded traders only */}
      {activeChallenge && (
      <div className="card-base !p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center">
              <Gift size={15} className="text-accent-app" />
            </div>
            <div>
              <h3 className="text-sm font-700 text-primary-app leading-tight" style={{ fontWeight: 700 }}>Referral Programme</h3>
              <p className="text-[11px] text-tertiary">Earn on every referral</p>
            </div>
          </div>
          <span
            className="text-xs font-700 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(22,163,74,0.1)', color: '#15803d', fontWeight: 700 }}
          >
            {info.commissionPct}% commission
          </span>
        </div>

        {/* Referral stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Referred', value: info.totalReferrals, color: 'text-primary-app', bg: 'var(--bg-surface)' },
            { label: 'Earned', value: `$${info.totalEarningsUsd.toFixed(0)}`, color: 'text-success-app', bg: 'rgba(22,163,74,0.06)' },
            { label: 'Pending', value: `$${info.pendingEarningsUsd.toFixed(0)}`, color: 'text-warning-app', bg: 'rgba(245,158,11,0.06)' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ background: s.bg }}
            >
              <p className={`font-number text-base font-700 ${s.color} leading-tight`} style={{ fontWeight: 700 }}>{s.value}</p>
              <p className="text-[10px] text-tertiary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Copy link button */}
        <button
          onClick={copyReferralLink}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-98"
          style={{
            background: linkCopied ? 'rgba(22,163,74,0.06)' : 'var(--bg-surface)',
            border: `1.5px solid ${linkCopied ? 'rgba(22,163,74,0.25)' : 'var(--border-default)'}`,
          }}
        >
          <div className="text-left">
            <p className="text-[10px] text-tertiary uppercase tracking-wide">Referral Code</p>
            <p className="font-mono text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>{info.referralCode}</p>
          </div>
          {linkCopied ? (
            <div className="flex items-center gap-1.5 text-success-app">
              <CheckCircle size={15} />
              <span className="text-xs font-600">Copied!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-accent-app">
                <Copy size={14} />
                <span className="text-xs font-600">Copy</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-secondary">
                <Share2 size={14} />
                <span className="text-xs font-600">Share</span>
              </div>
            </div>
          )}
        </button>

        {/* Friends list */}
        {info.friends.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-600 text-tertiary uppercase tracking-wide mb-2">
              Your Referrals
            </p>
            {info.friends.map((f) => (
              <ReferralFriendRow
                key={f.id}
                displayName={f.displayName}
                status={f.status}
                earnings={f.earningsGenerated}
              />
            ))}
          </div>
        )}
      </div>
      )}

      {/* Account Section */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>
          Account
        </p>
        {activeChallenge && (
          <>
            <MenuItem
              icon={DollarSign}
              label="Request Payout"
              iconBg="rgba(22,163,74,0.1)"
              iconColor="#16a34a"
              onClick={() => setPayoutOpen(true)}
              badge={payoutAvailable ? 'Available' : undefined}
            />
            <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
            <MenuItem
              icon={Trophy}
              label="Leaderboard"
              iconBg="rgba(245,158,11,0.1)"
              iconColor="#d97706"
              onClick={() => navigate('/leaderboard')}
            />
            <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
            <MenuItem
              icon={FileText}
              label="Trade History"
              iconBg="rgba(59,130,246,0.1)"
              iconColor="#3b82f6"
              onClick={() => navigate('/trading')}
            />
            <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
          </>
        )}
        <MenuItem
          icon={Wallet}
          label={isConnected ? `Wallet: ${truncatedAddress}` : 'Connect Wallet'}
          iconBg="rgba(77,184,255,0.1)"
          iconColor="#4DB8FF"
          onClick={isConnected ? disconnect : connect}
          value={isConnected ? 'Connected' : undefined}
        />
      </div>

      {/* Preferences */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>
          Preferences
        </p>

        {/* Notification toggle */}
        <div className="flex items-center gap-3 py-3 px-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.1)' }}
          >
            <Bell size={16} style={{ color: '#a855f7' }} />
          </div>
          <span className="flex-1 text-sm font-500 text-primary-app" style={{ fontWeight: 500 }}>Push Notifications</span>
          <button
            onClick={() => setNotifEnabled((v) => !v)}
            className="relative w-12 h-6 rounded-full transition-all duration-200"
            style={{ background: notifEnabled ? 'var(--gradient-accent)' : 'var(--bg-surface)', boxShadow: notifEnabled ? 'var(--shadow-accent)' : 'none', border: notifEnabled ? 'none' : '1.5px solid var(--border-default)' }}
          >
            <div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
              style={{ transform: notifEnabled ? 'translateX(28px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--border-default)', margin: '2px 4px' }} />
        <MenuItem icon={HelpCircle} label="Help & Rules" iconBg="rgba(59,130,246,0.1)" iconColor="#60a5fa" onClick={() => navigate('/help')} />
      </div>

      {/* Danger zone — only when a wallet is actually connected */}
      {isConnected && (
        <div className="card-base !p-4">
          <MenuItem
            icon={LogOut}
            label="Disconnect Wallet"
            iconBg="rgba(239,68,68,0.08)"
            iconColor="#ef4444"
            onClick={disconnect}
            danger
          />
        </div>
      )}

      <LegalFooter />

      <PayoutModal isOpen={payoutOpen} onClose={() => setPayoutOpen(false)} />
    </div>
  );
}
