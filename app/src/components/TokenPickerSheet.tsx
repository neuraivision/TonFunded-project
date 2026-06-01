import { useState, useMemo } from 'react';
import { X, Search, TrendingUp, TrendingDown } from 'lucide-react';
import type { SwapToken } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: SwapToken) => void;
  tokens: SwapToken[];
  /** The token on the opposite side of the swap — shown as disabled */
  excludeSymbol: string;
  title: string;
}

function TokenAvatar({ token }: { token: SwapToken }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
      style={{ backgroundColor: token.logoColor }}
    >
      {token.logoInitials}
    </div>
  );
}

function formatBalance(balance: number, decimals: number): string {
  if (decimals === 0) {
    if (balance >= 1_000_000) return `${(balance / 1_000_000).toFixed(2)}M`;
    if (balance >= 1_000) return `${(balance / 1_000).toFixed(1)}K`;
    return balance.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (balance >= 1_000_000) return `${(balance / 1_000_000).toFixed(3)}M`;
  if (balance >= 1_000) return `${(balance / 1_000).toFixed(2)}K`;
  return balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}

export default function TokenPickerSheet({
  isOpen,
  onClose,
  onSelect,
  tokens,
  excludeSymbol,
  title,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q),
    );
  }, [query, tokens]);

  if (!isOpen) return null;

  const handleSelect = (token: SwapToken) => {
    if (token.symbol === excludeSymbol) return;
    onSelect(token);
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="sheet-overlay absolute inset-0"
        onClick={() => {
          setQuery('');
          onClose();
        }}
      />

      {/* Sheet — tall: 90vh to show the full token list */}
      <div className="sheet-content relative bg-white rounded-t-[20px] flex flex-col max-h-[90vh]">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-4 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-primary-app">{title}</h2>
          <button
            onClick={() => {
              setQuery('');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 mb-3 flex-shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search token name or symbol…"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-default rounded-xl text-sm text-primary-app placeholder:text-tertiary focus:outline-none focus:border-accent-app focus:ring-1 focus:ring-accent-app transition-all"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Column labels */}
        <div className="flex items-center justify-between px-5 mb-1 flex-shrink-0">
          <span className="text-[11px] font-medium text-tertiary uppercase tracking-wide">
            Token
          </span>
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-medium text-tertiary uppercase tracking-wide">
              Balance
            </span>
            <span className="text-[11px] font-medium text-tertiary uppercase tracking-wide w-14 text-right">
              24h
            </span>
          </div>
        </div>

        {/* Token list */}
        <div className="overflow-y-auto flex-1 px-5 pb-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-secondary">No tokens found</p>
              <p className="text-xs text-tertiary mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((token) => {
                const isExcluded = token.symbol === excludeSymbol;
                const isPositive = token.priceChange24h >= 0;

                return (
                  <button
                    key={token.address}
                    onClick={() => handleSelect(token)}
                    disabled={isExcluded}
                    className={`w-full flex items-center justify-between py-3 px-3 rounded-xl transition-colors select-none ${
                      isExcluded
                        ? 'opacity-35 cursor-not-allowed'
                        : 'active:bg-gray-50 hover:bg-gray-50/60'
                    }`}
                  >
                    {/* Left: avatar + name */}
                    <div className="flex items-center gap-3">
                      <TokenAvatar token={token} />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-primary-app leading-tight">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-tertiary leading-tight">{token.name}</p>
                        <p className="text-[11px] text-tertiary mt-0.5">
                          Vol {formatVolume(token.volume24hUsd)}
                        </p>
                      </div>
                    </div>

                    {/* Right: balance + price change */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-app">
                        {formatBalance(token.balance, token.decimals)}
                      </p>
                      <p className="text-[11px] text-secondary">
                        ${token.usdPrice < 0.001
                          ? token.usdPrice.toFixed(6)
                          : token.usdPrice.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold mt-0.5 ${
                          isPositive ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp size={10} />
                        ) : (
                          <TrendingDown size={10} />
                        )}
                        {isPositive ? '+' : ''}
                        {token.priceChange24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
