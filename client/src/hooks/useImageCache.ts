import { useState, useCallback, useRef } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
  size: number;
}

interface UseImageCacheOptions {
  maxCacheSize?: number;
  maxAge?: number;
}

export function useImageCache({ maxCacheSize = 100, maxAge = 30 * 60 * 1000 }: UseImageCacheOptions = {}) {
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const [cacheStats, setCacheStats] = useState({ size: 0, memoryUsage: 0 });

  const cleanExpiredEntries = useCallback(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    cache.current.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      cache.current.delete(key);
    });

    return expiredKeys.length;
  }, [maxAge]);

  const cleanOldestEntries = useCallback(() => {
    if (cache.current.size <= maxCacheSize) return 0;

    const entries = Array.from(cache.current.entries());
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const entriesToRemove = entries.slice(0, cache.current.size - maxCacheSize);
    entriesToRemove.forEach(([key]) => {
      cache.current.delete(key);
    });

    return entriesToRemove.length;
  }, [maxCacheSize]);

  const updateStats = useCallback(() => {
    const memoryUsage = Array.from(cache.current.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    setCacheStats({
      size: cache.current.size,
      memoryUsage
    });
  }, []);

  const getCachedImage = useCallback((key: string): string | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > maxAge) {
      cache.current.delete(key);
      return null;
    }

    return entry.url;
  }, [maxAge]);

  const setCachedImage = useCallback((key: string, url: string, estimatedSize: number = 50000) => {
    // Clean expired entries first
    cleanExpiredEntries();
    
    // Clean oldest entries if needed
    cleanOldestEntries();
    
    cache.current.set(key, {
      url,
      timestamp: Date.now(),
      size: estimatedSize
    });

    updateStats();
  }, [cleanExpiredEntries, cleanOldestEntries, updateStats]);

  const clearCache = useCallback(() => {
    cache.current.clear();
    updateStats();
  }, [updateStats]);

  const getCacheKey = useCallback((src: string, size: number, quality: number): string => {
    return `${src}_${size}_${quality}`;
  }, []);

  return {
    getCachedImage,
    setCachedImage,
    clearCache,
    getCacheKey,
    cacheStats
  };
}