import { useEffect, useState } from 'react';

interface Props {
  /** Live/seed CDN logo URL (e.g. asset.ston.fi). Falls back to initials if missing or it fails to load. */
  logoUrl?: string;
  symbol: string;
  /** Fallback avatar background when no image is available. */
  color?: string;
  /** Fallback initials. Defaults to first two chars of symbol. */
  initials?: string;
  /** Pixel diameter. */
  size?: number;
  className?: string;
}

/**
 * Token avatar that shows the real on-chain token icon when available and
 * gracefully degrades to a colored monogram while loading or on error.
 */
export default function TokenIcon({
  logoUrl,
  symbol,
  color = '#4DB8FF',
  initials,
  size = 36,
  className = '',
}: Props) {
  const [errored, setErrored] = useState(false);

  // Reset the error flag whenever the source changes so a refreshed URL retries.
  useEffect(() => setErrored(false), [logoUrl]);

  const showImg = logoUrl && !errored;
  const label = (initials ?? symbol.slice(0, 2)).toUpperCase();
  const fontSize = Math.round(size * 0.34);

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: showImg ? 'var(--bg-surface)' : color,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      {showImg ? (
        <img
          src={logoUrl}
          alt={symbol}
          loading="lazy"
          draggable={false}
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-bold leading-none" style={{ fontSize, fontWeight: 700 }}>
          {label}
        </span>
      )}
    </div>
  );
}
