// ─── TON account data (tonapi.io) ─────────────────────────────────────────────
//
// Reads the connected wallet's on-chain TON balance. CORS is permitted for
// browser origins, so no API key is required for these light read calls.

const TONAPI = 'https://tonapi.io/v2';

/**
 * Returns the wallet's TON balance as a decimal number of TON (not nanotons),
 * or null if the lookup fails / the account is not found.
 */
export async function fetchTonBalance(address: string): Promise<number | null> {
  if (!address) return null;
  try {
    const res = await fetch(`${TONAPI}/accounts/${address}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { balance?: number };
    if (typeof json.balance !== 'number') return null;
    return json.balance / 1e9;
  } catch {
    return null;
  }
}
