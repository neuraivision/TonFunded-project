import { useState } from 'react';
import { Wallet, Copy, Check, ExternalLink, Power, Loader2 } from 'lucide-react';
import { useTonWallet } from '@/hooks/useTonWallet';
import { useSwapStore } from '@/stores/swapStore';
import TokenIcon from '@/components/TokenIcon';

export default function WalletCard() {
  const {
    isConnected,
    truncatedAddress,
    walletAddress,
    walletName,
    balance,
    balanceLoading,
    explorerUrl,
    disconnect,
  } = useTonWallet();

  const tonToken = useSwapStore((s) => s.availableTokens.find((t) => t.symbol === 'TON'));
  const tonPrice = tonToken?.usdPrice ?? 0;

  const [copied, setCopied] = useState(false);
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Connect is handled by the single global wallet chip in the header — when
  // disconnected, this card renders nothing to avoid a duplicate Connect button.
  if (!isConnected) return null;

  // ── Connected ─────────────────────────────────────────────────────────────
  const usdValue = balance != null ? balance * tonPrice : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header: wallet identity + disconnect */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(77,184,255,0.1)', border: '1px solid rgba(77,184,255,0.18)' }}
          >
            <Wallet size={16} style={{ color: '#4DB8FF' }} strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.6)' }}
              />
              <p className="text-sm font-600 text-primary-app truncate" style={{ fontWeight: 600 }}>
                {walletName || 'TON Wallet'}
              </p>
            </div>
            <p className="text-[11px] text-tertiary mt-0.5">Connected</p>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center justify-center w-8 h-8 rounded-lg active:scale-95 transition-transform"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          aria-label="Disconnect wallet"
        >
          <Power size={14} className="text-tertiary" />
        </button>
      </div>

      {/* Balance */}
      <div className="px-4 pb-3.5">
        <p className="text-[10px] font-600 text-tertiary uppercase tracking-[0.1em] mb-1.5" style={{ fontWeight: 600 }}>
          Wallet Balance
        </p>
        <div className="flex items-center gap-2.5">
          <TokenIcon logoUrl={tonToken?.logoUrl} symbol="TON" color="#0098EA" size={28} />
          {balanceLoading && balance == null ? (
            <div className="flex items-center gap-2 text-tertiary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-number text-2xl font-700 text-primary-app leading-none" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                {balance != null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
              </span>
              <span className="text-sm font-600 text-secondary" style={{ fontWeight: 600 }}>TON</span>
              {usdValue != null && (
                <span className="text-xs text-tertiary font-number">≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address actions */}
      <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border-default)' }}>
        <button
          onClick={copyAddress}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 active:bg-surface-app transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} className="text-success-app" />
              <span className="text-xs font-600 text-success-app" style={{ fontWeight: 600 }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-secondary" />
              <span className="font-mono text-xs text-secondary">{truncatedAddress}</span>
            </>
          )}
        </button>
        <div className="w-px" style={{ background: 'var(--border-default)' }} />
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 active:bg-surface-app transition-colors"
        >
          <ExternalLink size={13} style={{ color: '#4DB8FF' }} />
          <span className="text-xs font-600" style={{ color: '#4DB8FF', fontWeight: 600 }}>Explorer</span>
        </a>
      </div>
    </div>
  );
}
