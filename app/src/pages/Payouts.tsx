import { useState } from 'react';
import { usePayoutStore } from '@/stores/payoutStore';
import { useTradingStore } from '@/stores/tradingStore';
import {
  DollarSign, CheckCircle, Clock, XCircle, Loader2,
  ArrowUpRight, Wallet, Info, ChevronRight, Banknote,
} from 'lucide-react';

function statusIcon(status: string) {
  if (status === 'completed') return <CheckCircle size={14} className="text-green-500" />;
  if (status === 'processing') return <Loader2 size={14} className="text-blue-500 animate-spin" />;
  if (status === 'rejected') return <XCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-amber-500" />;
}

function statusLabel(status: string) {
  if (status === 'completed') return { text: 'Completed', cls: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  if (status === 'processing') return { text: 'Processing', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  if (status === 'rejected') return { text: 'Rejected', cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  return { text: 'Pending', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return 'Just now';
}

export default function Payouts() {
  const { records, traderSplitPct, isSubmitting, submitSuccess, submitError, requestPayout, calculateSplit } = usePayoutStore();
  const { pnl } = useTradingStore();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [showForm, setShowForm] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const split = calculateSplit(numAmount);
  const availableProfit = Math.max(pnl, 0);

  const totalPaid = records.filter(r => r.status === 'completed').reduce((s, r) => s + r.amountAfterSplit, 0);
  const pendingAmt = records.filter(r => r.status === 'pending' || r.status === 'processing').reduce((s, r) => s + r.amountAfterSplit, 0);

  return (
    <div className="px-4 pt-4 pb-8 space-y-5 page-enter">

      {/* Success toast */}
      {submitSuccess && (
        <div className="fixed top-20 left-4 right-4 z-[100] bg-card-app border border-green-200 dark:border-green-800/40 rounded-2xl shadow-lg p-4 flex items-center gap-3 toast-enter">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-app">Payout Requested! 🎉</p>
            <p className="text-xs text-secondary mt-0.5">Processed within 24–48 hours.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: DollarSign,  label: 'Available',  val: `$${availableProfit.toFixed(2)}`, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Banknote,    label: 'Total Paid',  val: `$${totalPaid.toFixed(2)}`,       color: 'text-accent-app', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Clock,       label: 'Pending',     val: `$${pendingAmt.toFixed(2)}`,      color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ icon: Icon, label, val, color, bg }) => (
          <div key={label} className="card !p-3">
            <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon size={12} className={color} />
            </div>
            <p className="text-[10px] text-secondary font-medium">{label}</p>
            <p className={`text-sm font-bold mt-0.5 ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Split info */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 border-accent-app/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-app/10 flex items-center justify-center">
              <ArrowUpRight size={14} className="text-accent-app" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-app">{traderSplitPct}% Profit Split</p>
              <p className="text-[11px] text-secondary">You keep {traderSplitPct}% of all profits</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-tertiary">Min payout</p>
            <p className="text-sm font-bold text-primary-app">$50</p>
          </div>
        </div>
      </div>

      {/* Request payout form */}
      <div className="card">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-app/10 flex items-center justify-center">
              <Wallet size={14} className="text-accent-app" />
            </div>
            <span className="text-sm font-bold text-primary-app">Request Payout</span>
          </div>
          <ChevronRight size={16} className={`text-tertiary transition-transform ${showForm ? 'rotate-90' : ''}`} />
        </button>

        {showForm && (
          <div className="mt-4 space-y-3">
            {/* Amount input */}
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-sm font-semibold">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-7"
                />
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 mt-2">
                {[50, 100, 250, 500].map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(Math.min(v, availableProfit)))}
                    className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-muted-app text-secondary active:bg-border-default"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet address */}
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block">TON Wallet Address</label>
              <input
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                placeholder="EQD..."
                className="input-field font-mono text-sm"
              />
            </div>

            {/* Split calculator */}
            {numAmount > 0 && (
              <div className="bg-muted-app rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info size={12} className="text-tertiary" />
                  <span className="text-xs font-semibold text-secondary">Payout Breakdown</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-tertiary">Gross amount</span>
                  <span className="font-semibold text-primary-app">${numAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-tertiary">Company (20%)</span>
                  <span className="font-semibold text-red-500">-${split.companyAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border-default" />
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-primary-app">You receive (80%)</span>
                  <span className="font-bold text-green-600">${split.traderAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl px-3 py-2.5 text-xs text-red-600 dark:text-red-400">
                {submitError}
              </div>
            )}

            <button
              onClick={() => requestPayout(numAmount, wallet)}
              disabled={isSubmitting || numAmount < 50}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" /> Processing...
                </span>
              ) : 'Request Payout'}
            </button>
          </div>
        )}
      </div>

      {/* Payout history */}
      {records.length > 0 && (
        <div>
          <p className="text-sm font-bold text-primary-app mb-3">Payout History</p>
          <div className="space-y-2.5">
            {records.map(r => {
              const sl = statusLabel(r.status);
              return (
                <div key={r.id} className="card !p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcon(r.status)}
                      <span className={`badge ${sl.cls}`}>{sl.text}</span>
                    </div>
                    <span className="text-xs text-tertiary">{timeAgo(r.requestedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-primary-app">${r.amountAfterSplit.toFixed(2)}</p>
                      <p className="text-[11px] text-tertiary">Requested: ${r.amountRequested.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-mono text-tertiary truncate max-w-[100px]">{r.walletAddress}</p>
                      {r.txHash && (
                        <p className="text-[10px] text-accent-app font-mono truncate max-w-[100px]">{r.txHash.slice(0,12)}…</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
