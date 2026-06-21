// ─── STON.fi market data ──────────────────────────────────────────────────────
//
// Pulls live USD prices and official token icons from the public STON.fi API.
// CORS is open (`access-control-allow-origin: *`), so this runs directly in the
// browser with no proxy. We query assets individually by contract address — the
// full asset list is ~35k entries and far too heavy for a mobile mini app.

import { useTradingStore } from '@/stores/tradingStore';

const STONFI_API = 'https://api.ston.fi/v1/assets';

export interface TokenMarketData {
  usdPrice: number;
  logoUrl?: string;
  decimals: number;
}

interface StonfiAsset {
  contract_address: string;
  decimals: number;
  image_url?: string;
  dex_price_usd?: string;
  dex_usd_price?: string;
}

async function fetchAsset(address: string): Promise<TokenMarketData | null> {
  try {
    const res = await fetch(`${STONFI_API}/${address}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { asset?: StonfiAsset };
    const a = json.asset;
    const priceStr = a?.dex_price_usd ?? a?.dex_usd_price;
    if (!a || !priceStr) return null;
    const usdPrice = parseFloat(priceStr);
    if (!isFinite(usdPrice) || usdPrice <= 0) return null;
    return { usdPrice, logoUrl: a.image_url, decimals: a.decimals };
  } catch {
    return null;
  }
}

/**
 * Fetches live market data for a set of token contract addresses in parallel.
 * Returns a map keyed by address; addresses that fail are simply omitted so
 * callers can fall back to their seed values.
 */
export async function fetchStonfiMarket(
  addresses: string[],
): Promise<Record<string, TokenMarketData>> {
  const results = await Promise.allSettled(addresses.map((a) => fetchAsset(a)));
  const map: Record<string, TokenMarketData> = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) map[addresses[i]] = r.value;
  });
  return map;
}

// ─── Price feed ───────────────────────────────────────────────────────────────
//
// Maps token symbol → contract address for every token the app can trade.
// Extend here if new tokens are added.
const SYMBOL_TO_ADDRESS: Record<string, string> = {
  TON:    'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
  GRAM:   'EQBrDGesI9uyzGzVi3kjiRJt1k4Vf7iXVX7AQVQyEPvBYboQ',
  USDT:   'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
  NOT:    'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT',
  DOGS:   'EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS',
  CATI:   'EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7',
  REDO:   'EQBZ_cafPyDr5KUTs0aNxh0ZTDhkpEZONmLJA2SNGlLm4Cko',
  MAJOR:  'EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR',
  STON:   'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
};

let feedTimer: ReturnType<typeof setInterval> | null = null;

async function pollPrices(symbols: string[]) {
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const addresses = uniqueSymbols.map((s) => SYMBOL_TO_ADDRESS[s]).filter(Boolean);
  if (addresses.length === 0) return;

  const market = await fetchStonfiMarket(addresses);

  // Invert: address → symbol, then build symbol → price
  const pricesBySymbol: Record<string, number> = {};
  uniqueSymbols.forEach((sym) => {
    const addr = SYMBOL_TO_ADDRESS[sym];
    if (addr && market[addr]) pricesBySymbol[sym] = market[addr].usdPrice;
  });

  if (Object.keys(pricesBySymbol).length > 0) {
    useTradingStore.getState().applyLivePrices(pricesBySymbol);
  }
}

/**
 * Start the live price feed. Polls STON.fi every `intervalMs` (default 4s)
 * and updates open positions via `applyLivePrices`. Deduplicated — calling
 * while already running just re-triggers an immediate fetch.
 */
export function startPriceFeed(symbols: string[], intervalMs = 4000) {
  stopPriceFeed();
  // Fetch immediately, then on interval
  pollPrices(symbols);
  feedTimer = setInterval(() => pollPrices(symbols), intervalMs);
}

/** Stop the live price feed. */
export function stopPriceFeed() {
  if (feedTimer !== null) {
    clearInterval(feedTimer);
    feedTimer = null;
  }
}
