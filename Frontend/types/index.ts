export interface Transaction {
  transactionHash: string
  recipientAddress: string
  amount: number
  estimatedConfirmationTime: string
}

export interface FaucetStatus {
  faucetAddress: string
  network: string
  balance: {
    sui: number
    isLowBalance: boolean
  }
  health: {
    status: string
    networkLatency: number
  }
}

export interface RateLimitInfo {
  isRateLimited: boolean
  timeUntilReset: string
}
