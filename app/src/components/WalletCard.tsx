import { useTonWallet } from '@/hooks/useTonWallet';
import { Wallet, LogOut } from 'lucide-react';

export default function WalletCard() {
  const { isConnected, truncatedAddress, connect, disconnect } = useTonWallet();

  return (
    <div className="card-base flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isConnected ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <Wallet
            size={16}
            className={isConnected ? 'text-green-600' : 'text-gray-400'}
          />
        </div>
        <div className="flex flex-col">
          {isConnected ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-app" />
                <span className="text-sm font-medium text-primary-app">
                  {truncatedAddress}
                </span>
              </div>
              <span className="text-xs text-secondary">Connected</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-sm font-medium text-primary-app">
                  Connect Wallet
                </span>
              </div>
              <span className="text-xs text-secondary">Tap to connect TON</span>
            </>
          )}
        </div>
      </div>

      {isConnected ? (
        <button
          onClick={disconnect}
          className="flex items-center gap-1.5 text-xs text-secondary hover:text-danger transition-colors px-3 py-1.5 rounded-full hover:bg-red-50"
        >
          <LogOut size={13} />
          <span>Disconnect</span>
        </button>
      ) : (
        <button onClick={connect} className="btn-primary !w-auto !py-2 !px-5 text-sm">
          Connect
        </button>
      )}
    </div>
  );
}
