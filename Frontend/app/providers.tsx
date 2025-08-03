// app/providers.tsx
"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

// Sui client
import { SuiClientProvider as MystenSuiClientProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Suiet Wallet
import {
  WalletProvider,
  ConnectButton,
  defineSlushWallet,
} from "@suiet/wallet-kit";

import "@suiet/wallet-kit/style.css"; // <- Required for ConnectButton styling

// Font
const inter = Inter({ subsets: ["latin"] });

// QueryClient for React Query
const queryClient = new QueryClient();

// Sui networks config
const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
  devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

// Slush Wallet config
const slushWebWalletConfig = defineSlushWallet({
  appName: "Sui Testnet Faucet",
});

import { useWallet } from "@suiet/wallet-kit";

// 🔍 Wallet status display component
function WalletStatus() {
  const { connected, address } = useWallet();
  return (
    <div className="text-sm text-gray-600 mt-1">
      {connected ? (
        <p>✅ Connected: <span className="font-mono">{address}</span></p>
      ) : (
        <p>❌ Wallet not connected</p>
      )}
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <MystenSuiClientProvider
              networks={networks}
              defaultNetwork="testnet"
            >
              <WalletProvider
                defaultWallets={[slushWebWalletConfig]}
                autoConnect={true}
              >
                {/* <div className="p-4 flex justify-between items-center border-b border-gray-300">
                  <h1 className="text-xl font-semibold">🧪 Sui Faucet</h1>
                  <div className="text-right">
                    <ConnectButton />
                    <WalletStatus />
                  </div>
                </div> */}

                {/* Render the rest of your app */}
                {children}
              </WalletProvider>
            </MystenSuiClientProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
