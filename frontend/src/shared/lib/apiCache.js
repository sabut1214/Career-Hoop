/**
 * Simple in-memory API response cache.
 * Can be upgraded to React Query or SWR later for more advanced features.
 */

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes default
const MAX_CACHE_SIZE = 100 // Maximum number of cached entries

class ApiCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  /**
   * Gets a cached response if available and not expired.
   * @param {string} key - Cache key (usually the URL)
   * @returns {any|null} - Cached response or null
   */
  get(key) {
    const timestamp = this.timestamps.get(key)
    if (!timestamp) {
      return null
    }

    const age = Date.now() - timestamp
    const duration = this.getCacheDuration(key)

    if (age > duration) {
      // Cache expired
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Sets a cached response.
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} duration - Cache duration in milliseconds (optional)
   */
  set(key, value, duration = CACHE_DURATION) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(key)) {
      this.evictOldest()
    }

    this.cache.set(key, value)
    this.timestamps.set(key, Date.now())
    
    // Store custom duration for this key
    if (duration !== CACHE_DURATION) {
      this.timestamps.set(`${key}:duration`, duration)
    }
  }

  /**
   * Deletes a cached entry.
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
    this.timestamps.delete(`${key}:duration`)
  }

  /**
   * Clears all cached entries.
   */
  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  /**
   * Gets cache duration for a specific key.
   * @param {string} key - Cache key
   * @returns {number} - Cache duration in milliseconds
   */
  getCacheDuration(key) {
    return this.timestamps.get(`${key}:duration`) || CACHE_DURATION
  }

  /**
   * Evicts the oldest cache entry.
   */
  evictOldest() {
    if (this.timestamps.size === 0) return

    let oldestKey = null
    let oldestTime = Infinity

    for (const [key, timestamp] of this.timestamps.entries()) {
      // Skip duration entries
      if (key.includes(':duration')) continue

      if (timestamp < oldestTime) {
        oldestTime = timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  /**
   * Creates a cache key from URL and options.
   * @param {string} url - Request URL
   * @param {object} options - Request options
   * @returns {string} - Cache key
   */
  static createKey(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase()
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }
}

// Singleton instance
const apiCache = new ApiCache()

/**
 * Cached fetch wrapper that automatically caches GET requests.
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} cacheOptions - Cache options
 * @returns {Promise<Response>} - Fetch response
 */
export async function cachedFetch(url, options = {}, cacheOptions = {}) {
  const {
    cache = true,
    cacheDuration = CACHE_DURATION,
    invalidateCache = false,
  } = cacheOptions

  // Only cache GET requests by default
  const shouldCache = cache && (!options.method || options.method.toUpperCase() === 'GET')

  if (shouldCache && !invalidateCache) {
    const cacheKey = ApiCache.createKey(url, options)
    const cached = apiCache.get(cacheKey)
    
    if (cached) {
      // Return cached response as a Response-like object
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    }
  }

  // Make the actual request
  const response = await fetch(url, options)

  // Cache successful GET responses
  if (shouldCache && response.ok) {
    try {
      const data = await response.clone().json()
      const cacheKey = ApiCache.createKey(url, options)
      apiCache.set(cacheKey, { data, status: response.status }, cacheDuration)
    } catch (e) {
      // Not JSON, don't cache
    }
  }

  return response
}

/**
 * Invalidates cache for a specific URL pattern.
 * @param {string} pattern - URL pattern to match
 */
export function invalidateCache(pattern) {
  for (const key of apiCache.cache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key)
    }
  }
}

/**
 * Clears all cached data.
 */
export function clearCache() {
  apiCache.clear()
}

export default {
  cachedFetch,
  invalidateCache,
  clearCache,
  apiCache,
}

