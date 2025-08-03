"use client";

import { useEffect } from "react";
import { FaucetForm } from "@/components/faucet-form";
import { StatusPanel } from "@/components/status-panel";
import { TransactionStatus } from "@/components/transaction-status";
import { ErrorMessage } from "@/components/error-message";
import { useFaucet } from "@/hooks/use-faucet";
import { Card } from "@/components/ui/card";

// Wallet imports from suiet
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

export default function FaucetPage() {
  const {
    requestTokens,
    getFaucetStatus,
    isLoading,
    error,
    transaction,
    faucetStatus,
    rateLimitInfo,
    clearError,
    clearTransaction,
  } = useFaucet();

  const { connected, address } = useWallet();

  useEffect(() => {
    getFaucetStatus();
    const interval = setInterval(getFaucetStatus, 30000);
    return () => clearInterval(interval);
  }, [getFaucetStatus]);

  const handleTokenRequest = async (walletAddress: string) => {
    clearError();
    clearTransaction();
    await requestTokens(walletAddress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sui Testnet Faucet
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Get free SUI tokens for testing on Sui Testnet
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Testnet
              </span>
              <ConnectButton className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Request SUI Tokens
              </h2>
              <FaucetForm
                onSubmit={handleTokenRequest}
                isLoading={isLoading}
                disabled={rateLimitInfo?.isRateLimited}
                initialAddress={address || ""}
              />

              {rateLimitInfo?.isRateLimited && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Rate limit reached. Please wait{" "}
                    {rateLimitInfo.timeUntilReset} before requesting again.
                  </p>
                </div>
              )}
            </Card>

            {error && <ErrorMessage message={error} onDismiss={clearError} />}
            {transaction && (
              <TransactionStatus
                transaction={transaction}
                onDismiss={clearTransaction}
              />
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                How to Use
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>1. Connect your Sui wallet or enter your address below.</p>
                <p>2. Click "Request SUI Tokens" to receive 1 SUI.</p>
                <p>3. Wait for the transaction to be confirmed.</p>
                <p>4. Check your wallet balance.</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Rate Limit:</strong> 5 requests per 24 hours per
                  address
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <StatusPanel faucetStatus={faucetStatus} isLoading={isLoading} />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <p>Sui Testnet Faucet - Built for testing purposes only</p>
            <p className="mt-1">
              Need help? Check the{" "}
              <a
                href="https://docs.sui.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Sui Documentation
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
