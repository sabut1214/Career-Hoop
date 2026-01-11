// src/utils.js
export function createPageUrl(pageName) {
  return `/${pageName}`;
}

/**
 * Get user-specific localStorage key
 * @param {string} baseKey - Base key name (e.g., "aiGradesAnalysis")
 * @param {string|null|undefined} userId - User ID from auth context
 * @returns {string} User-specific key
 */
export function getUserStorageKey(baseKey, userId) {
  if (!userId) {
    // Fallback to generic key if no user ID (for backward compatibility during migration)
    return baseKey;
  }
  return `${baseKey}_${userId}`;
}

/**
 * Clear all user-specific data from localStorage
 * This should be called on logout or when switching users
 * NOTE: Marksheet data (aiGradesAnalyses_*) and interests (userInterests_*) are NOT cleared 
 * to preserve them across sessions. They are stored in the backend and will be reloaded on login.
 */
export function clearUserData() {
  // Clear old generic keys (for backward compatibility)
  localStorage.removeItem("aiGradesAnalysis");
  localStorage.removeItem("userInterests");
  
  // Clear user-specific keys by pattern
  // NOTE: We do NOT clear marksheet data (aiGradesAnalyses_*, aiGradesCurrentId_*) 
  // or interests (userInterests_*) to preserve them across logout/login sessions.
  // Both are stored in the backend and will be reloaded on login.
  // This is intentionally left empty - we preserve user data in localStorage
}