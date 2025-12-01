"use client"

import { useAuth } from "@/context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"
import { refreshAccessToken } from "@/lib/api"
import { useState, useEffect } from "react"

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check if token is expired
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
    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem("authToken")
      const refreshToken = localStorage.getItem("refreshToken")

      if (token && isTokenExpired(token)) {
        if (refreshToken) {
          setIsRefreshing(true)
          try {
            await refreshAccessToken()
          } catch (error) {
            // Refresh failed, tokens will be cleared by refreshAccessToken
            console.error("Token refresh failed:", error)
          } finally {
            setIsRefreshing(false)
          }
        } else {
          // No refresh token, clear everything
          localStorage.removeItem("authToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
        }
      }
    }

    if (!loading) {
      checkAndRefreshToken()
    }
  }, [loading])

  if (loading || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole && user.role !== requiredRole) {
    const fallback = requiredRole === "admin" ? "/dashboard" : "/admin"
    return <Navigate to={fallback} replace />
  }

  return children
}
