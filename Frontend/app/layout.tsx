import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider" // This will be handled by Providers

import Providers from "./providers" // Import your Providers component

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sui Testnet Faucet",
  description: "Get free SUI tokens for testing on Sui Testnet",
  keywords: ["Sui", "Testnet", "Faucet", "Blockchain", "Crypto"],
  authors: [{ name: "Sui Faucet Team" }],
  viewport: "width=device-width, initial-scale=1",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
          Wrap the 'children' with your Providers component.
          The Providers component itself will contain the ThemeProvider,
          QueryClientProvider, SuiClientProvider, and WalletProvider.
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}