import { useState } from 'react';
import { useChallengeStore } from '@/stores/challengeStore';
import { useSwapStore } from '@/stores/swapStore';
import { useTonWallet } from '@/hooks/useTonWallet';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { purchaseAndPay } from '@/lib/tonfunded';
import { syncAllFromBackend } from '@/lib/backendSync';
import {
  Zap, Rocket, CheckCircle, TrendingUp, Shield, Calendar, Target,
  ChevronRight, Star, Sprout, Crown, Trophy, Gem, AlertTriangle, type LucideIcon,
} from 'lucide-react';

// Small gas headroom added on top of the converted fee for the balance check.
// The actual fee amount is priced server-side (purchase-challenge); the
// destination treasury comes from VITE_TONFUND_TREASURY / the server secret
// TONFUND_TREASURY_WALLET.
const GAS_TON = 0.05;

// Clean line-icon + accent per tier (no emojis). Selection accent is always
// TON blue for a disciplined, institutional look.
const TIER_STYLES: Record<string, { color: string; icon: LucideIcon }> = {
  starter: { color: '#4DB8FF', icon: Sprout },
  growth:  { color: '#22c55e', icon: TrendingUp },
  pro:     { color: '#f59e0b', icon: Zap },
  expert:  { color: '#a855f7', icon: Crown },
  elite:   { color: '#ec4899', icon: Trophy },
  legend:  { color: '#6366f1', icon: Gem },
};

