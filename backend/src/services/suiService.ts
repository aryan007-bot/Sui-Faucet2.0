import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { getFaucetHost, requestSuiFromFaucetV2 } from '@mysten/sui/faucet';
import { SUI_CONSTANTS } from '../utils/constants';
import { validateAndNormalizeSuiAddress } from '../utils/addressValidator';

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

class SuiService {
  private client: SuiClient;
  private faucetKeypair: Ed25519Keypair | null = null;
  private network: string;
  private faucetAddress: string = '';

  constructor() {
    this.network = process.env.SUI_NETWORK || 'testnet';
    this.client = new SuiClient({ 
      url: getFullnodeUrl(this.network as 'testnet' | 'devnet' | 'mainnet') 
    });
    
    console.log(`🔗 Sui Service initialized for ${this.network}`);
  }

  async initializeFaucetWallet(): Promise<void> {
    try {
      const privateKey = process.env.FAUCET_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('FAUCET_PRIVATE_KEY not found in environment variables');
      }

      // Create keypair from the Sui-formatted private key
      this.faucetKeypair = Ed25519Keypair.fromSecretKey(privateKey);
      this.faucetAddress = this.faucetKeypair.getPublicKey().toSuiAddress();
      
      console.log(`🔑 Faucet wallet initialized: ${this.faucetAddress}`);
      
      // Check initial balance
      const balance = await this.getFaucetBalance();
      console.log(`💰 Faucet balance: ${balance.balanceInSui} SUI`);
      
      if (balance.isLowBalance) {
        console.warn('⚠️  WARNING: Faucet balance is low!');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize faucet wallet:', error);
      throw error;
    }
  }

  async getFaucetBalance(): Promise<FaucetBalance> {
    if (!this.faucetAddress) {
      throw new Error('Faucet wallet not initialized');
    }

    try {
      const balance = await this.client.getBalance({
        owner: this.faucetAddress,
      });

      const balanceInMist = parseInt(balance.totalBalance);
      const balanceInSui = balanceInMist / SUI_CONSTANTS.MIST_PER_SUI;
      const isLowBalance = balanceInSui < 5;

      return {
        balance: balanceInMist,
        balanceInSui,
        isLowBalance
      };
    } catch (error) {
      console.error('Error getting faucet balance:', error);
      throw new Error('Failed to get faucet balance');
    }
  }

  async checkRecipientBalance(address: string): Promise<number> {
    try {
      const normalizedAddress = validateAndNormalizeSuiAddress(address);
      const balance = await this.client.getBalance({
        owner: normalizedAddress,
      });

      return parseInt(balance.totalBalance) / SUI_CONSTANTS.MIST_PER_SUI;
    } catch (error) {
      console.error('Error checking recipient balance:', error);
      return 0;
    }
  }

  async sendTokens(request: FaucetRequest): Promise<TokenTransferResult> {
    if (!this.faucetKeypair) {
      throw new Error('Faucet wallet not initialized');
    }

    try {
      const recipientAddress = validateAndNormalizeSuiAddress(request.recipientAddress);
      const amount = request.amount || parseInt(process.env.FAUCET_AMOUNT || SUI_CONSTANTS.DEFAULT_FAUCET_AMOUNT.toString());
      
      console.log(`💸 Sending ${amount / SUI_CONSTANTS.MIST_PER_SUI} SUI to ${recipientAddress}`);

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

      const tx = new Transaction();
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
      } else {
        console.error('❌ Transaction failed:', result.effects?.status);
        return {
          success: false,
          error: 'Transaction execution failed'
        };
      }

    } catch (error) {
      console.error('❌ Error sending tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async refillFromOfficialFaucet(): Promise<boolean> {
    if (!this.faucetAddress || this.network === 'mainnet') {
      return false;
    }

    try {
      console.log('🔄 Attempting to refill from official faucet...');
      
      await requestSuiFromFaucetV2({
        host: getFaucetHost(this.network as 'testnet' | 'devnet'),
        recipient: this.faucetAddress,
      });

      console.log('✅ Successfully refilled from official faucet');
      return true;
    } catch (error) {
      console.error('❌ Failed to refill from official faucet:', error);
      return false;
    }
  }

  async getTransactionDetails(transactionHash: string) {
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
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw new Error('Failed to get transaction details');
    }
  }

  async healthCheck(): Promise<{ status: string; faucetBalance?: number; networkLatency?: number }> {
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
    } catch (error) {
      console.error('Sui service health check failed:', error);
      return {
        status: 'unhealthy'
      };
    }
  }

  getFaucetAddress(): string {
    return this.faucetAddress;
  }

  getNetwork(): string {
    return this.network;
  }
}

export const suiService = new SuiService();
