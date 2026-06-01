import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useCallback } from 'react';

export function useTonWallet() {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const isConnected = !!walletAddress;

  const connect = useCallback(() => {
    tonConnectUI.openModal();
  }, [tonConnectUI]);

  const disconnect = useCallback(() => {
    tonConnectUI.disconnect();
  }, [tonConnectUI]);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return {
    walletAddress,
    truncatedAddress: truncateAddress(walletAddress),
    isConnected,
    connect,
    disconnect,
  };
}
