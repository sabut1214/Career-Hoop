/**
 * Logger utility that disables logging in production builds.
 * Prevents sensitive data from being exposed in production console.
 */

const isDev = import.meta.env.DEV
const isProduction = import.meta.env.PROD
const debugEnabled =
  isDev &&
  (import.meta.env.VITE_DEBUG_LOGS === "true" ||
    (typeof window !== "undefined" && window?.localStorage?.getItem("DEBUG_LOGS") === "true"))

/**
 * Logger object that conditionally logs based on environment.
 * In production, all logging methods are no-ops to prevent data exposure.
 */
export const logger = {
  /**
   * Logs informational messages (development only).
   * @param {...any} args - Arguments to log
   */
  log: isDev ? (...args) => console.log(...args) : () => {},

  /**
   * Logs error messages (always enabled for debugging production issues).
   * Note: Be careful not to log sensitive data even in errors.
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    // Always log errors, but sanitize sensitive data
    const sanitizedArgs = args.map(arg => sanitizeLogData(arg))
    console.error(...sanitizedArgs)
  },

  /**
   * Logs warning messages (development only).
   * @param {...any} args - Arguments to log
   */
  warn: isDev ? (...args) => {
    const sanitizedArgs = args.map(arg => sanitizeLogData(arg))
    console.warn(...sanitizedArgs)
  } : () => {},

  /**
   * Logs info messages (development only).
   * @param {...any} args - Arguments to log
   */
  info: isDev ? (...args) => {
    const sanitizedArgs = args.map(arg => sanitizeLogData(arg))
    console.info(...sanitizedArgs)
  } : () => {},

  /**
   * Logs debug messages (development only).
   * @param {...any} args - Arguments to log
   */
  debug: debugEnabled ? (...args) => {
    const sanitizedArgs = args.map(arg => sanitizeLogData(arg))
    console.debug(...sanitizedArgs)
  } : () => {},
}

/**
 * Sanitizes log data to remove sensitive information.
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
function sanitizeLogData(data) {
  if (data === null || data === undefined) {
    return data
  }

  // Handle strings
  if (typeof data === "string") {
    // Remove potential tokens, passwords, secrets
    return data
      .replace(/password["\s:=]+[^,\s}]+/gi, 'password: [REDACTED]')
      .replace(/token["\s:=]+[^,\s}]+/gi, 'token: [REDACTED]')
      .replace(/secret["\s:=]+[^,\s}]+/gi, 'secret: [REDACTED]')
      .replace(/api[_-]?key["\s:=]+[^,\s}]+/gi, 'api_key: [REDACTED]')
      .replace(/authorization["\s:=]+[^,\s}]+/gi, 'authorization: [REDACTED]')
  }

  // Handle objects
  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeLogData(item))
    }

    // Create a sanitized copy
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      
      // Redact sensitive fields
      if (lowerKey.includes("password") || 
          lowerKey.includes("token") || 
          lowerKey.includes("secret") ||
          lowerKey.includes("api") && lowerKey.includes("key") ||
          lowerKey.includes("authorization") ||
          lowerKey.includes("auth")) {
        sanitized[key] = "[REDACTED]"
      } else {
        sanitized[key] = sanitizeLogData(value)
      }
    }
    return sanitized
  }

  return data
}

/**
 * Creates a scoped logger with a prefix.
 * Useful for module-specific logging.
 * @param {string} scope - Scope/prefix for log messages
 * @returns {object} - Scoped logger instance
 */
export function createLogger(scope) {
  return {
    log: (...args) => logger.log(`[${scope}]`, ...args),
    error: (...args) => logger.error(`[${scope}]`, ...args),
    warn: (...args) => logger.warn(`[${scope}]`, ...args),
    info: (...args) => logger.info(`[${scope}]`, ...args),
    debug: (...args) => logger.debug(`[${scope}]`, ...args),
  }
}

export default logger

