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
    // compute the current window start aligned to the configured window length
    const windowMs = AUTH.RATE_LIMIT.WINDOW;
    const currentWindowStart = now - (now % windowMs);

    if (!entry) {
      // initialize with windowStart aligned to current window
      this.cache.set(key, { count: 1, windowStart: currentWindowStart });
      return false;
    }

    // If the stored windowStart is outside the current window, reset
    if (now - entry.windowStart > windowMs) {
      this.cache.set(key, { count: 1, windowStart: currentWindowStart });
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
