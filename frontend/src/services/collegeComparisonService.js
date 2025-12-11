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

export const collegeComparisonService = {
  // Create a new comparison
  createComparison: async (collegeIds) => {
    if (!collegeIds || collegeIds.length === 0) {
      throw new Error("At least one college ID is required")
    }
    if (collegeIds.length > 5) {
      throw new Error("Maximum 5 colleges can be compared")
    }
    
    return fetchWithAuth(`${API_BASE_URL}/api/colleges/compare`, {
      method: "POST",
      body: JSON.stringify({ collegeIds }),
    })
  },

  // Get a comparison by ID
  getComparison: async (comparisonId) => {
    return fetchWithAuth(`${API_BASE_URL}/api/colleges/compare/${comparisonId}`)
  },

  // Get all comparisons for the current user
  getUserComparisons: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/api/colleges/compare/user/${userId}`)
  },

  // Delete a comparison
  deleteComparison: async (comparisonId) => {
    return fetchWithAuth(`${API_BASE_URL}/api/colleges/compare/${comparisonId}`, {
      method: "DELETE",
    })
  },
}

export default collegeComparisonService

