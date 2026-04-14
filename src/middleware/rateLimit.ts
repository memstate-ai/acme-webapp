import { rateLimit } from "express-rate-limit";

/**
 * Rate limiting middleware configuration.
 * Limits each IP to a specific number of requests within a time window.
 * Configurable via environment variables.
 * 
 * Default: 100 requests per 15 minutes
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  message: { 
    error: process.env.RATE_LIMIT_MESSAGE || "Too many requests, please try again later." 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});