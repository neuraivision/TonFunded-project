import {
  useTonConnectUI,
  useTonAddress,
  useTonWallet as useTonConnectWallet,
} from '@tonconnect/ui-react';
import { useCallback, useEffect, useState } from 'react';
import { fetchTonBalance } from '@/lib/tonapi';

export function useTonWallet() {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress(); // user-friendly (EQ…) form
  const wallet = useTonConnectWallet();
  const isConnected = !!walletAddress;

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Fetch on-chain TON balance whenever the connected address changes, then
  // refresh every 30s while connected.
  useEffect(() => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setBalanceLoading(true);
      const bal = await fetchTonBalance(walletAddress);
      if (!cancelled) {
        setBalance(bal);
        setBalanceLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [walletAddress]);

  const connect = useCallback(() => {
    tonConnectUI.openModal();
  }, [tonConnectUI]);

  const disconnect = useCallback(() => {
    tonConnectUI.disconnect();
  }, [tonConnectUI]);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  };

  return {
    walletAddress,
    truncatedAddress: truncateAddress(walletAddress),
    isConnected,
    /** Connecting wallet app name, e.g. "Tonkeeper". */
    walletName: wallet?.device?.appName ?? null,
    /** On-chain TON balance (in TON), or null if unknown. */
    balance,
    balanceLoading,
    /** Tonviewer explorer link for the connected account. */
    explorerUrl: walletAddress ? `https://tonviewer.com/${walletAddress}` : '',
    connect,
    disconnect,
  };
}
