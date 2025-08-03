import { Request, Response } from 'express';
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
export declare function requestTokens(req: Request, res: Response): Promise<void>;
export declare function getFaucetStatus(req: Request, res: Response): Promise<void>;
export declare function getTransactionStatus(req: Request, res: Response): Promise<void>;
export declare function refillFaucet(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=faucetController.d.ts.map