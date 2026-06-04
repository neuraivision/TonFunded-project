import { AlertTriangle, CheckCircle, XCircle, Shield, X } from 'lucide-react';
import type { RiskCheckResult } from '@/types';

interface Props {
  result: RiskCheckResult;
  tokenName: string;
  closePercent: number;
  estimatedPnl: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RiskCheckModal({
  result,
  tokenName,
  closePercent,
  estimatedPnl,
  onConfirm,
  onCancel,
}: Props) {
  const isProfit = estimatedPnl >= 0;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      {/* Overlay */}
      <div className="sheet-overlay absolute inset-0" onClick={onCancel} />

      {/* Sheet */}
      <div className="sheet-content relative bg-white rounded-t-[20px] p-6 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Shield
              size={20}
              className={result.passed ? 'text-green-600' : 'text-red-500'}
            />
            <h2 className="text-lg font-semibold text-primary-app">Pre-Trade Risk Check</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        {/* Trade summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Token</span>
            <span className="text-sm font-semibold text-primary-app">{tokenName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Close Amount</span>
            <span className="text-sm font-semibold text-primary-app">{closePercent}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Est. Realised P&L</span>
            <span
              className={`text-sm font-bold ${
                isProfit ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {isProfit ? '+' : ''}${Math.abs(estimatedPnl).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Drawdown status meters */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
            Drawdown Headroom
          </p>
          <DrawdownMeter
            label="Daily Remaining"
            value={result.dailyDrawdownRemaining}
            maxValue={500}
          />
          <DrawdownMeter
            label="Overall Remaining"
            value={result.overallDrawdownRemaining}
            maxValue={1000}
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-secondary">Position Size Risk</span>
            <span
              className={`text-xs font-semibold ${
                result.positionRiskPercent > 20
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`}
            >
              {result.positionRiskPercent.toFixed(1)}% of account
            </span>
          </div>
        </div>

        {/* Blockers */}
        {result.blockers.length > 0 && (
          <div className="space-y-2 mb-4">
            {result.blockers.map((blocker: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-2.5 bg-red-50 rounded-xl p-3"
              >
                <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{blocker}</p>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2 mb-4">
            {result.warnings.map((warning: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3"
              >
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* All clear */}
        {result.passed && result.warnings.length === 0 && (
          <div className="flex items-center gap-2.5 bg-green-50 rounded-xl p-3 mb-4">
            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              All risk checks passed — safe to execute
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={onCancel}
            className="btn-secondary !py-3.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!result.passed}
            className={`btn-primary !py-3.5 ${
              !result.passed ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            {result.passed ? 'Execute Trade' : 'Blocked'}
          </button>
        </div>

        {!result.passed && (
          <p className="text-xs text-center text-tertiary mt-3">
            Trade blocked due to risk rule violations above
          </p>
        )}
      </div>
    </div>
  );
}

// ── Drawdown meter sub-component ──────────────────────────────────────────

function DrawdownMeter({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const color =
    pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{label}</span>
        <span className="text-xs font-semibold text-primary-app">
          ${value.toFixed(0)} left
        </span>
      </div>
      <div className="progress-track !h-1.5">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
