/**
 * Error message mapping and user-friendly error handling utilities.
 * Maps technical error codes/messages to user-friendly, actionable messages.
 */

/**
 * Error code to user-friendly message mapping.
 */
const ERROR_MESSAGES = {
  // Authentication errors
  "401": "Your session has expired. Please log in again.",
  "403": "You don't have permission to perform this action.",
  "UNAUTHORIZED": "Please log in to continue.",
  "FORBIDDEN": "You don't have permission to access this resource.",
  "SESSION_EXPIRED": "Your session has expired. Please log in again.",
  "INVALID_CREDENTIALS": "Invalid email or password. Please try again.",
  "TOKEN_EXPIRED": "Your session has expired. Please log in again.",
  "MISSING_USER_CONTEXT": "Please log in to continue.",

  // Network errors
  "NETWORK_ERROR": "Unable to connect to the server. Please check your internet connection and try again.",
  "TIMEOUT": "The request took too long. Please try again.",
  "CONNECTION_REFUSED": "Unable to connect to the server. Please try again later.",
  "FAILED_TO_FETCH": "Unable to connect to the server. Please check your internet connection.",

  // Validation errors
  "VALIDATION_ERROR": "Please check your input and try again.",
  "INVALID_INPUT": "The information you provided is invalid. Please check and try again.",
  "PASSWORD_TOO_WEAK": "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
  "EMAIL_INVALID": "Please enter a valid email address.",
  "REQUIRED_FIELD": "This field is required.",

  // Resource errors
  "NOT_FOUND": "The requested resource was not found.",
  "ALREADY_EXISTS": "This resource already exists.",
  "CONFLICT": "This action conflicts with existing data. Please check and try again.",

  // Server errors
  "500": "Something went wrong on our end. Please try again later.",
  "INTERNAL_SERVER_ERROR": "An unexpected error occurred. Please try again later.",
  "SERVICE_UNAVAILABLE": "The service is temporarily unavailable. Please try again later.",

  // Rate limiting
  "TOO_MANY_REQUESTS": "Too many requests. Please wait a moment and try again.",
  "RATE_LIMIT_EXCEEDED": "You've made too many requests. Please wait a moment and try again.",

  // Generic
  "UNKNOWN_ERROR": "An unexpected error occurred. Please try again.",
}

/**
 * Extracts error message from various error formats.
 * @param {Error|Response|string|object} error - Error object, response, or error message
 * @returns {string} - User-friendly error message
 */
