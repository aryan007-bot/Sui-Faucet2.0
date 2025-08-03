import { Request, Response } from 'express';
import { suiService } from '../services/suiService';
import { isValidRecipientAddress, formatAddressForDisplay } from '../utils/addressValidator';
import { API_RESPONSES } from '../utils/constants';

export interface FaucetRequestBody {
  address: string;
  amount?: number;
}

export interface FaucetResponse {
  success: boolean;
  message: string;
  data?: {
    transactionHash?: string;
    recipientAddress?: string;
    amount?: number;
    estimatedConfirmationTime?: string;
  };
  error?: string;
}

/**
 * Request SUI tokens from the faucet
 */
export async function requestTokens(req: Request, res: Response): Promise<void> {
  try {
    const { address, amount }: FaucetRequestBody = req.body;

    // Validate required fields
    if (!address) {
      res.status(400).json({
        success: false,
        message: 'Address is required',
        error: 'Missing recipient address'
      } as FaucetResponse);
      return;
    }

    // Validate address format
    if (!isValidRecipientAddress(address)) {
      res.status(400).json({
        success: false,
        message: API_RESPONSES.ERRORS.INVALID_ADDRESS,
        error: 'Invalid Sui address format'
      } as FaucetResponse);
      return;
    }

    // Validate amount if provided
    if (amount && (amount <= 0 || amount > 5000000000)) { // Max 5 SUI
      res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be between 0 and 5 SUI',
        error: 'Amount out of range'
      } as FaucetResponse);
      return;
    }

    console.log(`🎯 Token request from ${req.ip} for address: ${formatAddressForDisplay(address)}`);

    // Send tokens using Sui service
    const result = await suiService.sendTokens({
      recipientAddress: address,
      amount
    });

    if (result.success) {
      const response: FaucetResponse = {
        success: true,
        message: API_RESPONSES.SUCCESS.TOKENS_SENT,
        data: {
          transactionHash: result.transactionHash,
          recipientAddress: address,
          amount: amount || parseInt(process.env.FAUCET_AMOUNT || '1000000000'),
          estimatedConfirmationTime: '5-10 seconds'
        }
      };

      console.log(`✅ Tokens sent successfully to ${formatAddressForDisplay(address)}`);
      res.status(200).json(response);
    } else {
      console.log(`❌ Failed to send tokens: ${result.error}`);
      
      let statusCode = 500;
      if (result.error?.includes('Insufficient faucet balance')) {
        statusCode = 503; // Service unavailable
      } else if (result.error?.includes('already has sufficient balance')) {
        statusCode = 429; // Too many requests / rate limited
      }

      res.status(statusCode).json({
        success: false,
        message: result.error || API_RESPONSES.ERRORS.TRANSACTION_FAILED,
        error: result.error
      } as FaucetResponse);
    }

  } catch (error) {
    console.error('❌ Error in requestTokens controller:', error);
    res.status(500).json({
      success: false,
      message: API_RESPONSES.ERRORS.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as FaucetResponse);
  }
}

/**
 * Get faucet status and balance
 */
export async function getFaucetStatus(req: Request, res: Response): Promise<void> {
  try {
    const balance = await suiService.getFaucetBalance();
    const health = await suiService.healthCheck();

    res.status(200).json({
      success: true,
      message: 'Faucet status retrieved successfully',
      data: {
        faucetAddress: suiService.getFaucetAddress(),
        network: suiService.getNetwork(),
        balance: {
          total: balance.balance,
          sui: balance.balanceInSui,
          isLowBalance: balance.isLowBalance
        },
        health: {
          status: health.status,
          networkLatency: health.networkLatency
        },
        maxRequestAmount: parseInt(process.env.FAUCET_AMOUNT || '1000000000'),
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5')
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting faucet status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get faucet status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get transaction details by hash
 */
export async function getTransactionStatus(req: Request, res: Response): Promise<void> {
  try {
    const { transactionHash } = req.params;

    if (!transactionHash) {
      res.status(400).json({
        success: false,
        message: 'Transaction hash is required',
        error: 'Missing transaction hash parameter'
      });
      return;
    }

    const txDetails = await suiService.getTransactionDetails(transactionHash);

    res.status(200).json({
      success: true,
      message: 'Transaction details retrieved successfully',
      data: {
        transactionHash,
        status: txDetails.effects?.status?.status,
        gasUsed: txDetails.effects?.gasUsed,
        timestamp: txDetails.timestampMs,
        events: txDetails.events,
        objectChanges: txDetails.objectChanges
      }
    });

  } catch (error) {
    console.error('❌ Error getting transaction status:', error);
    
    let statusCode = 500;
    let message = 'Failed to get transaction status';
    
    if (error instanceof Error && error.message.includes('not found')) {
      statusCode = 404;
      message = 'Transaction not found';
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Manually refill faucet from official sources (admin endpoint)
 */
export async function refillFaucet(req: Request, res: Response): Promise<void> {
  try {
    console.log('🔄 Manual faucet refill requested...');
    
    const success = await suiService.refillFromOfficialFaucet();
    
    if (success) {
      const newBalance = await suiService.getFaucetBalance();
      
      res.status(200).json({
        success: true,
        message: 'Faucet refilled successfully',
        data: {
          newBalance: newBalance.balanceInSui,
          balanceStatus: newBalance.isLowBalance ? 'low' : 'sufficient'
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Failed to refill faucet from official sources',
        error: 'Refill operation failed'
      });
    }

  } catch (error) {
    console.error('❌ Error refilling faucet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal error during faucet refill',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
