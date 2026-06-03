import { useState, useRef } from 'react';
import { useTradingStore } from '@/stores/tradingStore';
import { usePayoutStore } from '@/stores/payoutStore';
import { useReferralStore } from '@/stores/referralStore';
import {
  Camera, Copy, CheckCircle, ChevronRight,
  Bell, Moon, Shield, Users, TrendingUp, Flame,
  Star, ExternalLink, LogOut, BarChart2, Target,
} from 'lucide-react';

export default function Profile() {
  const { balance, startingBalance, stats, pnl, profitTarget, dailyDrawdown, overallDrawdown, tradeRecords } = useTradingStore();
  const { records, traderSplitPct } = usePayoutStore();
  const { info: referralInfo } = useReferralStore();
  const [avatarSrc, setAvatarSrc] = useState('/logo-192.png');
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkEnabled, setDarkEnabled] = useState(document.documentElement.classList.contains('dark'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pnlPct = ((balance - startingBalance) / startingBalance) * 100;
  const totalPaid = records.filter(r => r.status === 'completed').reduce((s, r) => s + r.amountAfterSplit, 0);
  const balanceDelta = balance - startingBalance;

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

      {/* ── Profile header ───────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img src={avatarSrc} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-app flex items-center justify-center shadow-md active:opacity-80"
            >
              <Camera size={11} className="text-white" />
            </button>
            <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#1a1a1a]" />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-primary-app">Funded Trader</p>
            <p className="text-xs text-secondary mt-0.5">TonFunded Member</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="badge bg-accent-light text-accent-app text-[10px]">Phase 1</span>
              <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px]">● Active</span>
              <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px]">Starter</span>
            </div>
          </div>
        </div>

        {/* Balance summary */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-default text-center">
          <div>
            <p className="text-[10px] text-tertiary mb-0.5">Balance</p>
            <p className="text-sm font-bold text-primary-app">${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="border-x border-default">
            <p className="text-[10px] text-tertiary mb-0.5">All-Time P&L</p>
            <p className={`text-sm font-bold ${balanceDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-tertiary mb-0.5">Change</p>
            <p className={`text-sm font-bold ${pnlPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Performance stats ────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={13} className="text-accent-app" />
          <span className="text-sm font-bold text-primary-app">Trading Performance</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: TrendingUp, label: 'Total P&L',   val: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, color: pnlPct >= 0 ? 'text-green-600' : 'text-red-500' },
            { icon: Star,       label: 'Win Rate',    val: `${stats.winRate}%`,            color: 'text-primary-app' },
            { icon: Flame,      label: 'Best Streak', val: `${stats.maxConsecutiveWins}`,  color: 'text-orange-500' },
          ].map(({ icon: Icon, label, val, color }) => (
            <div key={label} className="bg-muted-app rounded-xl p-2.5 text-center">
              <Icon size={12} className={`${color} mx-auto mb-1`} />
              <p className={`text-sm font-bold ${color}`}>{val}</p>
              <p className="text-[10px] text-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {[
            { label: 'Total Trades',   val: String(stats.totalTrades) },
            { label: 'Winning Trades', val: `${stats.winningTrades}` },
            { label: 'Losing Trades',  val: `${stats.losingTrades}` },
            { label: 'Avg Win',        val: `$${stats.avgWin.toFixed(2)}` },
            { label: 'Avg Loss',       val: `$${stats.avgLoss.toFixed(2)}` },
            { label: 'Profit Factor',  val: `${stats.profitFactor}x` },
            { label: 'Best Trade',     val: `$${stats.bestTrade.toFixed(2)}` },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-default last:border-0">
              <span className="text-xs text-secondary">{label}</span>
              <span className="text-xs font-bold text-primary-app">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Profit target ─────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Target size={13} className="text-accent-app" />
            <span className="text-sm font-bold text-primary-app">Challenge Progress</span>
          </div>
          <span className="text-xs font-bold text-accent-app">${profitTarget.current.toFixed(0)} / ${profitTarget.target}</span>
        </div>
        <div className="h-2 bg-muted-app rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-[#4DB8FF] to-cyan-400 transition-all" style={{ width: `${Math.min(profitTarget.percentComplete, 100)}%` }} />
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-[11px] text-accent-app font-semibold">{profitTarget.percentComplete.toFixed(1)}% to funded</span>
          <span className="text-[11px] text-tertiary">${(profitTarget.target - profitTarget.current).toFixed(0)} remaining</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted-app rounded-xl p-2.5">
            <p className="text-[10px] text-tertiary">Daily Drawdown</p>
            <p className={`text-xs font-bold mt-0.5 ${dailyDrawdown.percentOfLimit > 70 ? 'text-red-500' : 'text-primary-app'}`}>
              ${Math.abs(dailyDrawdown.current).toFixed(0)} / ${dailyDrawdown.limit}
            </p>
            <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${dailyDrawdown.percentOfLimit > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${dailyDrawdown.percentOfLimit}%` }} />
            </div>
          </div>
          <div className="bg-muted-app rounded-xl p-2.5">
            <p className="text-[10px] text-tertiary">Overall Drawdown</p>
            <p className={`text-xs font-bold mt-0.5 ${overallDrawdown.percentOfLimit > 70 ? 'text-red-500' : 'text-primary-app'}`}>
              ${Math.abs(overallDrawdown.current).toFixed(0)} / ${overallDrawdown.limit}
            </p>
            <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${overallDrawdown.percentOfLimit > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${overallDrawdown.percentOfLimit}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Earnings ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-primary-app">Earnings</span>
          <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600">{traderSplitPct}% split</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Received', val: `$${totalPaid.toFixed(2)}`,          color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Available',      val: `$${Math.max(pnl, 0).toFixed(2)}`,   color: 'text-accent-app', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Payouts',        val: String(records.length),              color: 'text-primary-app', bg: 'bg-muted-app' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-2.5 text-center border border-default`}>
              <p className={`text-sm font-bold ${color}`}>{val}</p>
              <p className="text-[10px] text-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Referral ──────────────────────────────────────────────── */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={13} className="text-accent-app" />
            <span className="text-sm font-bold text-primary-app">Referral Programme</span>
          </div>
          <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600">{referralInfo.commissionPct}% commission</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Referred',  val: String(referralInfo.totalReferrals),               color: 'text-primary-app', bg: 'bg-muted-app' },
            { label: 'Earned',    val: `$${referralInfo.totalEarningsUsd.toFixed(2)}`,    color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Pending',   val: `$${referralInfo.pendingEarningsUsd.toFixed(2)}`,  color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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
          <button onClick={handleCopy} className="flex items-center gap-1.5 bg-accent-app text-white text-xs font-bold px-3 py-1.5 rounded-lg active:opacity-80 transition-opacity">
            {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {referralInfo.friends.length > 0 && (
          <div className="space-y-2 pt-1">
            {referralInfo.friends.map(f => (
              <div key={f.id} className="flex items-center justify-between py-1.5 border-b border-default last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-app">{f.displayName.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary-app">{f.displayName}</p>
                    <span className={`badge text-[9px] ${
                      f.status === 'earned' ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : f.status === 'active' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'bg-gray-100 dark:bg-white/5 text-tertiary'
                    }`}>{f.status}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600">
                  {f.earningsGenerated > 0 ? `+$${f.earningsGenerated.toFixed(2)}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Settings ──────────────────────────────────────────────── */}
      <div className="card space-y-1">
        <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-3">Settings</p>
        {[
          {
            icon: Bell, label: 'Push Notifications', sub: 'Trade alerts & updates',
            right: (
              <button onClick={() => setNotifEnabled(!notifEnabled)} className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifEnabled ? 'bg-accent-app' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${notifEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            ),
          },
          {
            icon: Moon, label: 'Dark Mode', sub: 'Toggle app appearance',
            right: (
              <button onClick={toggleDark} className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${darkEnabled ? 'bg-accent-app' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${darkEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            ),
          },
          { icon: Shield, label: 'Privacy Policy', sub: 'View our privacy terms', right: <ExternalLink size={14} className="text-tertiary flex-shrink-0" /> },
          { icon: LogOut, label: 'Sign Out', sub: 'Log out of your account', right: <ChevronRight size={14} className="text-tertiary flex-shrink-0" /> },
        ].map(({ icon: Icon, label, sub, right }) => (
          <div key={label} className="flex items-center gap-3 py-3 border-b border-default last:border-0">
            <div className="w-8 h-8 rounded-xl bg-muted-app flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-app">{label}</p>
              <p className="text-[11px] text-tertiary mt-0.5">{sub}</p>
            </div>
            {right}
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-tertiary pt-1">TonFunded v2.0 · Built on TON Blockchain</p>
    </div>
  );
}
