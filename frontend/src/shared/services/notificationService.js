import api from "./api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("authToken")
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  
  if (user?.id) {
    headers["X-User-Id"] = user.id
  }
  
  if (user?.role) {
    headers["X-User-Role"] = user.role
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const notificationService = {
  // Get email preferences
  getEmailPreferences: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/notifications/email-preferences`)
  },

  // Update email preferences
  updateEmailPreferences: async (userId, preferences) => {
    return fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/notifications/email-preferences`, {
      method: "PUT",
      body: JSON.stringify(preferences),
    })
  },

  // Send test email
  sendTestEmail: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/notifications/test`, {
      method: "POST",
    })
  },
}

export default notificationService

