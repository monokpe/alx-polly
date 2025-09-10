import { AUTH } from '../config/constants';

type RateLimitEntry = {
  count: number;
  windowStart: number; // timestamp (ms) when the current window started
};

class RateLimiter {
  private cache: Map<string, RateLimitEntry>;
  
  constructor() {
    this.cache = new Map();
  }
  
  isLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.cache.get(key);
    const windowMs = AUTH.RATE_LIMIT.WINDOW;
    const currentWindowStart = now - (now % windowMs);

    if (!entry) {
      this.cache.set(key, { count: 1, windowStart: currentWindowStart });
      return false;
    }

    // If the stored windowStart is outside the current window, reset
    if (now - entry.windowStart > windowMs) {
      this.cache.set(key, { count: 1, windowStart: currentWindowStart });
      return false;
    }

    return entry.count >= AUTH.RATE_LIMIT.MAX_ATTEMPTS;
  }

  increment(key: string): void {
    const now = Date.now();
    const entry = this.cache.get(key);
    const windowMs = AUTH.RATE_LIMIT.WINDOW;
    const currentWindowStart = now - (now % windowMs);

    if (!entry || now - entry.windowStart > windowMs) {
      this.cache.set(key, { count: 1, windowStart: currentWindowStart });
      return;
    }

    this.cache.set(key, {
      count: entry.count + 1,
      windowStart: entry.windowStart
    });
  }

  reset(key: string): void {
    this.cache.delete(key);
  }
      return false;
    }

    // We're in the same window: increment count and check limit
    entry.count++;
    this.cache.set(key, entry);
    return entry.count > AUTH.RATE_LIMIT.MAX_ATTEMPTS;
  }
  
  reset(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
