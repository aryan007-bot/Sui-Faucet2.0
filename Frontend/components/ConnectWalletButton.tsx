"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface ConnectWalletButtonProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
}

export function ConnectWalletButton({ onConnect, onDisconnect, isConnected, address, isLoading }: ConnectWalletButtonProps) {
  const [buttonConnecting, setButtonConnecting] = useState(false);

  const handleConnect = async () => {
    setButtonConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error("Error during button connect:", error);
    } finally {
      setButtonConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground font-medium">
            Connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
          </span>
          <Button
            onClick={handleDisconnect}
            variant="secondary"
            size="default"
            className="px-4 py-2 text-sm font-medium rounded-md"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isLoading || buttonConnecting}
          size="default"
          className="px-4 py-2 text-sm font-medium rounded-md"
        >
          {isLoading || buttonConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}