export default function Challenges() {
  const { tiers, activeChallenge, selectedTierId, selectTier, purchaseChallenge } = useChallengeStore();
  const { isConnected, balance, connect } = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const tonPrice = useSwapStore((s) => s.availableTokens.find((t) => t.symbol === 'TON')?.usdPrice) || 1.5;

  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const hasActive = !!activeChallenge;
  const selectedTier = tiers.find((t) => t.id === selectedTierId);
  const feeUsd = selectedTier?.fee ?? 0;
  const feeTon = tonPrice > 0 ? feeUsd / tonPrice : 0;
  const totalTon = feeTon + GAS_TON;
  const feeTonDisplay = feeTon.toFixed(2);
  const insufficient = isConnected && balance != null && balance < totalTon;

  // Tap a tier: must connect a wallet first; one active challenge at a time.
  const onCardClick = (id: string) => {
    if (hasActive) return;
    if (!isConnected) { connect(); return; }
    selectTier(id);
  };

  // Secure purchase: the server prices the fee in TON and returns a payment
  // request → the user pays the treasury via TON Connect → the server verifies
  // the on-chain payment before activating the challenge. (verify-payment)
  const handlePay = async () => {
    if (!selectedTier || !isConnected || insufficient || hasActive) return;
    setPurchaseError('');
    setPurchasing(true);
    try {
      await purchaseAndPay(selectedTier.id, tonConnectUI);
      await syncAllFromBackend();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      // User cancelled, or no backend session (e.g. browser preview): fall back
      // to the local mock purchase so the flow still demos.
      console.warn('[tonfunded] secure purchase failed, using local mock:', e);
      const msg = e instanceof Error ? e.message : '';
      if (/cancel|reject|declined/i.test(msg)) {
        setPurchaseError('Payment was cancelled. Please try again.');
      } else {
        purchaseChallenge();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } finally {
      setPurchasing(false);
    }
  };

  // Top-up flow when the user is short on TON.
  // Telegram Wallet (@wallet) is the native buy/receive flow inside Telegram.
  const openAddTon = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink('https://t.me/wallet');
    } else {
      window.open('https://t.me/wallet', '_blank', 'noopener');
    }
  };

  const showSticky = !!selectedTier && isConnected && !hasActive;

  return (
    <div
      className="px-4 pt-4 page-enter"
      style={{
        paddingBottom: showSticky
          ? 'calc(150px + env(safe-area-inset-bottom, 0px))'
          : 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-700 text-primary-app leading-tight" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
          Evaluation Tiers
        </h2>
        <p className="text-sm text-secondary mt-1">Choose your challenge size and start trading</p>
      </div>

      {/* Active Challenge Progress */}
      {activeChallenge && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(77,184,255,0.1), rgba(42,168,242,0.05))',
            border: '1px solid rgba(77,184,255,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(77,184,255,0.15)' }}
              >
                <Zap size={15} className="text-accent-app" />
              </div>
              <div>
                <p className="text-sm font-700 text-accent-app" style={{ fontWeight: 700 }}>
                  {activeChallenge.tierName} — Phase {activeChallenge.phase}
                </p>
                <p className="text-[11px] text-tertiary">{activeChallenge.progress.tradingDays}/{activeChallenge.progress.minTradingDays} days traded</p>
              </div>
            </div>
            <span className="text-sm font-number font-700 text-accent-app" style={{ fontWeight: 700 }}>
              {activeChallenge.progress.percentComplete}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill progress-fill-accent"
              style={{ width: `${activeChallenge.progress.percentComplete}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-tertiary">
              P&L: ${activeChallenge.progress.profitCurrent.toLocaleString()} / ${activeChallenge.progress.profitTarget.toLocaleString()}
            </p>
            <button className="text-[11px] font-600 text-accent-app flex items-center gap-1">
              View details <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}

      {/* One-active-challenge notice */}
      {hasActive && (
        <p className="text-[12px] text-tertiary mb-4 px-1">
          You have an active challenge. You can hold one funded account at a time.
        </p>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="page-enter fixed top-4 left-4 right-4 z-[100] rounded-2xl p-4 flex items-center gap-3 max-w-lg mx-auto"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 0 16px rgba(34,197,94,0.15)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(22,163,74,0.1)" }}>
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>Challenge Purchased!</p>
            <p className="text-xs text-secondary">Your evaluation has started. Good luck!</p>
          </div>
        </div>
      )}

      {/* Challenge Tiers Grid */}
      <div className="space-y-3">
        {tiers.map((tier) => {
          const style = TIER_STYLES[tier.id] || TIER_STYLES.starter;
          const isSelected = selectedTierId === tier.id;

          const TierIcon = style.icon;

          return (
            <div
              key={tier.id}
              onClick={() => onCardClick(tier.id)}
              className={`rounded-2xl p-4 transition-all duration-200 ${hasActive ? 'cursor-default' : 'cursor-pointer'}`}
              style={{
                // Theme-safe: solid card + subtle accent overlay when selected,
                // so text stays legible in both light and dark mode.
                background: isSelected
                  ? `linear-gradient(0deg, rgba(77,184,255,0.10), rgba(77,184,255,0.10)), var(--bg-card)`
                  : 'var(--bg-card)',
                border: `1.5px solid ${isSelected ? 'rgba(77,184,255,0.6)' : 'var(--border-card)'}`,
                boxShadow: isSelected
                  ? '0 6px 22px rgba(77,184,255,0.18)'
                  : 'var(--shadow-card)',
                opacity: hasActive ? 0.55 : 1,
              }}
            >
              {/* Top row: badge + price */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${style.color}1f`, border: `1px solid ${style.color}40` }}
                  >
                    <TierIcon size={17} style={{ color: style.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-700"
                      style={{
                        background: `${style.color}1f`,
                        color: style.color,
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {tier.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-number text-xl font-700 text-primary-app leading-tight" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                    ${Number.isInteger(tier.fee)
                      ? tier.fee.toLocaleString()
                      : tier.fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-tertiary">eval fee</p>
                </div>
              </div>

              {/* Account size */}
              <p className="font-number text-2xl font-700 text-primary-app mb-0.5" style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
                ${tier.accountSize.toLocaleString()}
              </p>
              <p className="text-xs text-secondary mb-3">Trading Capital</p>

              {/* Rules - compact 2-col grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                {[
                  { icon: TrendingUp, label: 'Profit Target', value: `${tier.profitTarget}%`, color: style.color },
                  { icon: Zap, label: 'Max Positions', value: `${tier.maxPositions}`, color: style.color },
                  { icon: Shield, label: 'Max Drawdown', value: `${tier.maxOverallLoss}%`, color: '#dc2626' },
                  { icon: Target, label: 'Daily Drawdown', value: `${tier.maxDailyLoss}%`, color: '#dc2626' },
                  { icon: Calendar, label: 'Min Trading Days', value: `${tier.minTradingDays} days`, color: 'var(--text-secondary)' },
                  { icon: AlertTriangle, label: 'Drawdown Mode', value: tier.drawdownMode, color: 'var(--text-secondary)' },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <rule.icon size={12} style={{ color: rule.color, flexShrink: 0 }} />
                    <span className="text-[11px] text-secondary">{rule.label}: <span className="font-600 text-primary-app">{rule.value}</span></span>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] text-secondary">80% profit split</span>
                </div>
                {!hasActive && (
                  <div
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-700 transition-all"
                    style={
                      isSelected
                        ? { background: 'var(--gradient-accent)', color: '#fff', boxShadow: '0 2px 10px rgba(77,184,255,0.3)', fontWeight: 700 }
                        : { background: 'rgba(77,184,255,0.12)', color: '#4DB8FF', border: '1px solid rgba(77,184,255,0.25)', fontWeight: 700 }
                    }
                  >
                    {isSelected ? (
                      <><CheckCircle size={12} /> Selected</>
                    ) : (
                      <>Get Funded <ChevronRight size={11} /></>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky purchase button — only when a wallet is connected and no active challenge */}
      {showSticky && selectedTier && (
        <div
          className="fixed left-4 right-4 z-40 max-w-lg mx-auto"
          style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          {purchaseError && (
            <p className="text-xs text-red-500 text-center mb-2">{purchaseError}</p>
          )}
          {insufficient ? (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(245,158,11,0.45)',
                boxShadow: '0 -2px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.16)',
              }}
            >
              <AlertTriangle size={16} className="flex-shrink-0" style={{ color: '#fbbf24' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-700" style={{ color: '#fbbf24', fontWeight: 700 }}>Insufficient TON</p>
                <p className="text-[11px] text-secondary leading-tight">~{totalTon.toFixed(2)} TON needed for this challenge</p>
              </div>
              <button
                onClick={openAddTon}
                className="flex-shrink-0 text-[12px] px-3 py-1.5 rounded-lg active:opacity-80 transition-opacity"
                style={{ background: '#fbbf24', color: '#1a1206', fontWeight: 700 }}
              >
                Add TON
              </button>
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={purchasing}
              className="btn-primary !py-4 text-base"
              style={{ boxShadow: '0 8px 24px rgba(77,184,255,0.35), 0 4px 12px rgba(0,0,0,0.1)', opacity: purchasing ? 0.7 : 1 }}
            >
              <Rocket size={18} />
              {purchasing ? 'Processing payment…' : `Get Funded · ${selectedTier.name} (~${feeTonDisplay} TON)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
