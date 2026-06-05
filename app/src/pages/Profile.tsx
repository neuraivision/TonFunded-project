import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Copy, CheckCircle, DollarSign, Users, Trophy,
  Settings, HelpCircle, FileText, Bell, LogOut, Wallet,
  TrendingUp, Camera, Share2, Gift, Star, Flame, ArrowUpRight,
} from 'lucide-react';
import { useTonWallet } from '@/hooks/useTonWallet';
import { useReferralStore } from '@/stores/referralStore';
import { useTradingStore } from '@/stores/tradingStore';
import PayoutModal from '@/components/PayoutModal';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.1em] px-1 mb-1" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>
      {children}
    </p>
  );
}

function MenuItem({
  icon: Icon, label, value, iconColor, iconBg, onClick, danger, badge,
}: {
  icon: React.ElementType; label: string; value?: string;
  iconColor: string; iconBg: string; onClick?: () => void;
  danger?: boolean; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-1 py-3 rounded-xl active:opacity-70 transition-opacity"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={16} style={{ color: iconColor }} strokeWidth={1.8} />
      </div>
      <span className="flex-1 text-sm text-left" style={{ fontWeight: 500, color: danger ? 'var(--ink-down)' : 'var(--ink-1)' }}>
        {label}
      </span>
      {badge && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full mr-1"
          style={{ background: 'rgba(77,184,255,0.1)', color: 'var(--ton)', fontWeight: 700 }}
        >
          {badge}
        </span>
      )}
      {value && <span className="text-xs mr-1" style={{ color: 'var(--ink-3)' }}>{value}</span>}
      <ChevronRight size={14} style={{ color: 'var(--ink-3)' }} />
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { truncatedAddress, isConnected, connect, disconnect } = useTonWallet();
  const { info, linkCopied, copyReferralLink } = useReferralStore();
  const { stats, profitTarget, balance, startingBalance } = useTradingStore();

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState('/logo-192.png');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) setAvatarSrc(ev.target.result as string); };
    reader.readAsDataURL(file);
  };

  const profitPct = ((balance - startingBalance) / startingBalance) * 100;

  return (
    <div className="pb-10 page-enter">

      {/* ── Hero ─────────────────────────────────────── */}
      <div
        className="px-5 pt-6 pb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(158deg,#08182E 0%,#0D2440 55%,#091C34 100%)',
          borderBottom: '1px solid rgba(77,184,255,0.1)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 15% 80%, rgba(77,184,255,0.07) 0%, transparent 70%)',
        }} />

        <div className="flex items-center gap-4 relative mb-5">
          {/* Avatar */}
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-2xl overflow-hidden active:opacity-80 flex-shrink-0"
            style={{ boxShadow: '0 0 0 2px rgba(77,184,255,0.35), 0 4px 16px rgba(0,0,0,0.35)' }}
          >
            <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-center pb-1.5"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}>
              <Camera size={12} className="text-white opacity-80" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />

          <div>
            <p className="text-lg text-white leading-tight" style={{ fontWeight: 700 }}>Funded Trader</p>
            {isConnected && (
              <p className="font-mono text-[11px] mt-0.5" style={{ color: 'rgba(77,184,255,0.7)' }}>{truncatedAddress}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(77,184,255,0.15)', color: '#7ECFFF', fontWeight: 700 }}
              >
                <Star size={9} className="fill-current" /> Pro Trader
              </span>
              {isConnected && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontWeight: 600 }}
                >
                  Connected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-3 gap-2 relative">
          {[
            { label: 'P&L',        value: `${profitPct >= 0 ? '+' : ''}${profitPct.toFixed(1)}%`, color: profitPct >= 0 ? '#4ade80' : '#f87171', icon: TrendingUp },
            { label: 'Win Rate',   value: `${stats.winRate}%`,                                      color: '#7ECFFF',  icon: Trophy },
            { label: 'Hot Streak', value: `${stats.maxConsecutiveWins}W`,                           color: '#fbbf24',  icon: Flame },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-xl py-2.5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <s.icon size={12} style={{ color: s.color }} strokeWidth={1.8} />
              <p className="font-number text-[15px] leading-none" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Profit Target ─────────────────────────────── */}
        <div className="card-base !p-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>Profit Target</p>
            <span className="font-number text-xs" style={{ fontWeight: 700, color: 'var(--ton)' }}>
              {profitTarget.percentComplete.toFixed(1)}%
            </span>
          </div>
          <div className="progress-track mb-2">
            <div
              className="progress-fill progress-fill-accent"
              style={{ width: `${Math.min(100, profitTarget.percentComplete)}%` }}
            />
          </div>
          <div className="flex justify-between">
            <p className="font-number text-[11px]" style={{ color: 'var(--ink-3)' }}>
              ${profitTarget.current.toFixed(0)} earned
            </p>
            <p className="font-number text-[11px]" style={{ color: 'var(--ink-3)' }}>
              ${(profitTarget.target - profitTarget.current).toFixed(0)} remaining
            </p>
          </div>
        </div>

        {/* ── Referral System ──────────────────────────── */}
        <div className="card-base !p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(77,184,255,0.09)' }}
              >
                <Gift size={16} style={{ color: 'var(--ton)' }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>Referral Programme</p>
                <p className="text-[11px]" style={{ color: 'var(--ink-3)' }}>{info.commissionPct}% commission per referral</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Referred', value: info.totalReferrals,              color: 'var(--ink-1)', bg: 'var(--bg-sunken)' },
              { label: 'Earned',   value: `$${info.totalEarningsUsd.toFixed(0)}`, color: 'var(--ink-up)', bg: 'rgba(34,197,94,0.06)' },
              { label: 'Pending',  value: `$${info.pendingEarningsUsd.toFixed(0)}`, color: 'var(--ink-warn)', bg: 'rgba(245,158,11,0.06)' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: s.bg }}
              >
                <p className="font-number text-[16px] leading-none" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--ink-3)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Copy link */}
          <button
            onClick={copyReferralLink}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl active:opacity-70 transition-all"
            style={{
              background: linkCopied ? 'rgba(34,197,94,0.06)' : 'var(--bg-sunken)',
              border: `1.5px solid ${linkCopied ? 'rgba(34,197,94,0.2)' : 'var(--line)'}`,
            }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink-3)' }}>Referral Code</p>
              <p className="font-mono text-sm" style={{ fontWeight: 700, color: 'var(--ink-1)' }}>{info.referralCode}</p>
            </div>
            {linkCopied ? (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-up)', fontWeight: 600 }}>
                <CheckCircle size={14} /> Copied!
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ton)', fontWeight: 600 }}>
                  <Copy size={13} /> Copy
                </span>
                <div className="w-px h-4" style={{ background: 'var(--line)' }} />
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
                  <Share2 size={13} /> Share
                </span>
              </div>
            )}
          </button>

          {/* Friends list */}
          {info.friends.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>Your Referrals</p>
              <div className="space-y-0">
                {info.friends.map((f) => {
                  const statusColor = f.status === 'earned' ? 'var(--ink-up)' : f.status === 'active' ? 'var(--ton)' : 'var(--ink-3)';
                  const statusBg   = f.status === 'earned' ? 'rgba(34,197,94,0.08)' : f.status === 'active' ? 'rgba(77,184,255,0.08)' : 'var(--bg-sunken)';
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(77,184,255,0.1)' }}
                        >
                          <span className="text-[11px]" style={{ fontWeight: 700, color: 'var(--ton)' }}>
                            {f.displayName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm" style={{ fontWeight: 500, color: 'var(--ink-1)' }}>{f.displayName}</p>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: statusBg, color: statusColor, fontWeight: 700 }}
                          >
                            {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p
                        className="font-number text-sm"
                        style={{ fontWeight: 600, color: f.earningsGenerated > 0 ? 'var(--ink-up)' : 'var(--ink-3)' }}
                      >
                        {f.earningsGenerated > 0 ? `+$${f.earningsGenerated.toFixed(2)}` : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Account ───────────────────────────────────── */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <div className="card-base !p-2">
            <MenuItem icon={ArrowUpRight}   label="Request Payout"   iconBg="rgba(34,197,94,0.09)"   iconColor="var(--ink-up)"   onClick={() => setPayoutOpen(true)} badge="Available" />
            <div className="divider mx-3" />
            <MenuItem icon={Trophy}          label="Leaderboard"      iconBg="rgba(245,158,11,0.09)"  iconColor="var(--ink-warn)" onClick={() => navigate('/leaderboard')} />
            <div className="divider mx-3" />
            <MenuItem icon={FileText}        label="Trade History"    iconBg="rgba(77,184,255,0.09)"  iconColor="var(--ton)"      onClick={() => navigate('/trading')} />
            <div className="divider mx-3" />
            <MenuItem icon={Wallet}          label={isConnected ? 'Wallet Connected' : 'Connect Wallet'} iconBg="rgba(77,184,255,0.09)" iconColor="var(--ton)" onClick={isConnected ? disconnect : connect} value={isConnected ? truncatedAddress ?? undefined : undefined} />
          </div>
        </div>

        {/* ── Preferences ──────────────────────────────── */}
        <div>
          <SectionLabel>Preferences</SectionLabel>
          <div className="card-base !p-2">
            {/* Notification toggle */}
            <div className="flex items-center gap-3 px-1 py-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.09)' }}>
                <Bell size={16} style={{ color: '#a855f7' }} strokeWidth={1.8} />
              </div>
              <span className="flex-1 text-sm" style={{ fontWeight: 500, color: 'var(--ink-1)' }}>Push Notifications</span>
              <button
                onClick={() => setNotifEnabled((v) => !v)}
                className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                style={{
                  background: notifEnabled ? 'linear-gradient(135deg,#4DB8FF,#2aa8f2)' : 'var(--bg-sunken)',
                  border: notifEnabled ? 'none' : '1.5px solid var(--line)',
                  boxShadow: notifEnabled ? '0 2px 8px rgba(77,184,255,0.3)' : 'none',
                }}
              >
                <div
                  className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: notifEnabled ? 'translateX(24px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
            <div className="divider mx-3" />
            <MenuItem icon={Settings}  label="App Settings" iconBg="rgba(107,114,128,0.09)" iconColor="#6b7280" onClick={() => {}} />
            <div className="divider mx-3" />
            <MenuItem icon={HelpCircle} label="Help & Rules" iconBg="rgba(59,130,246,0.09)"  iconColor="#60a5fa" onClick={() => navigate('/help')} />
          </div>
        </div>

        {/* ── Danger zone ───────────────────────────────── */}
        <div className="card-base !p-2">
          <MenuItem icon={LogOut} label="Disconnect Wallet" iconBg="rgba(239,68,68,0.08)" iconColor="var(--ink-down)" onClick={disconnect} danger />
        </div>

        <p className="text-xs text-center pb-2" style={{ color: 'var(--ink-3)' }}>
          TonFunded v2.0 · Built on TON Blockchain
        </p>
      </div>

      <PayoutModal isOpen={payoutOpen} onClose={() => setPayoutOpen(false)} />
    </div>
  );
}
