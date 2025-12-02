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
 */
export function clearUserData() {
  // Clear old generic keys (for backward compatibility)
  localStorage.removeItem("aiGradesAnalysis");
  localStorage.removeItem("userInterests");
  
  // Clear all user-specific keys by pattern
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("aiGradesAnalysis_") || key.startsWith("userInterests_"))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}