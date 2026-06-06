import { useState } from 'react';
import { X, Info, Zap } from 'lucide-react';
import { useTradingStore } from '@/stores/tradingStore';
import type { Position, SlippagePreset } from '@/types';

interface Props {
  position: Position;
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS: { value: SlippagePreset; label: string; description: string }[] =
  [
    { value: 0.5, label: '0.5%', description: 'Low — may fail on volatile tokens' },
    { value: 1, label: '1%', description: 'Standard — recommended for most Jettons' },
    { value: 2, label: '2%', description: 'Medium — suitable for low-liquidity tokens' },
    { value: 5, label: '5%', description: 'High — use for memecoins with wide spreads' },
  ];

export default function SlippageSettingsSheet({ position, isOpen, onClose }: Props) {
  const { updateSlippage } = useTradingStore();
  const [selected, setSelected] = useState<number>(position.slippage);
  const [customInput, setCustomInput] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (value: SlippagePreset) => {
    setSelected(value);
    setUseCustom(false);
    setCustomInput('');
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setSelected(num);
      setUseCustom(true);
    }
  };

  const handleConfirm = () => {
    updateSlippage(position.id, selected);
    onClose();
  };

  const getSlippageRisk = (val: number) => {
    if (val <= 1) return { label: 'Conservative', color: '#4ade80', bgStyle: { background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' } };
    if (val <= 2) return { label: 'Moderate', color: '#fbbf24', bgStyle: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' } };
    return { label: 'Aggressive', color: '#f87171', bgStyle: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' } };
  };

  const risk = getSlippageRisk(selected);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Overlay */}
      <div className="sheet-overlay absolute inset-0" onClick={onClose} />

      {/* Sheet */}
      <div className="sheet-content relative rounded-t-[20px] p-6 max-h-[80vh] overflow-y-auto" style={{ background: "var(--bg-card)" }}>
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "var(--border-default)" }}" />

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-primary-app">Slippage Tolerance</h2>
            <p className="text-xs text-secondary mt-0.5">
              {position.tokenName}/{position.tokenPair.split('/')[1]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(77,184,255,0.08)', border: '1px solid rgba(77,184,255,0.15)' }} mt-4 mb-5">
          <Info size={14} className="text-accent-app flex-shrink-0 mt-0.5" />
          <p className="text-xs text-secondary leading-relaxed">
            Slippage tolerance is the maximum price difference you'll accept between
            the quoted and executed price. Higher values reduce failed transactions
            but may result in worse execution.
          </p>
        </div>

        {/* Current selection display */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl border border-default">
          <div>
            <p className="text-xs text-secondary">Current Slippage</p>
            <p className="text-2xl font-bold text-primary-app mt-0.5">{selected}%</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: risk.color, ...risk.bgStyle }}>
            {risk.label}
          </span>
        </div>

        {/* Preset grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PRESETS.map((preset) => {
            const isActive = !useCustom && selected === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-accent-app bg-accent-light'
                    : 'border-default" style={{ background: 'var(--bg-surface)' }}'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-base font-bold ${
                      isActive ? 'text-accent-app' : 'text-primary-app'
                    }`}
                  >
                    {preset.label}
                  </span>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-accent-app flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-tertiary leading-tight">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom input */}
        <div className="mb-6">
          <label className="text-xs font-medium text-secondary block mb-1.5">
            Custom Value
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              onFocus={() => setUseCustom(true)}
              placeholder="Enter % (e.g. 3.5)"
              className={`w-full px-4 py-3 pr-10 border rounded-xl text-sm text-primary-app placeholder:text-tertiary focus:outline-none transition-all ${
                useCustom
                  ? 'border-accent-app ring-1 ring-accent-app'
                  : 'border-default'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-tertiary">
              %
            </span>
          </div>
        </div>

        {/* Memecoin tip */}
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }} mb-5">
          <Zap size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Memecoin tip:</strong> Use 5%+ for newly launched Jettons with
            low liquidity. Transactions may fail at lower tolerances during high
            volatility periods.
          </p>
        </div>

        {/* Confirm button */}
        <button onClick={handleConfirm} className="btn-primary !py-3.5">
          Confirm Slippage — {selected}%
        </button>
      </div>
    </div>
  );
}
