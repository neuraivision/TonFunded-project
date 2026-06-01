import { useState } from 'react';
import { X, DollarSign, CheckCircle, Clock, XCircle, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import { usePayoutStore } from '@/stores/payoutStore';
import type { PayoutRecord, PayoutStatus } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
}

function StatusBadge({ status }: { status: PayoutStatus }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          <CheckCircle size={10} />
          Completed
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          <Loader2 size={10} className="animate-spin" />
          Processing
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
          <Clock size={10} />
          Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
          <XCircle size={10} />
          Rejected
        </span>
      );
  }
}

function PayoutHistoryRow({ record }: { record: PayoutRecord }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-default rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white active:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-semibold text-primary-app">
            ${record.amountAfterSplit.toFixed(2)}
            <span className="text-xs font-normal text-tertiary ml-1">
              ({record.traderSplitPct}% split)
            </span>
          </p>
          <p className="text-xs text-tertiary mt-0.5">{formatDate(record.requestedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={record.status} />
          {expanded ? (
            <ChevronUp size={14} className="text-tertiary" />
          ) : (
            <ChevronDown size={14} className="text-tertiary" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 bg-gray-50 border-t border-default space-y-2 page-enter">
          <div className="flex justify-between text-xs">
            <span className="text-tertiary">Gross Profit</span>
            <span className="font-medium text-primary-app">${record.amountRequested.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-tertiary">Your Share ({record.traderSplitPct}%)</span>
            <span className="font-semibold text-green-600">${record.amountAfterSplit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-tertiary">Company Share ({100 - record.traderSplitPct}%)</span>
            <span className="font-medium text-secondary">
              ${(record.amountRequested - record.amountAfterSplit).toFixed(2)}
            </span>
          </div>
          {record.processedAt && (
            <div className="flex justify-between text-xs">
              <span className="text-tertiary">Processed</span>
              <span className="font-medium text-primary-app">{formatDate(record.processedAt)}</span>
            </div>
          )}
          {record.txHash && (
            <div className="flex justify-between text-xs items-center">
              <span className="text-tertiary">Tx Hash</span>
              <button className="flex items-center gap-1 font-medium text-accent-app active:opacity-70">
                <span>{truncateHash(record.txHash)}</span>
                <ExternalLink size={10} />
              </button>
            </div>
          )}
          {record.walletAddress && (
            <div className="flex justify-between text-xs">
              <span className="text-tertiary">Wallet</span>
              <span className="font-medium text-primary-app">{record.walletAddress}</span>
            </div>
          )}
          {record.rejectionReason && (
            <div className="mt-1 bg-red-50 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700">{record.rejectionReason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PayoutModal({ isOpen, onClose }: Props) {
  const { profitTarget } = useTradingStore();
  const {
    records,
    traderSplitPct,
    isSubmitting,
    submitSuccess,
    submitError,
    requestPayout,
    calculateSplit,
    clearSubmitState,
  } = usePayoutStore();

  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  if (!isOpen) return null;

  const availableBalance = profitTarget.current;
  const amountNum = parseFloat(amount) || 0;
  const splitPreview = amountNum > 0 ? calculateSplit(amountNum) : null;

  const handleSubmit = async () => {
    await requestPayout(amountNum, walletAddress);
    if (!submitError) {
      setAmount('');
      setWalletAddress('');
    }
  };

  const handleClose = () => {
    clearSubmitState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Overlay */}
      <div className="sheet-overlay absolute inset-0" onClick={handleClose} />

      {/* Sheet */}
      <div className="sheet-content relative bg-white rounded-t-[20px] max-h-[92vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-0 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 flex-shrink-0">
          <h2 className="text-xl font-semibold text-primary-app">Payout</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-4 bg-gray-100 rounded-xl p-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'request'
                ? 'bg-white text-primary-app shadow-sm'
                : 'text-secondary'
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-primary-app shadow-sm'
                : 'text-secondary'
            }`}
          >
            History ({records.length})
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-8">

          {/* ── Request tab ───────────────────────────────────────────────── */}
          {activeTab === 'request' && (
            <div className="space-y-5 page-enter">
              {/* Success state */}
              {submitSuccess && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Payout Requested!</p>
                    <p className="text-xs text-green-600">Processing within 24–48 hours.</p>
                  </div>
                </div>
              )}

              {/* Available balance card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl px-5 py-4 text-center border border-blue-100">
                <p className="text-xs font-medium text-secondary mb-1">Available for Payout</p>
                <p className="text-3xl font-bold text-primary-app">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-tertiary mt-1">
                  {traderSplitPct}/{100 - traderSplitPct} profit split · You keep {traderSplitPct}%
                </p>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-sm font-medium text-secondary mb-1.5 block">
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
                    className="w-full pl-10 pr-4 py-3 border border-default rounded-xl text-sm text-primary-app placeholder:text-tertiary focus:outline-none focus:border-accent-app focus:ring-1 focus:ring-accent-app transition-all"
                  />
                </div>
                {/* Quick-fill buttons */}
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() =>
                        setAmount(
                          parseFloat((availableBalance * (pct / 100)).toFixed(2)).toString(),
                        )
                      }
                      className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 rounded-lg text-secondary active:bg-gray-200 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet address */}
              <div>
                <label className="text-sm font-medium text-secondary mb-1.5 block">
                  TON Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="EQ…"
                  className="w-full px-4 py-3 border border-default rounded-xl text-sm text-primary-app placeholder:text-tertiary focus:outline-none focus:border-accent-app focus:ring-1 focus:ring-accent-app transition-all font-mono"
                />
              </div>

              {/* Split calculator preview */}
              {splitPreview && amountNum > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 page-enter">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                    Split Calculator
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Gross Profit</span>
                    <span className="font-semibold text-primary-app">${amountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Your Share ({traderSplitPct}%)</span>
                    <span className="font-bold text-green-600">${splitPreview.traderAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">TonFunded ({100 - traderSplitPct}%)</span>
                    <span className="font-medium text-tertiary">${splitPreview.companyAmount.toFixed(2)}</span>
                  </div>
                  {/* Visual split bar */}
                  <div className="mt-2 flex rounded-full overflow-hidden h-2">
                    <div
                      className="bg-accent-app"
                      style={{ width: `${traderSplitPct}%` }}
                    />
                    <div
                      className="bg-gray-200"
                      style={{ width: `${100 - traderSplitPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {submitError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <XCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{submitError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || amountNum <= 0 || !walletAddress.trim()}
                className={`btn-primary !py-3.5 ${
                  isSubmitting || amountNum <= 0 || !walletAddress.trim()
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }`}
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

              <p className="text-xs text-center text-tertiary">
                Payouts processed within 24–48 hours. Minimum $50.
              </p>
            </div>
          )}

          {/* ── History tab ───────────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <div className="space-y-3 page-enter">
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign size={28} className="text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-secondary">No payout history</p>
                  <p className="text-xs text-tertiary mt-1">Your payout requests will appear here</p>
                </div>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-green-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-secondary">Total Paid Out</p>
                      <p className="text-base font-bold text-green-700 mt-0.5">
                        ${records
                          .filter((r) => r.status === 'completed')
                          .reduce((s, r) => s + r.amountAfterSplit, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-secondary">Pending</p>
                      <p className="text-base font-bold text-amber-700 mt-0.5">
                        ${records
                          .filter((r) => r.status === 'pending' || r.status === 'processing')
                          .reduce((s, r) => s + r.amountAfterSplit, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {records.map((record) => (
                    <PayoutHistoryRow key={record.id} record={record} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
