"use client"

import { useAuth } from "@/shared/context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"
import { getUserProfile } from "@/shared/lib/api"
import { useState, useEffect } from "react"
import { Spinner } from "@/shared/components/ui/spinner"

export function ProtectedRoute({ children, requiredRole = null, fullScreen = true }) {
  const { user, loading, updateUser } = useAuth()
  const location = useLocation()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationFailed, setVerificationFailed] = useState(false)

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
          // Fail closed for admin routes if verification fails
          setVerificationFailed(true)
        } finally {
          setIsVerifying(false)
        }
      }
    }

    if (!loading && user && requiredRole === "admin") {
      setVerificationFailed(false)
      verifyAdminRole()
    }
  }, [loading, user, requiredRole, updateUser])

  if (loading || isVerifying) {
    const heightClass = fullScreen ? "min-h-screen" : "min-h-[60vh]"
    return (
      <div className={`flex items-center justify-center ${heightClass}`}>
        <div className="text-center text-muted-foreground">
          <Spinner className="mx-auto mb-3 h-6 w-6" />
          <p className="text-sm">
            {isVerifying ? "Verifying permissions..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole === "admin" && verificationFailed) {
    return <Navigate to="/login" replace state={{ from: location, reason: "verification_failed" }} />
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
