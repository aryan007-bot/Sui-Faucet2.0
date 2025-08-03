"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const faucetController_1 = require("../controllers/faucetController");
const validation_1 = require("../middleware/validation");
const rateLimit_1 = require("../middleware/rateLimit");
const router = express_1.default.Router();
router.post('/request', rateLimit_1.rateLimitMiddleware, [
    (0, express_validator_1.body)('address')
        .isString()
        .notEmpty()
        .withMessage('Address is required')
        .matches(/^0x[a-fA-F0-9]{64}$/)
        .withMessage('Invalid Sui address format'),
    (0, express_validator_1.body)('amount')
        .optional()
        .isInt({ min: 100000000, max: 5000000000 })
        .withMessage('Amount must be between 0.1 and 5 SUI')
], validation_1.validateRequest, faucetController_1.requestTokens);
router.get('/status', faucetController_1.getFaucetStatus);
router.get('/transaction/:transactionHash', [
    (0, express_validator_1.param)('transactionHash')
        .isString()
        .notEmpty()
        .withMessage('Transaction hash is required')
        .isLength({ min: 40, max: 100 })
        .withMessage('Invalid transaction hash format')
], validation_1.validateRequest, faucetController_1.getTransactionStatus);
router.post('/refill', faucetController_1.refillFaucet);
router.get('/health', async (req, res) => {
    try {
        const { suiService } = await Promise.resolve().then(() => __importStar(require('../services/suiService')));
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
    }
    catch (error) {
        res.status(503).json({
            success: false,
            message: 'Faucet service health check failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=faucet.js.map