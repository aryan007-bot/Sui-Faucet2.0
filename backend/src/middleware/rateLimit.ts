import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express'; // Ensure NextFunction is imported

/**
 * Rate limiting middleware for faucet requests
 * Prevents abuse by limiting requests per IP and per wallet address
 */

// IP-based rate limiting
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests per window default
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    error: 'Rate limit exceeded',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    // This handler is called when the IP limit is exceeded.
    // It sends the response and effectively ends the request-response cycle for this request.
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
    });
  }
});

// In-memory store for wallet address rate limiting
// TODO: Replace with Redis for production use
// Stores { count: number; resetTime: number } where resetTime is when the current 24-hour window ends
const walletRequestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Wallet address rate limiting middleware
 * Tracks requests per wallet address to prevent single wallet from draining faucet
 */
export function walletRateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const walletAddress = req.body.address;

  if (!walletAddress) {
    // If no wallet address is provided in the request body, skip this middleware.
    // This assumes `address` is always present for faucet requests.
    // Consider if you want to apply a stricter general limit if address is missing.
    next();
    return;
  }

  const now = Date.now();
  // Changed from 3 to 5 as per requirement (5 requests per 24 hours per address)
  const maxRequestsPer24Hours = parseInt(process.env.RATE_LIMIT_MAX_PER_WALLET || '5');
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Clean up expired entries (entries where the resetTime is in the past)
  // This loop runs on every request. For very high traffic, consider a more
  // efficient cleanup mechanism or a persistent store like Redis with TTL.
  for (const [address, data] of walletRequestStore.entries()) {
    if (now >= data.resetTime) {
      walletRequestStore.delete(address);
    }
  }

  const existing = walletRequestStore.get(walletAddress);

  if (existing) {
    if (existing.count >= maxRequestsPer24Hours) {
      const retryAfter = Math.ceil((existing.resetTime - now) / 1000); // Time in seconds until reset
      console.log(`🚫 Wallet rate limit exceeded for address: ${walletAddress}. Requests: ${existing.count}/${maxRequestsPer24Hours}. Resets in: ${retryAfter}s`);

      res.status(429).json({
        success: false,
        message: `This wallet has reached the limit of ${maxRequestsPer24Hours} requests per 24 hours. Please try again later.`,
        error: 'Wallet rate limit exceeded',
        retryAfter
      });
      return;
    }

    // Increment count for existing entry within its current 24-hour window
    existing.count += 1;
    // The resetTime remains the same for the current window
  } else {
    // First request from this wallet within a new 24-hour window
    walletRequestStore.set(walletAddress, {
      count: 1,
      resetTime: now + twentyFourHoursInMs // Set reset time 24 hours from now
    });
  }

  next();
}

/**
 * Combined rate limiting middleware that applies both IP and wallet limits
 * The IP rate limit middleware will send a response if the limit is hit.
 * If the IP limit is not hit, the request proceeds to the wallet rate limit middleware.
 */
export function combinedRateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Pass the request through the IP rate limit middleware first.
  // If `rateLimitMiddleware` sends a response (due to IP limit),
  // this inner callback will not proceed to `walletRateLimitMiddleware`.
  // If `rateLimitMiddleware` allows the request, it calls its internal 'next()'
  // which executes the provided callback.
  rateLimitMiddleware(req, res, () => {
    // This part of the code is only reached if the IP rate limit was NOT triggered.
    // Now, apply the wallet-based rate limit.
    walletRateLimitMiddleware(req, res, next);
  });
}

/**
 * Get current rate limit status for debugging/monitoring
 */
export function getRateLimitStatus() {
  const now = Date.now();
  // Filter out expired wallets for more accurate active count
  const activeWalletsArray = Array.from(walletRequestStore.entries()).filter(([, data]) => now < data.resetTime);

  return {
    ipRateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5')
    },
    walletRateLimit: {
      maxPer24Hours: parseInt(process.env.RATE_LIMIT_MAX_PER_WALLET || '5'), // Updated name for clarity
      activeWalletsCount: activeWalletsArray.length
    },
    activeWalletRequests: activeWalletsArray.map(([address, data]) => ({
      address: `${address.slice(0, 8)}...${address.slice(-6)}`,
      count: data.count,
      resetsIn: Math.max(0, Math.ceil((data.resetTime - now) / 1000)) // Time in seconds until reset
    }))
  };
}