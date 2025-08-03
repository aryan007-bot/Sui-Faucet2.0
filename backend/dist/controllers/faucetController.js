"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestTokens = requestTokens;
exports.getFaucetStatus = getFaucetStatus;
exports.getTransactionStatus = getTransactionStatus;
exports.refillFaucet = refillFaucet;
const suiService_1 = require("../services/suiService");
const addressValidator_1 = require("../utils/addressValidator");
const constants_1 = require("../utils/constants");
async function requestTokens(req, res) {
    try {
        const { address, amount } = req.body;
        if (!address) {
            res.status(400).json({
                success: false,
                message: 'Address is required',
                error: 'Missing recipient address'
            });
            return;
        }
        if (!(0, addressValidator_1.isValidRecipientAddress)(address)) {
            res.status(400).json({
                success: false,
                message: constants_1.API_RESPONSES.ERRORS.INVALID_ADDRESS,
                error: 'Invalid Sui address format'
            });
            return;
        }
        if (amount && (amount <= 0 || amount > 5000000000)) {
            res.status(400).json({
                success: false,
                message: 'Invalid amount. Must be between 0 and 5 SUI',
                error: 'Amount out of range'
            });
            return;
        }
        console.log(`🎯 Token request from ${req.ip} for address: ${(0, addressValidator_1.formatAddressForDisplay)(address)}`);
        const result = await suiService_1.suiService.sendTokens({
            recipientAddress: address,
            amount
        });
        if (result.success) {
            const response = {
                success: true,
                message: constants_1.API_RESPONSES.SUCCESS.TOKENS_SENT,
                data: {
                    transactionHash: result.transactionHash,
                    recipientAddress: address,
                    amount: amount || parseInt(process.env.FAUCET_AMOUNT || '1000000000'),
                    estimatedConfirmationTime: '5-10 seconds'
                }
            };
            console.log(`✅ Tokens sent successfully to ${(0, addressValidator_1.formatAddressForDisplay)(address)}`);
            res.status(200).json(response);
        }
        else {
            console.log(`❌ Failed to send tokens: ${result.error}`);
            let statusCode = 500;
            if (result.error?.includes('Insufficient faucet balance')) {
                statusCode = 503;
            }
            else if (result.error?.includes('already has sufficient balance')) {
                statusCode = 429;
            }
            res.status(statusCode).json({
                success: false,
                message: result.error || constants_1.API_RESPONSES.ERRORS.TRANSACTION_FAILED,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('❌ Error in requestTokens controller:', error);
        res.status(500).json({
            success: false,
            message: constants_1.API_RESPONSES.ERRORS.INTERNAL_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function getFaucetStatus(req, res) {
    try {
        const balance = await suiService_1.suiService.getFaucetBalance();
        const health = await suiService_1.suiService.healthCheck();
        res.status(200).json({
            success: true,
            message: 'Faucet status retrieved successfully',
            data: {
                faucetAddress: suiService_1.suiService.getFaucetAddress(),
                network: suiService_1.suiService.getNetwork(),
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
    }
    catch (error) {
        console.error('❌ Error getting faucet status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get faucet status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function getTransactionStatus(req, res) {
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
        const txDetails = await suiService_1.suiService.getTransactionDetails(transactionHash);
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
    }
    catch (error) {
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
async function refillFaucet(req, res) {
    try {
        console.log('🔄 Manual faucet refill requested...');
        const success = await suiService_1.suiService.refillFromOfficialFaucet();
        if (success) {
            const newBalance = await suiService_1.suiService.getFaucetBalance();
            res.status(200).json({
                success: true,
                message: 'Faucet refilled successfully',
                data: {
                    newBalance: newBalance.balanceInSui,
                    balanceStatus: newBalance.isLowBalance ? 'low' : 'sufficient'
                }
            });
        }
        else {
            res.status(503).json({
                success: false,
                message: 'Failed to refill faucet from official sources',
                error: 'Refill operation failed'
            });
        }
    }
    catch (error) {
        console.error('❌ Error refilling faucet:', error);
        res.status(500).json({
            success: false,
            message: 'Internal error during faucet refill',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=faucetController.js.map