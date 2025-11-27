"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { clearUserData } from "@/utils/utils"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("authToken")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (!parsedUser.role) {
          parsedUser.role = "student"
        }
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
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

  const login = (userData, token) => {
    // Clear any existing user data when logging in (prevents data leakage between users)
    clearUserData()
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("authToken", token)
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