export function extractErrorMessage(error) {
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR
  }

  // Handle string errors
  if (typeof error === "string") {
    return getUserFriendlyMessage(error)
  }

  // Handle Response objects
  if (error instanceof Response) {
    const status = error.status
    if (status === 401) return ERROR_MESSAGES["401"]
    if (status === 403) return ERROR_MESSAGES["403"]
    if (status === 404) return ERROR_MESSAGES.NOT_FOUND
    if (status === 409) return ERROR_MESSAGES.CONFLICT
    if (status === 429) return ERROR_MESSAGES.TOO_MANY_REQUESTS
    if (status >= 500) return ERROR_MESSAGES["500"]
    return ERROR_MESSAGES.UNKNOWN_ERROR
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message || ""
    return getUserFriendlyMessage(message)
  }

  // Handle error objects with message property
  if (error && typeof error === "object") {
    if (error.message) {
      return getUserFriendlyMessage(error.message)
    }
    if (error.error) {
      return getUserFriendlyMessage(error.error)
    }
    if (error.status) {
      return extractErrorMessage({ status: error.status })
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Gets user-friendly message for a given error code or message.
 * @param {string} errorCodeOrMessage - Error code or message
 * @returns {string} - User-friendly message
 */
function getUserFriendlyMessage(errorCodeOrMessage) {
  if (!errorCodeOrMessage) {
    return ERROR_MESSAGES.UNKNOWN_ERROR
  }

  const upperMessage = errorCodeOrMessage.toUpperCase()

  // Check exact match first
  if (ERROR_MESSAGES[upperMessage]) {
    return ERROR_MESSAGES[upperMessage]
  }

  // Check for partial matches
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (upperMessage.includes(key) || key.includes(upperMessage)) {
      return message
    }
  }

  // Check for common patterns
  if (upperMessage.includes("SESSION") || upperMessage.includes("EXPIRED")) {
    return ERROR_MESSAGES.SESSION_EXPIRED
  }
  if (upperMessage.includes("AUTH") || upperMessage.includes("LOGIN") || upperMessage.includes("UNAUTHORIZED")) {
    return ERROR_MESSAGES.UNAUTHORIZED
  }
  if (upperMessage.includes("FORBIDDEN") || upperMessage.includes("PERMISSION")) {
    return ERROR_MESSAGES.FORBIDDEN
  }
  if (upperMessage.includes("NETWORK") || upperMessage.includes("FETCH") || upperMessage.includes("CONNECTION")) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  if (upperMessage.includes("VALIDATION") || upperMessage.includes("INVALID")) {
    return ERROR_MESSAGES.VALIDATION_ERROR
  }
  if (upperMessage.includes("NOT FOUND") || upperMessage.includes("404")) {
    return ERROR_MESSAGES.NOT_FOUND
  }
  if (upperMessage.includes("ALREADY EXISTS") || upperMessage.includes("CONFLICT")) {
    return ERROR_MESSAGES.ALREADY_EXISTS
  }

  // Return original message if no match found (might be user-friendly already)
  return errorCodeOrMessage
}

/**
 * Creates a standardized error response object.
 * @param {Error|Response|string|object} error - Error to process
 * @param {object} options - Additional options
 * @returns {object} - Standardized error object
 */
export function createErrorResponse(error, options = {}) {
  const {
    showDetails = false,
    includeStack = false,
    action = null,
  } = options

  const message = extractErrorMessage(error)
  const errorResponse = {
    message,
    action: action || getSuggestedAction(error),
    timestamp: new Date().toISOString(),
  }

  // Include technical details only in development or if explicitly requested
  if (showDetails || import.meta.env.DEV) {
    errorResponse.details = {
      originalError: error instanceof Error ? error.message : String(error),
      ...(includeStack && error instanceof Error && { stack: error.stack }),
    }
  }

  return errorResponse
}

/**
 * Gets suggested action based on error type.
 * @param {Error|Response|string|object} error - Error object
 * @returns {string|null} - Suggested action or null
 */
function getSuggestedAction(error) {
  if (!error) return null

  const message = typeof error === "string" 
    ? error 
    : error instanceof Error 
      ? error.message 
      : error.message || ""

  const upperMessage = message.toUpperCase()

  if (upperMessage.includes("SESSION") || upperMessage.includes("EXPIRED") || upperMessage.includes("401")) {
    return "Please log in again to continue."
  }
  if (upperMessage.includes("NETWORK") || upperMessage.includes("CONNECTION")) {
    return "Check your internet connection and try again."
  }
  if (upperMessage.includes("VALIDATION") || upperMessage.includes("INVALID")) {
    return "Please review your input and correct any errors."
  }
  if (upperMessage.includes("RATE LIMIT") || upperMessage.includes("429")) {
    return "Please wait a moment before trying again."
  }

  return null
}

/**
 * Checks if error is a network/connection error.
 * @param {Error|Response|string|object} error - Error to check
 * @returns {boolean} - True if network error
 */
export function isNetworkError(error) {
  if (!error) return false

  // Check if it's a custom NetworkError by name
  if (error instanceof Error && error.name === "NetworkError") {
    return true
  }

  // Check if it's an error object with name property
  if (error && typeof error === "object" && error.name === "NetworkError") {
    return true
  }

  // Check if it's a Response with status 0 (network error)
  if (error instanceof Response && error.status === 0) {
    return true
  }

  // Check if it's an error object with status 0
  if (error && typeof error === "object" && error.status === 0) {
    return true
  }

  const message = typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : error.message || ""

  const upperMessage = message.toUpperCase()
  return (
    upperMessage.includes("NETWORK") ||
    upperMessage.includes("FETCH") ||
    upperMessage.includes("CONNECTION") ||
    upperMessage.includes("TIMEOUT")
  )
}

/**
 * Checks if error is an authentication error.
 * @param {Error|Response|string|object} error - Error to check
 * @returns {boolean} - True if auth error
 */
export function isAuthError(error) {
  if (!error) return false

  if (error instanceof Response) {
    return error.status === 401 || error.status === 403
  }

  const message = typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : error.message || ""

  const upperMessage = message.toUpperCase()
  return (
    upperMessage.includes("SESSION") ||
    upperMessage.includes("EXPIRED") ||
    upperMessage.includes("AUTH") ||
    upperMessage.includes("UNAUTHORIZED") ||
    upperMessage.includes("FORBIDDEN") ||
    upperMessage.includes("LOGIN") ||
    upperMessage.includes("401") ||
    upperMessage.includes("403")
  )
}

export default {
  extractErrorMessage,
  createErrorResponse,
  isNetworkError,
  isAuthError,
  ERROR_MESSAGES,
}

