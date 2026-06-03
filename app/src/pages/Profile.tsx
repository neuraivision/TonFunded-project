import { useState, useRef } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import { usePayoutStore } from '@/stores/payoutStore';
import { useReferralStore } from '@/stores/referralStore';
import {
  Camera, Copy, CheckCircle, ChevronRight, LogOut,
  Bell, Moon, Shield, Users, TrendingUp, Flame,
  Star, ExternalLink,
} from 'lucide-react';

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export default function Profile() {
  const { balance, startingBalance, stats, pnl, profitTarget } = useTradingStore();
  const { records, traderSplitPct } = usePayoutStore();
  const { info: referralInfo } = useReferralStore();
  const [avatarSrc, setAvatarSrc] = useState<string>('/logo-192.png');
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkEnabled, setDarkEnabled] = useState(document.documentElement.classList.contains('dark'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pnlPct = ((balance - startingBalance) / startingBalance) * 100;
  const totalPaid = records.filter(r => r.status === 'completed').reduce((s, r) => s + r.amountAfterSplit, 0);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) setAvatarSrc(ev.target.result as string); };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralInfo.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDarkEnabled(isDark);
  };

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 page-enter">

      {/* Avatar + name */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img src={avatarSrc} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-app flex items-center justify-center shadow-md active:opacity-80"
          >
            <Camera size={11} className="text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-primary-app">Funded Trader</p>
          <p className="text-xs text-secondary mt-0.5">TonFunded Member</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="badge bg-accent-light text-accent-app text-[10px]">Phase 1</span>
            <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px]">Active</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Total P&L',   val: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, color: pnlPct >= 0 ? 'text-green-600' : 'text-red-500', icon: TrendingUp },
          { label: 'Win Rate',    val: `${stats.winRate}%`,     color: 'text-primary-app', icon: Star },
          { label: 'Best Streak', val: `${stats.maxConsecutiveWins}`,  color: 'text-orange-500', icon: Flame },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="card !p-3 text-center">
            <Icon size={13} className={`${color} mx-auto mb-1.5`} />
            <p className={`text-base font-bold ${color}`}>{val}</p>
            <p className="text-[10px] text-secondary mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Profit target */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary-app">Profit Target</span>
          <span className="text-sm font-bold text-accent-app">${profitTarget.current.toFixed(0)} / ${profitTarget.target}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill bg-gradient-to-r from-[#4DB8FF] to-cyan-400" style={{ width: `${Math.min(profitTarget.percentComplete, 100)}%` }} />
        </div>
        <p className="text-[11px] text-secondary mt-1.5">{profitTarget.percentComplete.toFixed(1)}% complete · ${(profitTarget.target - profitTarget.current).toFixed(0)} remaining</p>
      </div>

      {/* Referral card */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-accent-app" />
            <span className="text-sm font-bold text-primary-app">Referral Programme</span>
          </div>
          <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600">{referralInfo.commissionPct}% commission</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Referred',  val: String(referralInfo.totalReferrals), color: 'text-primary-app', bg: 'bg-muted-app' },
            { label: 'Earned',    val: `$${referralInfo.totalEarningsUsd.toFixed(2)}`,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Pending',   val: `$${referralInfo.pendingEarningsUsd.toFixed(2)}`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl py-2.5 text-center border border-default`}>
              <p className={`text-sm font-bold ${color}`}>{val}</p>
              <p className="text-[10px] text-tertiary mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-muted-app rounded-xl px-3 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-tertiary">Your referral code</p>
            <p className="text-sm font-bold font-mono text-primary-app mt-0.5">{referralInfo.referralCode}</p>
          </div>
          <button onClick={handleCopy} className="flex items-center gap-1.5 bg-accent-app text-white text-xs font-bold px-3 py-1.5 rounded-lg active:opacity-80">
            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {referralInfo.friends.length > 0 && (
          <div className="space-y-2">
            {referralInfo.friends.map(f => (
              <div key={f.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-app">{f.displayName.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-app">{f.displayName}</p>
                    <span className={`badge text-[9px] ${
                      f.status === 'earned' ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : f.status === 'active' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'bg-gray-100 dark:bg-white/5 text-tertiary'
                    }`}>{f.status}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {f.earningsGenerated > 0 ? `+$${f.earningsGenerated.toFixed(2)}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-primary-app">Earnings</span>
          <span className="text-xs text-accent-app font-semibold">{traderSplitPct}% split</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            <p className="text-[10px] text-secondary mt-0.5">Total Received</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-accent-app">${Math.max(pnl, 0).toFixed(2)}</p>
            <p className="text-[10px] text-secondary mt-0.5">Available</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card space-y-1">
        <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-3">Settings</p>
        {[
          {
            icon: Bell, label: 'Push Notifications', sub: 'Trade alerts & updates',
            right: (
              <button onClick={() => setNotifEnabled(!notifEnabled)} className={`w-11 h-6 rounded-full transition-colors ${notifEnabled ? 'bg-accent-app' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${notifEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            ),
          },
          {
            icon: Moon, label: 'Dark Mode', sub: 'Toggle app appearance',
            right: (
              <button onClick={toggleDark} className={`w-11 h-6 rounded-full transition-colors ${darkEnabled ? 'bg-accent-app' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${darkEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            ),
          },
          { icon: Shield, label: 'Privacy Policy', sub: 'View our privacy terms', right: <ExternalLink size={14} className="text-tertiary" /> },
          { icon: LogOut, label: 'Sign Out', sub: 'Log out of your account', right: <ChevronRight size={14} className="text-tertiary" /> },
        ].map(({ icon: Icon, label, sub, right }) => (
          <div key={label} className="flex items-center gap-3 py-3 border-b border-default last:border-0">
            <div className="w-8 h-8 rounded-xl bg-muted-app flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-app">{label}</p>
              <p className="text-[11px] text-tertiary mt-0.5">{sub}</p>
            </div>
            {right}
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-tertiary pt-1">TonFunded v2.0 · Built on TON</p>
    </div>
  );
}
