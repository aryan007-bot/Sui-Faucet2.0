"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_PATTERNS = exports.API_RESPONSES = exports.RATE_LIMITS = exports.SUI_CONSTANTS = void 0;
exports.SUI_CONSTANTS = {
    MIST_PER_SUI: 1000000000,
    DEFAULT_FAUCET_AMOUNT: 1000000000,
    MIN_FAUCET_AMOUNT: 100000000,
    MAX_FAUCET_AMOUNT: 5000000000,
    NETWORKS: {
        mainnet: 'https://fullnode.mainnet.sui.io',
        testnet: 'https://fullnode.testnet.sui.io',
        devnet: 'https://fullnode.devnet.sui.io',
        localnet: 'http://localhost:9000'
    },
    FAUCET_ENDPOINTS: {
        testnet: 'https://faucet.testnet.sui.io/v2/gas',
        devnet: 'https://faucet.devnet.sui.io/v2/gas'
    }
};
exports.RATE_LIMITS = {
    DEFAULT_WINDOW_MS: 15 * 60 * 1000,
    DEFAULT_MAX_REQUESTS: 5,
    MAX_REQUESTS_PER_WALLET_PER_DAY: 3,
    CLEANUP_INTERVAL_MS: 60 * 60 * 1000
};
exports.API_RESPONSES = {
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
exports.VALIDATION_PATTERNS = {
    SUI_ADDRESS: /^0x[a-fA-F0-9]{64}$/,
    IP_ADDRESS: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
};
//# sourceMappingURL=constants.js.map