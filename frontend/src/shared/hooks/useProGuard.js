"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/shared/context/AuthContext"

export function useProGuard() {
  const { isPro } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const guard = (action) => {
    if (!isPro()) {
      // Store intended destination
      const currentPath = location.pathname + (location.search || "")
      if (currentPath !== "/checkout/pro" && currentPath !== "/billing") {
        sessionStorage.setItem("intendedDestination", currentPath)
      }
      // Redirect to billing/plan selection page
      navigate("/billing", { replace: true })
      return false
    }
    
    // If Pro, execute the action
    if (typeof action === "function") {
      action()
    }
    return true
  }

  return {
    guard,
    isPro: isPro(),
  }
}
