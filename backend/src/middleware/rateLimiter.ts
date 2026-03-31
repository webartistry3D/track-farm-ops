import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * API Rate Limiting Middleware
 * Prevents data enumeration attacks and brute force attempts
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAccess: number;
}

interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Max requests per window
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;      // Don't count failed requests
  message?: string;        // Custom error message
  keyGenerator?: (req: AuthRequest) => string;  // Custom key generator
}

class RateLimiter {
  protected store = new Map<string, RateLimitEntry>();
  protected config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      ...config
    };
  }

  /**
   * Middleware function
   */
  middleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const key = this.getKey(req);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      // First request from this key
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        lastAccess: now
      });
      return next();
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        lastAccess: now
      });
      return next();
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      
      // Log rate limit violation
      console.log(`🚫 Rate Limit Exceeded: Key=${key}, Count=${entry.count}, Limit=${this.config.maxRequests}, ResetIn=${resetIn}s`);
      
      res.status(429).json({
        error: this.config.message,
        retryAfter: resetIn,
        limit: this.config.maxRequests,
        windowMs: this.config.windowMs,
        current: entry.count
      });
      return;
    }

    // Increment counter
    entry.count++;
    entry.lastAccess = now;
    this.store.set(key, entry);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });

    next();
  };

  /**
   * Get rate limit key for request
   */
  protected getKey(req: AuthRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key based on user and IP
    const userId = req.user?.id || 'anonymous';
    const ip = this.getClientIP(req);
    return `${userId}:${ip}`;
  }

  /**
   * Get client IP from request
   */
  private getClientIP(req: AuthRequest): string {
    return (
      req.get('X-Forwarded-For')?.split(',')[0] ||
      req.get('X-Real-IP') ||
      req.get('X-Client-IP') ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current stats
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    averageRequests: number;
    topConsumers: Array<{ key: string; count: number; lastAccess: Date }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    const activeEntries = entries.filter(([, entry]) => now <= entry.resetTime);
    
    const totalRequests = entries.reduce((sum, [, entry]) => sum + entry.count, 0);
    const averageRequests = entries.length > 0 ? totalRequests / entries.length : 0;

    const topConsumers = entries
      .map(([key, entry]) => ({
        key,
        count: entry.count,
        lastAccess: new Date(entry.lastAccess)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalKeys: entries.length,
      activeKeys: activeEntries.length,
      averageRequests: Math.round(averageRequests * 100) / 100,
      topConsumers
    };
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Authentication endpoints - very strict
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,              // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },

  // Password change endpoints - very strict for security
  passwordChange: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 3,              // 3 password changes per 15 minutes
    message: 'Too many password change attempts. For security reasons, please wait before trying again.'
  },

  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 1000,          // 1000 requests per 15 minutes
    message: 'Rate limit exceeded, please slow down.'
  },

  // Data-intensive endpoints
  dataIntensive: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,           // 100 requests per 15 minutes
    message: 'Too many data requests, please wait before trying again.'
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 50,            // 50 uploads per hour
    message: 'Upload limit exceeded, please try again later.'
  },

  // Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 200,           // 200 admin operations per 15 minutes
    message: 'Admin operation limit exceeded, please try again later.'
  }
};

// Create rate limiters
export const createRateLimiter = (config: RateLimitConfig): RateLimiter => {
  return new RateLimiter(config);
};

// Pre-configured limiters
export const authRateLimiter = createRateLimiter(rateLimitConfigs.auth);
export const passwordChangeRateLimiter = createRateLimiter(rateLimitConfigs.passwordChange);
export const generalRateLimiter = createRateLimiter(rateLimitConfigs.general);
export const dataIntensiveRateLimiter = createRateLimiter(rateLimitConfigs.dataIntensive);
export const uploadRateLimiter = createRateLimiter(rateLimitConfigs.upload);
export const adminRateLimiter = createRateLimiter(rateLimitConfigs.admin);

/**
 * Organization-based rate limiting
 * Limits requests per organization rather than per user
 */
export const createOrganizationRateLimiter = (config: RateLimitConfig): RateLimiter => {
  return createRateLimiter({
    ...config,
    keyGenerator: (req: AuthRequest) => {
      const orgId = req.user?.organizationId || 'no-org';
      return `org:${orgId}`;
    }
  });
};

/**
 * IP-based rate limiting for anonymous requests
 */
export const createIPRateLimiter = (config: RateLimitConfig): RateLimiter => {
  return createRateLimiter({
    ...config,
    keyGenerator: (req: AuthRequest) => {
      const ip = req.get('X-Forwarded-For')?.split(',')[0] ||
                 req.get('X-Real-IP') ||
                 req.get('X-Client-IP') ||
                 req.connection?.remoteAddress ||
                 req.socket?.remoteAddress ||
                 'unknown';
      return `ip:${ip}`;
    }
  });
};

/**
 * Progressive rate limiting
 * Becomes more strict with repeated violations
 */
export class ProgressiveRateLimiter extends RateLimiter {
  private violationCounts = new Map<string, number>();

  middleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const key = this.getKey(req);
    const violations = this.violationCounts.get(key) || 0;
    
    // Adjust limits based on violation history
    const multiplier = Math.pow(2, Math.min(violations, 5)); // Max 32x stricter
    const adjustedConfig = {
      ...this.config,
      maxRequests: Math.max(1, Math.floor(this.config.maxRequests / multiplier))
    };

    // Check if this would exceed the adjusted limit
    const now = Date.now();
    const entry = this.store.get(key);

    if (entry && now <= entry.resetTime && entry.count >= adjustedConfig.maxRequests) {
      // Increment violation count
      this.violationCounts.set(key, violations + 1);
      
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      console.log(`🚫 Progressive Rate Limit: Key=${key}, Violations=${violations + 1}, Multiplier=${multiplier}x`);

      res.status(429).json({
        error: `Rate limit exceeded. This is your ${violations + 1}th violation.`,
        retryAfter: resetIn,
        violations: violations + 1,
        multiplier
      });
      return;
    }

    // Reset violation count on successful request
    if (res.statusCode && res.statusCode < 400) {
      this.violationCounts.set(key, 0);
    }

    // Call parent middleware logic
    const parentMiddleware = RateLimiter.prototype.middleware.bind(this);
    parentMiddleware(req, res, next);
  };
}

/**
 * Cleanup expired entries periodically
 */
export const startCleanupJob = (intervalMs: number = 5 * 60 * 1000): void => {
  setInterval(() => {
    authRateLimiter.cleanup();
    passwordChangeRateLimiter.cleanup();
    generalRateLimiter.cleanup();
    dataIntensiveRateLimiter.cleanup();
    uploadRateLimiter.cleanup();
    adminRateLimiter.cleanup();
  }, intervalMs);
};

// Start cleanup job automatically
startCleanupJob();
