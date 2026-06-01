import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Copy,
  CheckCircle,
  DollarSign,
  Users,
  Trophy,
  Settings,
  HelpCircle,
  FileText,
  Bell,
  LogOut,
  Wallet,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { useTonWallet } from '@/hooks/useTonWallet';
import { useReferralStore } from '@/stores/referralStore';
import { useTradingStore } from '@/stores/tradingStore';
import PayoutModal from '@/components/PayoutModal';

// ─── Menu item component ──────────────────────────────────────────────────────

function MenuItem({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 active:bg-gray-50 transition-colors rounded-xl px-1"
    >
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={17} className={iconColor} />
      </div>
      <span className={`flex-1 text-sm font-medium text-left ${danger ? 'text-red-500' : 'text-primary-app'}`}>
        {label}
      </span>
      {value && <span className="text-xs font-semibold text-secondary mr-1">{value}</span>}
      <ChevronRight size={15} className="text-tertiary" />
    </button>
  );
}

// ─── Referral friend row ──────────────────────────────────────────────────────

function ReferralFriendRow({
  displayName,
  status,
  earnings,
}: {
  displayName: string;
  status: string;
  earnings: number;
}) {
  const statusColors =
    status === 'earned'
      ? 'bg-green-50 text-green-700'
      : status === 'active'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-gray-100 text-gray-500';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-default last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
          <span className="text-xs font-bold text-accent-app">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-primary-app">{displayName}</p>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      <p className={`text-sm font-semibold ${earnings > 0 ? 'text-green-600' : 'text-tertiary'}`}>
        {earnings > 0 ? `+$${earnings.toFixed(2)}` : '—'}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { walletAddress, truncatedAddress, isConnected, connect, disconnect } = useTonWallet();
  const { info, linkCopied, copyReferralLink } = useReferralStore();
  const { stats, profitTarget, balance, startingBalance } = useTradingStore();

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const profitPct = ((balance - startingBalance) / startingBalance) * 100;

  return (
    <div className="px-4 pt-4 pb-6 page-enter">

      {/* ── Profile header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-5">
        {/* Avatar — real logo with rounded shape */}
        <div className="relative flex-shrink-0">
          <img
            src="/logo-192.png"
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover shadow-md"
          />
          {/* Online / connected indicator dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-primary-app truncate">Funded Trader</p>
          {isConnected && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-xs text-secondary font-medium truncate">{truncatedAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Performance summary ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp size={12} className={profitPct >= 0 ? 'text-green-600' : 'text-red-500'} />
            <p className={`text-sm font-bold ${profitPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
            </p>
          </div>
          <p className="text-[11px] text-tertiary">Total P&L</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-primary-app">{stats.winRate}%</p>
          <p className="text-[11px] text-tertiary">Win Rate</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Flame size={12} className="text-amber-500" />
            <p className="text-sm font-bold text-primary-app">{stats.maxConsecutiveWins}</p>
          </div>
          <p className="text-[11px] text-tertiary">Best Streak</p>
        </div>
      </div>

      {/* ── Profit target progress ─────────────────────────────────────────── */}
      <div className="card-base !p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-primary-app">Profit Target</p>
          <p className="text-xs text-secondary">
            ${profitTarget.current.toFixed(0)} / ${profitTarget.target.toFixed(0)}
          </p>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill bg-accent-app"
            style={{ width: `${Math.min(100, profitTarget.percentComplete)}%` }}
          />
        </div>
        <p className="text-xs text-tertiary mt-1.5">
          {profitTarget.percentComplete.toFixed(1)}% complete ·{' '}
          ${(profitTarget.target - profitTarget.current).toFixed(0)} remaining
        </p>
      </div>

      {/* ── Referral card ──────────────────────────────────────────────────── */}
      <div className="card-base !p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent-app" />
            <h3 className="text-sm font-semibold text-primary-app">Referral Programme</h3>
          </div>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {info.commissionPct}% commission
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-primary-app">{info.totalReferrals}</p>
            <p className="text-[11px] text-tertiary">Referred</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-green-600">${info.totalEarningsUsd.toFixed(2)}</p>
            <p className="text-[11px] text-tertiary">Earned</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-amber-600">${info.pendingEarningsUsd.toFixed(2)}</p>
            <p className="text-[11px] text-tertiary">Pending</p>
          </div>
        </div>

        {/* Copy referral link */}
        <button
          onClick={copyReferralLink}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            linkCopied
              ? 'border-green-300 bg-green-50'
              : 'border-default bg-gray-50 active:bg-gray-100'
          }`}
        >
          <div className="text-left">
            <p className="text-xs text-tertiary">Your referral code</p>
            <p className="text-sm font-bold text-primary-app font-mono">{info.referralCode}</p>
          </div>
          {linkCopied ? (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle size={15} />
              <span className="text-xs font-semibold">Copied!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-accent-app">
              <Copy size={15} />
              <span className="text-xs font-semibold">Copy Link</span>
            </div>
          )}
        </button>

        {/* Friends list */}
        {info.friends.length > 0 && (
          <div className="mt-3">
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

      {/* ── Account section ────────────────────────────────────────────────── */}
      <div className="card-base !p-4 mb-4">
        <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-1">Account</p>
        <MenuItem
          icon={DollarSign}
          label="Request Payout"
          iconBg="bg-green-50"
          iconColor="text-green-600"
          onClick={() => setPayoutOpen(true)}
        />
        <MenuItem
          icon={Trophy}
          label="Leaderboard"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => navigate('/leaderboard')}
        />
        <MenuItem
          icon={FileText}
          label="Trade History"
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          onClick={() => navigate('/trading')}
        />
        <MenuItem
          icon={Wallet}
          label={isConnected ? `Wallet: ${truncatedAddress}` : 'Connect Wallet'}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          onClick={isConnected ? disconnect : connect}
          value={isConnected ? 'Connected' : undefined}
        />
      </div>

      {/* ── Preferences section ─────────────────────────────────────────────── */}
      <div className="card-base !p-4 mb-4">
        <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-1">Preferences</p>

        {/* Notification toggle */}
        <div className="flex items-center gap-3 py-3.5 px-1">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Bell size={17} className="text-purple-500" />
          </div>
          <span className="flex-1 text-sm font-medium text-primary-app">Push Notifications</span>
          <button
            onClick={() => setNotifEnabled((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              notifEnabled ? 'bg-accent-app' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                notifEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <MenuItem
          icon={Settings}
          label="App Settings"
          iconBg="bg-gray-100"
          iconColor="text-gray-500"
          onClick={() => {}}
        />
        <MenuItem
          icon={HelpCircle}
          label="Help & Rules"
          iconBg="bg-blue-50"
          iconColor="text-blue-400"
          onClick={() => navigate('/help')}
        />
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────────── */}
      <div className="card-base !p-4 mb-4">
        <MenuItem
          icon={LogOut}
          label="Disconnect Wallet"
          iconBg="bg-red-50"
          iconColor="text-red-500"
          onClick={disconnect}
          danger
        />
      </div>

      <p className="text-xs text-center text-tertiary pb-2">
        TonFunded v2.0 · Built on TON Blockchain
      </p>

      {/* Payout modal */}
      <PayoutModal isOpen={payoutOpen} onClose={() => setPayoutOpen(false)} />
    </div>
  );
}
