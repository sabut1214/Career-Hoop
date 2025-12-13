"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { clearUserData } from "@/shared/utils/utils"
import { refreshAccessToken, logout as apiLogout } from "@/shared/lib/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (cookies handle authentication)
    const storedUser = localStorage.getItem("user")
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        
        // Validate user data has required fields
        if (parsedUser.role && parsedUser.id) {
          // Use stored user data immediately to avoid blocking UI
          setUser(parsedUser)
          setLoading(false)
          
          // Attempt refresh in background (non-blocking)
          // This won't cause errors if backend is unavailable due to our caching
          refreshAccessToken()
            .then((result) => {
              // If refresh succeeds, update user data
              if (result && typeof result === 'object' && result.user) {
                setUser(result.user)
              }
              // If result is null (backend unavailable), keep using stored user data
            })
            .catch(() => {
              // Silently ignore errors - we're already using stored user data
            })
        } else {
          // Invalid user data, clear it
          localStorage.removeItem("user")
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        // Failed to parse user data, clear it
        localStorage.removeItem("user")
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const logout = async () => {
    // Clear all user-specific data before logging out
    clearUserData()
    setUser(null)
    localStorage.removeItem("user")
    
    // Call backend logout to revoke refresh token
    try {
      await apiLogout()
    } catch (error) {
      // Silently fail - logout should proceed even if API call fails
    }
  }

  const updateUser = (userData) => {
    const previousUserId = user?.id
    const newUserId = userData?.id
    
    // If user ID changed, clear old user's data
    if (previousUserId && newUserId && previousUserId !== newUserId) {
      clearUserData()
    }
    
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const login = (userData) => {
    // Clear any existing user data when logging in (prevents data leakage between users)
    clearUserData()
    setUser(userData)
    // Only store user data - tokens are in httpOnly cookies
    localStorage.setItem("user", JSON.stringify(userData))
  }

  return <AuthContext.Provider value={{ user, loading, logout, updateUser, login }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
