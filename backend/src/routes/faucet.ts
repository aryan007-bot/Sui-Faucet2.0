import express from 'express';
import { body, param } from 'express-validator';
import { requestTokens, getFaucetStatus, getTransactionStatus, refillFaucet } from '../controllers/faucetController';
import { validateRequest } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const router = express.Router();

/**
 * POST /api/faucet/request
 * Request SUI tokens from the faucet
 */
router.post('/request', 
  rateLimitMiddleware,
  [
    body('address')
      .isString()
      .notEmpty()
      .withMessage('Address is required')
      .matches(/^0x[a-fA-F0-9]{64}$/)
      .withMessage('Invalid Sui address format'),
    body('amount')
      .optional()
      .isInt({ min: 100000000, max: 5000000000 }) // 0.1 to 5 SUI in MIST
      .withMessage('Amount must be between 0.1 and 5 SUI')
  ],
  validateRequest,
  requestTokens
);

/**
 * GET /api/faucet/status
 * Get faucet status, balance, and configuration
 */
router.get('/status', getFaucetStatus);

/**
 * GET /api/faucet/transaction/:transactionHash
 * Get transaction details by hash
 */
router.get('/transaction/:transactionHash',
  [
    param('transactionHash')
      .isString()
      .notEmpty()
      .withMessage('Transaction hash is required')
      .isLength({ min: 40, max: 100 })
      .withMessage('Invalid transaction hash format')
  ],
  validateRequest,
  getTransactionStatus
);

/**
 * POST /api/faucet/refill
 * Manually refill faucet balance (admin endpoint)
 * TODO: Add authentication middleware for admin access
 */
router.post('/refill',
  // TODO: Add admin authentication middleware here
  refillFaucet
);

/**
 * GET /api/faucet/health
 * Health check endpoint for the faucet service
 */
router.get('/health', async (req, res) => {
  try {
    const { suiService } = await import('../services/suiService');
    const health = await suiService.healthCheck();
    
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      message: `Faucet service is ${health.status}`,
      data: {
        status: health.status,
        faucetBalance: health.faucetBalance,
        networkLatency: health.networkLatency,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Faucet service health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
