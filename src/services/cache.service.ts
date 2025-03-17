/**
 * Cache service for the backend
 */

import { Injectable } from '@nestjs/common';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Gets a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Sets a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttlMs Time to live in milliseconds
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Removes a value from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clears all values from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Gets a value from the cache or sets it if not found
   * @param key The cache key
   * @param factory Function to create the value if not in cache
   * @param ttlMs Time to live in milliseconds
   * @returns The cached or newly created value
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs: number): Promise<T> {
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }
}
