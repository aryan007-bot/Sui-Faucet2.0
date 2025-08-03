export declare const SUI_CONSTANTS: {
    MIST_PER_SUI: number;
    DEFAULT_FAUCET_AMOUNT: number;
    MIN_FAUCET_AMOUNT: number;
    MAX_FAUCET_AMOUNT: number;
    NETWORKS: {
        mainnet: string;
        testnet: string;
        devnet: string;
        localnet: string;
    };
    FAUCET_ENDPOINTS: {
        testnet: string;
        devnet: string;
    };
};
export declare const RATE_LIMITS: {
    DEFAULT_WINDOW_MS: number;
    DEFAULT_MAX_REQUESTS: number;
    MAX_REQUESTS_PER_WALLET_PER_DAY: number;
    CLEANUP_INTERVAL_MS: number;
};
export declare const API_RESPONSES: {
    SUCCESS: {
        TOKENS_SENT: string;
        REQUEST_PROCESSED: string;
    };
    ERRORS: {
        INVALID_ADDRESS: string;
        RATE_LIMIT_EXCEEDED: string;
        INSUFFICIENT_BALANCE: string;
        TRANSACTION_FAILED: string;
        NETWORK_ERROR: string;
        INTERNAL_ERROR: string;
    };
};
export declare const VALIDATION_PATTERNS: {
    SUI_ADDRESS: RegExp;
    IP_ADDRESS: RegExp;
};
//# sourceMappingURL=constants.d.ts.map