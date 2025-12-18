/**
 * Maps technical error messages to user-friendly messages
 * @param {string|Error} error - The error message or Error object
 * @param {string} [context] - Optional context about where the error occurred
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyError(error, context = "") {
  if (!error) {
    return "Something went wrong. Please try again."
  }

  const errorMessage = typeof error === "string" ? error : error?.message || error?.toString() || ""
  const lowerMessage = errorMessage.toLowerCase()

  // Network/Connection errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("failed to fetch") ||
    errorMessage.includes("ERR_NETWORK")
  ) {
    return "Connection issue. Please check your internet connection and try again."
  }

  // Python service errors
  if (
    lowerMessage.includes("python service") ||
    lowerMessage.includes("port 8000") ||
    lowerMessage.includes("service not available") ||
    lowerMessage.includes("service temporarily unavailable")
  ) {
    return "We're having trouble generating recommendations right now. Please try again in a few minutes."
  }

  // Authentication errors
  if (
    lowerMessage.includes("401") ||
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("token") ||
    lowerMessage.includes("authentication")
  ) {
    return "Your session has expired. Please log in again."
  }

  // Permission errors
  if (
    lowerMessage.includes("403") ||
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("permission") ||
    lowerMessage.includes("access denied")
  ) {
    return "You don't have permission to perform this action."
  }

  // Not found errors
  if (
    lowerMessage.includes("404") ||
    lowerMessage.includes("not found") ||
    lowerMessage.includes("does not exist")
  ) {
    return "The requested resource was not found."
  }

  // Server errors
  if (
    lowerMessage.includes("500") ||
    lowerMessage.includes("internal server error") ||
    lowerMessage.includes("server error")
  ) {
    return "Our servers are experiencing issues. Please try again later."
  }

  // Timeout errors
  if (
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("timed out") ||
    lowerMessage.includes("request timeout")
  ) {
    return "The request took too long. Please try again."
  }

  // Validation errors
  if (
    lowerMessage.includes("validation") ||
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("bad request") ||
    lowerMessage.includes("400")
  ) {
    return "Please check your input and try again."
  }

  // Rate limiting
  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests") ||
    lowerMessage.includes("429")
  ) {
    return "Too many requests. Please wait a moment and try again."
  }

  // Generic fallback - return original message if it's already user-friendly
  // Otherwise provide a generic message
  if (errorMessage.length < 100 && !errorMessage.includes("http") && !errorMessage.includes("error:")) {
    return errorMessage
  }

  // Default fallback
  return context
    ? `${context} Please try again.`
    : "Something went wrong. Please try again."
}

/**
 * Gets a user-friendly error message for recommendation errors specifically
 */
export function getRecommendationError(error) {
  return getUserFriendlyError(error, "We're having trouble generating recommendations right now.")
}

/**
 * Gets a user-friendly error message for API errors
 */
export function getApiError(error) {
  return getUserFriendlyError(error, "We're having trouble connecting to our servers.")
}

