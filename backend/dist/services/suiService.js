"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suiService = void 0;
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const transactions_1 = require("@mysten/sui/transactions");
const faucet_1 = require("@mysten/sui/faucet");
const constants_1 = require("../utils/constants");
const addressValidator_1 = require("../utils/addressValidator");
class SuiService {
    constructor() {
        this.faucetKeypair = null;
        this.faucetAddress = '';
        this.network = process.env.SUI_NETWORK || 'testnet';
        this.client = new client_1.SuiClient({
            url: (0, client_1.getFullnodeUrl)(this.network)
        });
        console.log(`🔗 Sui Service initialized for ${this.network}`);
    }
    async initializeFaucetWallet() {
        try {
            const privateKey = process.env.FAUCET_PRIVATE_KEY;
            if (!privateKey) {
                throw new Error('FAUCET_PRIVATE_KEY not found in environment variables');
            }
            this.faucetKeypair = ed25519_1.Ed25519Keypair.fromSecretKey(privateKey);
            this.faucetAddress = this.faucetKeypair.getPublicKey().toSuiAddress();
            console.log(`🔑 Faucet wallet initialized: ${this.faucetAddress}`);
            const balance = await this.getFaucetBalance();
            console.log(`💰 Faucet balance: ${balance.balanceInSui} SUI`);
            if (balance.isLowBalance) {
                console.warn('⚠️  WARNING: Faucet balance is low!');
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize faucet wallet:', error);
            throw error;
        }
    }
    async getFaucetBalance() {
        if (!this.faucetAddress) {
            throw new Error('Faucet wallet not initialized');
        }
        try {
            const balance = await this.client.getBalance({
                owner: this.faucetAddress,
            });
            const balanceInMist = parseInt(balance.totalBalance);
            const balanceInSui = balanceInMist / constants_1.SUI_CONSTANTS.MIST_PER_SUI;
            const isLowBalance = balanceInSui < 5;
            return {
                balance: balanceInMist,
                balanceInSui,
                isLowBalance
            };
        }
        catch (error) {
            console.error('Error getting faucet balance:', error);
            throw new Error('Failed to get faucet balance');
        }
    }
    async checkRecipientBalance(address) {
        try {
            const normalizedAddress = (0, addressValidator_1.validateAndNormalizeSuiAddress)(address);
            const balance = await this.client.getBalance({
                owner: normalizedAddress,
            });
            return parseInt(balance.totalBalance) / constants_1.SUI_CONSTANTS.MIST_PER_SUI;
        }
        catch (error) {
            console.error('Error checking recipient balance:', error);
            return 0;
        }
    }
    async sendTokens(request) {
        if (!this.faucetKeypair) {
            throw new Error('Faucet wallet not initialized');
        }
        try {
            const recipientAddress = (0, addressValidator_1.validateAndNormalizeSuiAddress)(request.recipientAddress);
            const amount = request.amount || parseInt(process.env.FAUCET_AMOUNT || constants_1.SUI_CONSTANTS.DEFAULT_FAUCET_AMOUNT.toString());
            console.log(`💸 Sending ${amount / constants_1.SUI_CONSTANTS.MIST_PER_SUI} SUI to ${recipientAddress}`);
            const faucetBalance = await this.getFaucetBalance();
            if (faucetBalance.balance < amount) {
                return {
                    success: false,
                    error: 'Insufficient faucet balance'
                };
            }
            const recipientBalance = await this.checkRecipientBalance(recipientAddress);
            if (recipientBalance > 50) {
                return {
                    success: false,
                    error: 'Recipient already has sufficient balance'
                };
            }
            const tx = new transactions_1.Transaction();
            const [coin] = tx.splitCoins(tx.gas, [amount]);
            tx.transferObjects([coin], recipientAddress);
            const result = await this.client.signAndExecuteTransaction({
                signer: this.faucetKeypair,
                transaction: tx,
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            });
            if (result.effects?.status?.status === 'success') {
                console.log(`✅ Transaction successful: ${result.digest}`);
                return {
                    success: true,
                    transactionHash: result.digest,
                    gasUsed: result.effects.gasUsed ? parseInt(result.effects.gasUsed.computationCost) : 0
                };
            }
            else {
                console.error('❌ Transaction failed:', result.effects?.status);
                return {
                    success: false,
                    error: 'Transaction execution failed'
                };
            }
        }
        catch (error) {
            console.error('❌ Error sending tokens:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    async refillFromOfficialFaucet() {
        if (!this.faucetAddress || this.network === 'mainnet') {
            return false;
        }
        try {
            console.log('🔄 Attempting to refill from official faucet...');
            await (0, faucet_1.requestSuiFromFaucetV2)({
                host: (0, faucet_1.getFaucetHost)(this.network),
                recipient: this.faucetAddress,
            });
            console.log('✅ Successfully refilled from official faucet');
            return true;
        }
        catch (error) {
            console.error('❌ Failed to refill from official faucet:', error);
            return false;
        }
    }
    async getTransactionDetails(transactionHash) {
        try {
            const txDetails = await this.client.getTransactionBlock({
                digest: transactionHash,
                options: {
                    showEffects: true,
                    showInput: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });
            return txDetails;
        }
        catch (error) {
            console.error('Error getting transaction details:', error);
            throw new Error('Failed to get transaction details');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.client.getLatestSuiSystemState();
            const networkLatency = Date.now() - startTime;
            let faucetBalance;
            if (this.faucetAddress) {
                const balance = await this.getFaucetBalance();
                faucetBalance = balance.balanceInSui;
            }
            return {
                status: 'healthy',
                faucetBalance,
                networkLatency
            };
        }
        catch (error) {
            console.error('Sui service health check failed:', error);
            return {
                status: 'unhealthy'
            };
        }
    }
    getFaucetAddress() {
        return this.faucetAddress;
    }
    getNetwork() {
        return this.network;
    }
}
exports.suiService = new SuiService();
//# sourceMappingURL=suiService.js.map