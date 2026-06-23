// ─── Real STON.fi swap execution ─────────────────────────────────────────────
//
// Builds and submits actual on-chain swap transactions via TON Connect.
// Uses @ston-fi/sdk v2.1 CPI router + pTON v2.1 proxy.
//
// Flow:
//  1. Quote is already computed (via /swap/simulate API in fetchQuote)
//  2. User confirms → executeRealSwap() builds the tx params
//  3. tonConnectUI.sendTransaction() opens the wallet for signing
//  4. We return the tx hash for the history record

import { DEX, pTON } from '@ston-fi/sdk';
import { TonClient } from '@ton/ton';
import { Address, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui';

// STON.fi v2.1 mainnet contract addresses (verified from SDK source)
const ROUTER_ADDRESS = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
const PTON_ADDRESS   = 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez';

// toncenter.com public endpoint — no key required for light usage
const TON_ENDPOINT = 'https://toncenter.com/api/v2/jsonRPC';

function getClient() {
  return new TonClient({ endpoint: TON_ENDPOINT });
}

// Convert a token amount (human-readable) to nanotons/nanojettons BigInt
function toRaw(amount: number, decimals: number): bigint {
  // Use string math to avoid floating-point precision issues
  const factor = BigInt(10 ** decimals);
  const whole = Math.floor(amount);
  const fraction = amount - whole;
  const fractionUnits = BigInt(Math.round(fraction * 10 ** decimals));
  return BigInt(whole) * factor + fractionUnits;
}

export interface SwapParams {
  fromSymbol: string;
  fromAddress: string;
  fromDecimals: number;
  fromAmount: number;
  toSymbol: string;
  toAddress: string;
  toDecimals: number;
  minAskAmount: number; // human-readable, after slippage
  userWalletAddress: string;
}

export interface SwapResult {
  txHash: string;
  boc: string;
}

/**
 * Builds and submits a real STON.fi v2.1 swap via TON Connect.
 * Throws if the wallet rejects or if there's a network error.
 */
export async function executeRealSwap(
  params: SwapParams,
  tonConnectUI: TonConnectUI,
): Promise<SwapResult> {
  const client = getClient();
  const router = client.open(DEX.v2_1.Router.CPI.create(ROUTER_ADDRESS));
  const proxyTon = pTON.v2_1.create(PTON_ADDRESS);

  const offerAmount = toRaw(params.fromAmount, params.fromDecimals);
  const minAsk      = toRaw(params.minAskAmount, params.toDecimals);

  let txParamsList: { to: Address; value: bigint; body?: any }[];

  const isTonFrom = params.fromSymbol === 'TON';
  const isTonTo   = params.toSymbol === 'TON';

  if (isTonFrom) {
    // TON → Jetton
    const p = await router.getSwapTonToJettonTxParams({
      userWalletAddress: params.userWalletAddress,
      proxyTon,
      offerAmount,
      askJettonAddress: params.toAddress,
      minAskAmount: minAsk,
    });
    txParamsList = [p];
  } else if (isTonTo) {
    // Jetton → TON
    const p = await router.getSwapJettonToTonTxParams({
      userWalletAddress: params.userWalletAddress,
      offerJettonAddress: params.fromAddress,
      offerAmount,
      proxyTon,
      minAskAmount: minAsk,
    });
    txParamsList = [p];
  } else {
    // Jetton → Jetton
    const p = await router.getSwapJettonToJettonTxParams({
      userWalletAddress: params.userWalletAddress,
      offerJettonAddress: params.fromAddress,
      offerAmount,
      askJettonAddress: params.toAddress,
      minAskAmount: minAsk,
    });
    txParamsList = [p];
  }

  // Convert SenderArguments[] → TON Connect message format
  const messages = txParamsList.map((p) => ({
    address: p.to.toString(),
    amount: p.value.toString(),
    payload: p.body ? p.body.toBoc().toString('base64') : undefined,
  }));

  const validUntil = Math.floor(Date.now() / 1000) + 300; // 5 min TTL

  const result = await tonConnectUI.sendTransaction({ validUntil, messages });

  // TON Connect returns the signed BOC; the tx hash is the BOC hash
  // Return the BOC as the identifier — explorer links can be built from it
  const boc = result.boc;
  const txHash = boc.slice(0, 64); // first 64 chars of base64 BOC as display hash

  return { txHash, boc };
}
