"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { clearUserData } from "@/utils/utils"
import { refreshAccessToken } from "@/lib/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if token is expired (client-side check)
  const isTokenExpired = (token) => {
    if (!token) return true
    
    try {
      const parts = token.split(".")
      if (parts.length !== 3) return true
      const payload = JSON.parse(atob(parts[1]))
      const exp = payload.exp * 1000
      return Date.now() >= exp
    } catch (error) {
      return true
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("authToken")
    const storedRefreshToken = localStorage.getItem("refreshToken")
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (!parsedUser.role) {
          parsedUser.role = "student"
        }
        
        // Check if access token is expired
        if (storedToken && isTokenExpired(storedToken)) {
          // Try to refresh token if refresh token exists
          if (storedRefreshToken) {
            refreshAccessToken()
              .then(() => {
                setUser(parsedUser)
                setLoading(false)
              })
              .catch(() => {
                // Refresh failed, clear everything
                localStorage.removeItem("user")
                localStorage.removeItem("authToken")
                localStorage.removeItem("refreshToken")
                setUser(null)
                setLoading(false)
              })
            return
          } else {
            // No refresh token, clear everything
            localStorage.removeItem("user")
            localStorage.removeItem("authToken")
            localStorage.removeItem("refreshToken")
            setUser(null)
            setLoading(false)
            return
          }
        }
        
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
        localStorage.removeItem("refreshToken")
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    // Clear all user-specific data before logging out
    clearUserData()
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
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

  const login = (userData, token, refreshToken = null) => {
    // Clear any existing user data when logging in (prevents data leakage between users)
    clearUserData()
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("authToken", token)
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken)
    }
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
