"use client"

import { useAuth } from "../context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
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
