import { useState } from 'react';
import { X, DollarSign, CheckCircle, Clock, XCircle, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import { usePayoutStore } from '@/stores/payoutStore';
import type { PayoutRecord, PayoutStatus } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function truncateHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
}

function StatusBadge({ status }: { status: PayoutStatus }) {
  const cfg = {
    completed: { icon: CheckCircle, text: 'Completed', bg: 'rgba(22,163,74,0.1)', color: '#4ade80' },
    processing: { icon: Loader2,     text: 'Processing', bg: 'rgba(77,184,255,0.1)', color: '#4DB8FF' },
    pending:    { icon: Clock,        text: 'Pending',    bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
    rejected:   { icon: XCircle,     text: 'Rejected',   bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  }[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-700 px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, fontWeight: 700 }}
    >
      <Icon size={10} className={status === 'processing' ? 'animate-spin' : ''} />
      {cfg.text}
    </span>
  );
}

function PayoutHistoryRow({ record }: { record: PayoutRecord }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors active:opacity-80"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="text-left">
          <p className="text-sm font-700 text-primary-app" style={{ fontWeight: 700 }}>
            ${record.amountAfterSplit.toFixed(2)}
            <span className="text-xs font-400 text-tertiary ml-1">({record.traderSplitPct}% split)</span>
          </p>
          <p className="text-xs text-tertiary mt-0.5">{formatDate(record.requestedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={record.status} />
          {expanded ? <ChevronUp size={14} className="text-tertiary" /> : <ChevronDown size={14} className="text-tertiary" />}
        </div>
      </button>

      {expanded && (
        <div
          className="px-4 pb-3 pt-3 space-y-2 page-enter"
          style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)' }}
        >
          {[
            { label: 'Gross Profit', value: `$${record.amountRequested.toFixed(2)}`, color: 'text-primary-app' },
            { label: `Your Share (${record.traderSplitPct}%)`, value: `$${record.amountAfterSplit.toFixed(2)}`, color: 'text-success-app' },
            { label: `Company (${100 - record.traderSplitPct}%)`, value: `$${(record.amountRequested - record.amountAfterSplit).toFixed(2)}`, color: 'text-secondary' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-tertiary">{row.label}</span>
              <span className={`font-600 ${row.color}`} style={{ fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
          {record.processedAt && (
            <div className="flex justify-between text-xs">
              <span className="text-tertiary">Processed</span>
              <span className="font-500 text-primary-app">{formatDate(record.processedAt)}</span>
            </div>
          )}
          {record.txHash && (
            <div className="flex justify-between text-xs items-center">
              <span className="text-tertiary">Tx Hash</span>
              <button className="flex items-center gap-1 font-600 text-accent-app active:opacity-70" style={{ fontWeight: 600 }}>
                <span>{truncateHash(record.txHash)}</span>
                <ExternalLink size={10} />
              </button>
            </div>
          )}
          {record.walletAddress && (
            <div className="flex justify-between text-xs">
              <span className="text-tertiary">Wallet</span>
              <span className="font-mono font-500 text-primary-app text-[10px]">{record.walletAddress}</span>
            </div>
          )}
          {record.rejectionReason && (
            <div className="mt-1 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-xs text-danger-app">{record.rejectionReason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PayoutModal({ isOpen, onClose }: Props) {
  const { profitTarget } = useTradingStore();
  const { records, traderSplitPct, isSubmitting, submitSuccess, submitError, requestPayout, calculateSplit, clearSubmitState } = usePayoutStore();

  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  if (!isOpen) return null;

  const availableBalance = profitTarget.current;
  const amountNum = parseFloat(amount) || 0;
  const splitPreview = amountNum > 0 ? calculateSplit(amountNum) : null;

  const handleSubmit = async () => {
    await requestPayout(amountNum, walletAddress);
    if (!submitError) { setAmount(''); setWalletAddress(''); }
  };

  const handleClose = () => { clearSubmitState(); onClose(); };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="sheet-overlay absolute inset-0" onClick={handleClose} />

      <div
        className="sheet-content relative max-h-[92vh] flex flex-col max-w-lg mx-auto w-full"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-0 flex-shrink-0" style={{ background: 'var(--border-default)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 flex-shrink-0">
          <h2 className="text-xl font-700 text-primary-app" style={{ fontWeight: 700 }}>Payout</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-70"
            style={{ background: 'var(--bg-surface)' }}
          >
            <X size={15} className="text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-bar mx-6 mb-4 flex-shrink-0">
          {(['request', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-item ${activeTab === tab ? 'tab-item-active' : ''}`}
            >
              {tab === 'request' ? 'Request' : `History (${records.length})`}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-8 scrollbar-hide">

          {/* ── Request tab ── */}
          {activeTab === 'request' && (
            <div className="space-y-5 page-enter">
              {submitSuccess && (
                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
                  <CheckCircle size={17} className="text-success-app flex-shrink-0" />
                  <div>
                    <p className="text-sm font-700 text-success-app" style={{ fontWeight: 700 }}>Payout Requested!</p>
                    <p className="text-xs text-secondary">Processing within 24–48 hours.</p>
                  </div>
                </div>
              )}

              {/* Available balance hero */}
              <div
                className="rounded-2xl px-5 py-5 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(77,184,255,0.1), rgba(42,168,242,0.06))',
                  border: '1px solid rgba(77,184,255,0.2)',
                }}
              >
                <p className="text-xs font-600 text-secondary mb-2 uppercase tracking-widest" style={{ fontWeight: 600 }}>Available for Payout</p>
                <p className="font-number text-4xl font-700 text-primary-app" style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-tertiary mt-1.5">
                  {traderSplitPct}/{100 - traderSplitPct} profit split · You keep {traderSplitPct}%
                </p>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-sm font-600 text-secondary mb-2 block" style={{ fontWeight: 600 }}>
                  Amount to Request
                </label>
                <div className="relative">
                  <DollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="50"
                    max={availableBalance}
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-primary-app placeholder:text-tertiary focus:outline-none transition-all"
                    style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)' }}
                    onFocus={(e) => { e.target.style.borderColor = '#4DB8FF'; e.target.style.boxShadow = '0 0 0 3px rgba(77,184,255,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* Quick-fill buttons */}
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setAmount(parseFloat((availableBalance * (pct / 100)).toFixed(2)).toString())}
                      className="flex-1 py-2 text-xs font-700 rounded-xl transition-colors active:opacity-70"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', fontWeight: 700 }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet address */}
              <div>
                <label className="text-sm font-600 text-secondary mb-2 block" style={{ fontWeight: 600 }}>
                  TON Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="EQ…"
                  className="w-full px-4 py-3.5 rounded-xl text-sm text-primary-app placeholder:text-tertiary focus:outline-none transition-all font-mono"
                  style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4DB8FF'; e.target.style.boxShadow = '0 0 0 3px rgba(77,184,255,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Split calculator preview */}
              {splitPreview && amountNum > 0 && (
                <div className="rounded-xl p-4 space-y-2.5 page-enter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>
                    Split Preview
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Gross Profit</span>
                    <span className="font-600 text-primary-app" style={{ fontWeight: 600 }}>${amountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Your Share ({traderSplitPct}%)</span>
                    <span className="font-700 text-success-app" style={{ fontWeight: 700 }}>${splitPreview.traderAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">TonFunded ({100 - traderSplitPct}%)</span>
                    <span className="font-500 text-tertiary">${splitPreview.companyAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex rounded-full overflow-hidden h-2 mt-1" style={{ background: 'var(--bg-muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${traderSplitPct}%`, background: 'var(--gradient-accent)' }} />
                  </div>
                </div>
              )}

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <XCircle size={15} className="text-danger-app flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger-app">{submitError}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || amountNum <= 0 || !walletAddress.trim()}
                className={`btn-primary !py-4 text-base ${isSubmitting || amountNum <= 0 || !walletAddress.trim() ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  `Request ${splitPreview ? `$${splitPreview.traderAmount.toFixed(2)}` : 'Payout'}`
                )}
              </button>
              <p className="text-xs text-center text-tertiary">Payouts processed within 24–48 hours. Minimum $50.</p>
            </div>
          )}

          {/* ── History tab ── */}
          {activeTab === 'history' && (
            <div className="space-y-3 page-enter">
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--bg-surface)' }}>
                    <DollarSign size={22} className="text-tertiary" />
                  </div>
                  <p className="text-sm font-500 text-secondary">No payout history</p>
                  <p className="text-xs text-tertiary mt-1">Your payout requests will appear here</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)' }}>
                      <p className="text-xs text-secondary">Total Paid Out</p>
                      <p className="font-number text-base font-700 text-success-app mt-0.5" style={{ fontWeight: 700 }}>
                        ${records.filter(r => r.status === 'completed').reduce((s, r) => s + r.amountAfterSplit, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <p className="text-xs text-secondary">Pending</p>
                      <p className="font-number text-base font-700 text-warning-app mt-0.5" style={{ fontWeight: 700 }}>
                        ${records.filter(r => r.status === 'pending' || r.status === 'processing').reduce((s, r) => s + r.amountAfterSplit, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {records.map((record) => <PayoutHistoryRow key={record.id} record={record} />)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
