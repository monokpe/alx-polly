import { AUTH } from '../config/constants';

type RateLimitEntry = {
  count: number;
  last: number;
};

class RateLimiter {
  private cache: Map<string, RateLimitEntry>;
  
  constructor() {
    this.cache = new Map();
  }
  
  isLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.cache.set(key, { count: 1, last: now });
      return false;
    }
    
    if (now - entry.last > AUTH.RATE_LIMIT.WINDOW) {
      this.cache.set(key, { count: 1, last: now });
      return false;
    }
    
    if (entry.count >= AUTH.RATE_LIMIT.MAX_ATTEMPTS) {
      return true;
    }
    
    entry.count++;
    entry.last = now;
    this.cache.set(key, entry);
    return false;
  }
  
  reset(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
