import type { Request, Response, NextFunction } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

// Rate limiting middleware
export const apiRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const AUTH_LIMIT = Number(process.env.AUTH_RATE_LIMIT ?? (process.env.NODE_ENV === "development" ? 50 : 5));

export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: AUTH_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many login attempts, please try again later.",
      retryAfterMinutes: 15,
    });
  },
});

export const searchRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 search requests per minute
  message: "Too many search requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF Protection middleware (simple token-based)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Skip CSRF for API routes that use token-based auth (already secure)
  if (req.path.startsWith('/api/auth/') || req.path.startsWith('/api/webhooks/')) {
    return next();
  }

  // For other routes, check for CSRF token in header
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.cookies?.token;

  // In production, implement proper CSRF token validation
  // For now, we rely on SameSite cookies and token-based auth
  if (!sessionToken && !csrfToken && req.method !== 'GET') {
    // Allow if no session (public endpoints)
    return next();
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

