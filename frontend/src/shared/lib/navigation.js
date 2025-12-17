/**
 * Navigation utility for programmatic navigation
 * Provides a centralized way to navigate without direct access to useNavigate hook
 * Useful for class components and utility functions
 */

let navigateRef = null

/**
 * Sets the navigate function reference from react-router-dom
 * Should be called once in App.jsx after Router is initialized
 */
export const setNavigateRef = (navigate) => {
  navigateRef = navigate
}

/**
 * Navigate to a path programmatically
 * Falls back to window.location.href if navigate ref is not available
 * 
 * @param {string} path - The path to navigate to
 * @param {object} options - Navigation options (replace, state, etc.)
 */
export const navigate = (path, options = {}) => {
  if (navigateRef) {
    if (options.replace) {
      navigateRef(path, { replace: true, ...options })
    } else {
      navigateRef(path, options)
    }
  } else {
    // Fallback for cases where navigate isn't available (e.g., outside Router context)
    // Use pathname instead of href to maintain SPA behavior where possible
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.location.href = path
    } else {
      window.location.pathname = path
    }
  }
}

/**
 * Navigate back in history
 */
export const navigateBack = () => {
  if (navigateRef) {
    navigateRef(-1)
  } else {
    window.history.back()
  }
}

/**
 * Navigate forward in history
 */
export const navigateForward = () => {
  if (navigateRef) {
    navigateRef(1)
  } else {
    window.history.forward()
  }
}

