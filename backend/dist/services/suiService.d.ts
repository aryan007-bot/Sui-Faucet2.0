export interface TokenTransferResult {
    success: boolean;
    transactionHash?: string;
    error?: string;
    gasUsed?: number;
}
export interface FaucetBalance {
    balance: number;
    balanceInSui: number;
    isLowBalance: boolean;
}
export interface FaucetRequest {
    recipientAddress: string;
    amount?: number;
}
declare class SuiService {
    private client;
    private faucetKeypair;
    private network;
    private faucetAddress;
    constructor();
    initializeFaucetWallet(): Promise<void>;
    getFaucetBalance(): Promise<FaucetBalance>;
    checkRecipientBalance(address: string): Promise<number>;
    sendTokens(request: FaucetRequest): Promise<TokenTransferResult>;
    refillFromOfficialFaucet(): Promise<boolean>;
    getTransactionDetails(transactionHash: string): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse>;
    healthCheck(): Promise<{
        status: string;
        faucetBalance?: number;
        networkLatency?: number;
    }>;
    getFaucetAddress(): string;
    getNetwork(): string;
}
export declare const suiService: SuiService;
export {};
//# sourceMappingURL=suiService.d.ts.map