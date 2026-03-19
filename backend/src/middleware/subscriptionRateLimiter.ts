import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAccess: number;
}

interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;      // Don't count failed requests
}

class SubscriptionRateLimiter {
  private static store: Map<string, RateLimitEntry> = new Map();
  private static config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 30,           // Increased from 10 to 30 requests per 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  };

  /**
   * Rate limiting middleware for subscription endpoints
   */
  static middleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    const key = this.getKey(req);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = this.store.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        lastAccess: now
      };
      this.store.set(key, entry);
    }

    // Increment request count
    entry.count++;
    entry.lastAccess = now;

    // Check if rate limit exceeded
    if (entry.count > this.config.maxRequests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      
      console.log(`🚫 Rate limit exceeded for user ${user?.id} (${entry.count}/${this.config.maxRequests})`);
      
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
        limit: this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - entry.count),
        resetTime: new Date(entry.resetTime).toISOString()
      });
      return;
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });

    console.log(`✓ Rate limit check passed for user ${user?.id} (${entry.count}/${this.config.maxRequests})`);
    
    next();
  };

  /**
   * Generate rate limit key based on user and endpoint
   */
  private static getKey(req: AuthRequest): string {
    const user = req.user;
    const endpoint = req.path;
    
    if (user?.id) {
      return `subscription:${user.id}:${endpoint}`;
    }
    
    // Fallback to IP-based limiting for unauthenticated requests
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `subscription:ip:${ip}:${endpoint}`;
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.store.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }

  /**
   * Get current rate limit status for a user
   */
  static getStatus(req: AuthRequest): RateLimitEntry | null {
    const key = this.getKey(req);
    return this.store.get(key) || null;
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  static reset(req: AuthRequest): void {
    const key = this.getKey(req);
    this.store.delete(key);
    console.log(`🔄 Rate limit reset for key: ${key}`);
  }

  /**
   * Configure rate limiting settings
   */
  static configure(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ Rate limiter configuration updated:', this.config);
  }

  /**
   * Get statistics
   */
  static getStats(): {
    totalEntries: number;
    activeEntries: number;
    config: RateLimitConfig;
  } {
    const now = Date.now();
    const activeEntries = Array.from(this.store.values())
      .filter(entry => now <= entry.resetTime).length;
    
    return {
      totalEntries: this.store.size,
      activeEntries,
      config: this.config
    };
  }
}

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  SubscriptionRateLimiter.cleanup();
}, 5 * 60 * 1000);

export default SubscriptionRateLimiter;
