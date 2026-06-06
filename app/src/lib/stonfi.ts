// ─── STON.fi market data ──────────────────────────────────────────────────────
//
// Pulls live USD prices and official token icons from the public STON.fi API.
// CORS is open (`access-control-allow-origin: *`), so this runs directly in the
// browser with no proxy. We query assets individually by contract address — the
// full asset list is ~35k entries and far too heavy for a mobile mini app.

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
