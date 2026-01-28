"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/shared/context/AuthContext"
import { useSubscription } from "@/shared/hooks/useSubscription"
import { Spinner } from "@/shared/components/ui/spinner"
import { ProPaywallModal } from "@/features/payment/components/ProPaywallModal"

export function RequirePro({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { isPro, loading: subscriptionLoading } = useSubscription()
  const navigate = useNavigate()
  const location = useLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const hasOpenedModalRef = useRef(false)

  // Store intended destination when blocked
  useEffect(() => {
    if (!authLoading && !subscriptionLoading && user) {
      if (!isPro) {
        const currentPath = location.pathname + (location.search || "")
        if (currentPath !== "/checkout/pro" && currentPath !== "/billing") {
          sessionStorage.setItem("postUpgradeRedirect", currentPath)
        }
        // Auto-open modal once
        if (!hasOpenedModalRef.current) {
          hasOpenedModalRef.current = true
          setModalOpen(true)
        }
      }
    }
  }, [authLoading, subscriptionLoading, user, isPro, location])

  const loading = authLoading || subscriptionLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          <Spinner className="mx-auto mb-3 h-6 w-6" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login if not authenticated
    navigate("/login", { replace: true, state: { from: location } })
    return null
  }

  if (!isPro) {
    return (
      <>
        <ProPaywallModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  return children
}
