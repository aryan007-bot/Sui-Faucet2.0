export const SUI_CONSTANTS = {
  // SUI token amounts (in MIST - smallest unit)
  MIST_PER_SUI: 1_000_000_000, // 1 SUI = 1 billion MIST
  DEFAULT_FAUCET_AMOUNT: 1_000_000_000, // 1 SUI
  MIN_FAUCET_AMOUNT: 100_000_000, // 0.1 SUI
  MAX_FAUCET_AMOUNT: 5_000_000_000, // 5 SUI
  
  // Network endpoints
  NETWORKS: {
    mainnet: 'https://fullnode.mainnet.sui.io',
    testnet: 'https://fullnode.testnet.sui.io',
    devnet: 'https://fullnode.devnet.sui.io',
    localnet: 'http://localhost:9000'
  },
  
  // Faucet endpoints
  FAUCET_ENDPOINTS: {
    testnet: 'https://faucet.testnet.sui.io/v2/gas',
    devnet: 'https://faucet.devnet.sui.io/v2/gas'
  }
};

export const RATE_LIMITS = {
  DEFAULT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  DEFAULT_MAX_REQUESTS: 5, // 5 requests per window
  MAX_REQUESTS_PER_WALLET_PER_DAY: 3,
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000 // 1 hour
};

export const API_RESPONSES = {
  SUCCESS: {
    TOKENS_SENT: 'Tokens sent successfully',
    REQUEST_PROCESSED: 'Request processed successfully'
  },
  ERRORS: {
    INVALID_ADDRESS: 'Invalid Sui address format',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
    INSUFFICIENT_BALANCE: 'Faucet has insufficient balance',
    TRANSACTION_FAILED: 'Transaction failed to process',
    NETWORK_ERROR: 'Network error occurred',
    INTERNAL_ERROR: 'Internal server error'
  }
};

export const VALIDATION_PATTERNS = {
  SUI_ADDRESS: /^0x[a-fA-F0-9]{64}$/, // 32 bytes = 64 hex chars + 0x prefix
  IP_ADDRESS: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
};
