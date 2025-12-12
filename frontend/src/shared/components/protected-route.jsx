"use client"

import { useAuth } from "@/shared/context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"
import { getUserProfile } from "@/shared/lib/api"
import { useState, useEffect } from "react"

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, updateUser } = useAuth()
  const location = useLocation()
  const [isVerifying, setIsVerifying] = useState(false)

  // Verify user role from backend for admin pages (security check)
  useEffect(() => {
    const verifyAdminRole = async () => {
      if (!loading && user && requiredRole === "admin" && user.id) {
        // Double-check admin role from backend for security
        try {
          setIsVerifying(true)
          const userProfile = await getUserProfile(user.id)
          if (userProfile && userProfile.role) {
            // Update user if role changed
            if (userProfile.role !== user.role) {
              updateUser({ ...user, role: userProfile.role })
            }
          }
        } catch (error) {
          // If verification fails, don't block - let the role check handle it
          // Authentication is handled by cookies, backend will reject if invalid
        } finally {
          setIsVerifying(false)
        }
      }
    }

    if (!loading && user && requiredRole === "admin") {
      verifyAdminRole()
    }
  }, [loading, user, requiredRole, updateUser])

  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isVerifying ? "Verifying permissions..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Role check - case-insensitive and strict
  if (requiredRole) {
    const userRole = user.role?.toLowerCase()
    const requiredRoleLower = requiredRole.toLowerCase()
    
    if (!userRole || userRole !== requiredRoleLower) {
      // If user doesn't have required role, redirect to login
      return <Navigate to="/login" replace state={{ from: location, reason: "insufficient_permissions" }} />
    }
  }

  return children
}
