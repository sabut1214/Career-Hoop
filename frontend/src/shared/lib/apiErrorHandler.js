/**
 * Unified API error handler for consistent error processing across the application.
 */

import { extractErrorMessage, createErrorResponse, isNetworkError, isAuthError } from "@/shared/utils/errorMessages"
import { logger } from "@/shared/lib/utils/logger"

/**
 * Handles API errors and returns a standardized error object.
 * @param {Response|Error|string} error - Error to handle
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Standardized error response
 */
export async function handleApiError(error, options = {}) {
  const {
    showDetails = false,
    includeStack = false,
    throwError = false,
  } = options

  let errorResponse

  // Handle Response objects
  if (error instanceof Response) {
    try {
      const errorData = await error.json().catch(() => ({}))
      errorResponse = createErrorResponse(
        errorData.message || errorData.error || error,
        { showDetails, includeStack }
      )
      errorResponse.status = error.status
      errorResponse.statusText = error.statusText
    } catch (e) {
      errorResponse = createErrorResponse(error, { showDetails, includeStack })
      errorResponse.status = error.status
    }
  } else {
    // Handle Error objects or strings
    errorResponse = createErrorResponse(error, { showDetails, includeStack })
  }

  // Log error for debugging
  logger.error("API Error:", errorResponse)

  // Add additional context
  if (isNetworkError(error)) {
    errorResponse.type = "network"
  } else if (isAuthError(error)) {
    errorResponse.type = "authentication"
  } else {
    errorResponse.type = "server"
  }

  if (throwError) {
    const apiError = new Error(errorResponse.message)
    apiError.response = errorResponse
    throw apiError
  }

  return errorResponse
}

/**
 * Wraps an API call with standardized error handling.
 * @param {Function} apiCall - Async function that makes an API call
 * @param {object} options - Error handling options
 * @returns {Promise} - Result of API call or error response
 */
export async function withErrorHandling(apiCall, options = {}) {
  try {
    return await apiCall()
  } catch (error) {
    return handleApiError(error, options)
  }
}

export default {
  handleApiError,
  withErrorHandling,
  extractErrorMessage,
  isNetworkError,
  isAuthError,
}

