import { useTonWallet } from '@/hooks/useTonWallet';
import { Wallet, ChevronRight, Unlink } from 'lucide-react';

export default function WalletCard() {
  const { isConnected, truncatedAddress, connect, disconnect } = useTonWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl active:opacity-80 transition-opacity"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <Wallet size={17} className="text-tertiary" strokeWidth={1.6} />
          </div>
          <div className="text-left">
            <p className="text-sm font-600 text-primary-app" style={{ fontWeight: 600 }}>
              Connect Wallet
            </p>
            <p className="text-xs text-tertiary mt-0.5">Link your TON wallet</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 text-xs font-600 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(77,184,255,0.1)', color: '#4DB8FF', fontWeight: 600 }}
        >
          Connect <ChevronRight size={12} />
        </div>
      </button>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(77,184,255,0.08)', border: '1px solid rgba(77,184,255,0.15)' }}
        >
          <Wallet size={17} style={{ color: '#4DB8FF' }} strokeWidth={1.8} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.5)' }}
            />
            <p className="text-sm font-600 text-primary-app font-mono" style={{ fontWeight: 600 }}>
              {truncatedAddress}
            </p>
          </div>
          <p className="text-xs text-tertiary mt-0.5">TON Wallet · Connected</p>
        </div>
      </div>
      <button
        onClick={disconnect}
        className="flex items-center gap-1 text-xs text-tertiary active:text-danger-app transition-colors px-2 py-1.5 rounded-lg"
        style={{ border: '1px solid var(--border-default)' }}
      >
        <Unlink size={12} />
        <span>Disconnect</span>
      </button>
    </div>
  );
}
