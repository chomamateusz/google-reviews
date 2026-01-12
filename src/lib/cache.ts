import { ReviewsApiResponse } from './types';

// Simple in-memory cache
// For production with multiple serverless instances, consider using Vercel KV or Redis
interface CacheEntry {
  data: ReviewsApiResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// Default TTL: 1 hour (in milliseconds)
const DEFAULT_TTL = 60 * 60 * 1000;

export function getCachedReviews(key: string = 'reviews'): ReviewsApiResponse | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedReviews(
  data: ReviewsApiResponse,
  key: string = 'reviews',
  ttlMs: number = DEFAULT_TTL
): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Get cache stats
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
