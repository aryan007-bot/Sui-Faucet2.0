"use client"

import { useState, useCallback, useEffect } from "react" // Import useEffect
import { api } from "@/utils/api"
import type { FaucetStatus, Transaction, RateLimitInfo } from "@/types"

// You will need to import your Sui wallet SDK or adapter here.
// For example, if you're using the @mysten/wallet-adapter:
// import { useWallet } from '@mysten/wallet-adapter-react';
// import { ConnectionStatus } from '@mysten/wallet-adapter-react/dist/types'; // Might need specific types

export function useFaucet() {
  // --- Faucet-specific states ---
  const [isLoading, setIsLoading] = useState(false) // For faucet token request
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [faucetStatus, setFaucetStatus] = useState<FaucetStatus | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)

  // --- Wallet connection states ---
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isWalletConnecting, setIsWalletConnecting] = useState(false) // For the connect button's loading state

  // --- Faucet Status Logic ---
  const getFaucetStatus = useCallback(async () => {
    try {
      const response = await api.getFaucetStatus()

      if (response.success && response.data) {
        setFaucetStatus({
          faucetAddress: response.data.faucetAddress,
          network: response.data.network,
          balance: response.data.balance,
          health: response.data.health,
        })
      }
    } catch (err) {
      console.error("Failed to fetch faucet status:", err)
      // Optionally, set an error state for status fetching itself if critical
    }
  }, [])

  // --- Request Tokens Logic ---
  const requestTokens = useCallback(
    async (address: string) => {
      setIsLoading(true)
      setError(null)
      setTransaction(null) // Clear previous transaction on new request

      try {
        const response = await api.requestTokens(address)

        if (response.success && response.data) {
          setTransaction({
            transactionHash: response.data.transactionHash,
            recipientAddress: response.data.recipientAddress,
            amount: response.data.amount,
            estimatedConfirmationTime: response.data.estimatedConfirmationTime,
          })

          // Refresh faucet status after successful request
          await getFaucetStatus()
        } else {
          // If the API returns success: false, use its message
          setError(response.message || "Failed to request tokens")
          // If the API explicitly sends rate limit info, handle it here
          if (response.message?.includes("rate limit")) {
             setRateLimitInfo({
               isRateLimited: true,
               timeUntilReset: "15 minutes", // Or parse from response if available
             });
          }
        }
      } catch (err) {
        // Handle network errors or errors thrown before the API response is parsed
        if (err instanceof Error) {
          if (err.message.includes("rate limit")) {
            setError("Rate limit exceeded. Please wait before making another request.")
            setRateLimitInfo({
              isRateLimited: true,
              timeUntilReset: "15 minutes", // Placeholder, ideally from backend
            })
          } else {
            setError(err.message)
          }
        } else {
          setError("Network error. Please check your connection and try again.")
        }
      } finally {
        setIsLoading(false)
      }
    },
    [getFaucetStatus],
  )

  // --- Wallet Connection Logic ---
  const connectWallet = useCallback(async () => {
    setIsWalletConnecting(true)
    setError(null) // Clear any previous errors

    try {
      // *** THIS IS WHERE YOU'LL INTEGRATE THE SUI WALLET SDK ***
      // The exact code will depend on the specific Sui wallet adapter/SDK you choose.
      // Below is a conceptual example using a generic 'window.sui' object
      // or a placeholder for a library like '@mysten/wallet-adapter-react'

      // Example using a hypothetical window.sui object (common for browser extensions):
      // if (window.sui && window.sui.isSuiWallet) { // Check if the wallet object exists
      //   const accounts = await window.sui.requestAccounts(); // Or window.sui.connect()
      //   if (accounts && accounts.length > 0) {
      //     setConnectedAddress(accounts[0]);
      //     setIsConnected(true);
      //   } else {
      //     throw new Error("No accounts found or connection rejected.");
      //   }
      // } else {
      //   throw new Error("Sui Wallet extension not detected.");
      // }

      // --- OR ---

      // Example using @mysten/wallet-adapter-react (more robust for DApps):
      // const wallet = useWallet(); // If you can use this hook inside useFaucet (might need a wrapper)
      // if (wallet.connected) {
      //   setConnectedAddress(wallet.account?.address || null);
      //   setIsConnected(true);
      // } else {
      //   // Trigger connection if not already connected
      //   await wallet.connect(); // This will open the wallet selection/connection modal
      //   if (wallet.connected) {
      //     setConnectedAddress(wallet.account?.address || null);
      //     setIsConnected(true);
      //   } else {
      //     throw new Error("Wallet connection failed or was cancelled.");
      //   }
      // }


      // For **development/simulation** if you don't have the SDK set up yet:
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
      const simulatedAddress = "0x" + Math.random().toString(16).substring(2, 42) // Generate a mock address
      setConnectedAddress(simulatedAddress)
      setIsConnected(true)

    } catch (e: any) {
      console.error("Wallet connection failed:", e)
      setError(e.message || "Failed to connect wallet. Please ensure your Sui Wallet extension is installed and unlocked.")
      setConnectedAddress(null)
      setIsConnected(false)
    } finally {
      setIsWalletConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setConnectedAddress(null)
    setIsConnected(false)
    // If using a wallet adapter library, you might call a disconnect method here:
    // const wallet = useWallet(); // If available
    // wallet.disconnect();
  }, [])

  // --- General Utility Functions ---
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearTransaction = useCallback(() => {
    setTransaction(null)
  }, [])

  // IMPORTANT: Return the new wallet states and functions
  return {
    requestTokens,
    getFaucetStatus,
    isLoading,
    error,
    transaction,
    faucetStatus,
    rateLimitInfo,
    clearError,
    clearTransaction,
    // New wallet-related exports:
    connectedAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
    isWalletConnecting,
  }
}