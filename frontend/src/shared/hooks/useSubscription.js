"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/shared/context/AuthContext"
import { fetchWithAuth } from "@/shared/lib/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
const normalizedApiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`

export function useSubscription() {
  const { user, isPro: isProFromAuth } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null)
      setLoading(false)
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`${normalizedApiUrl}/subscription/me`, {
        method: "GET",
      })

      if (!response.ok) {
        // If 401/403 and token refresh is in progress, wait a bit and retry
        if ((response.status === 401 || response.status === 403) && window._refreshInProgress) {
          // Wait for refresh to complete, then retry once
          try {
            await window._refreshInProgress
            // Small delay to ensure token is stored
            await new Promise(resolve => setTimeout(resolve, 100))
            const retryResponse = await fetchWithAuth(`${normalizedApiUrl}/subscription/me`, {
              method: "GET",
            })
            if (retryResponse.ok) {
              const data = await retryResponse.json()
              setSubscription(data)
              return data
            }
          } catch (retryErr) {
            // Retry failed, fall through to fallback
          }
        }
        
        // If subscription endpoint fails, fall back to auth context
        const isPro = isProFromAuth()
        setSubscription({
          plan: isPro ? "PRO" : "FREE",
          isPro,
          activeUntil: null,
        })
        setLoading(false)
        return null
      }

      const data = await response.json()
      setSubscription(data)
      return data
    } catch (err) {
      // Only log error if it's not a network error or auth error that's being handled
      if (err.name !== "NetworkError" && !err.message?.includes("401") && !err.message?.includes("403")) {
        console.error("Failed to fetch subscription:", err)
      }
      setError(err)
      // Fall back to auth context
      const isPro = isProFromAuth()
      setSubscription({
        plan: isPro ? "PRO" : "FREE",
        isPro,
        activeUntil: null,
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.id, isProFromAuth])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const isPro = subscription?.isPro ?? isProFromAuth()
  const isAuthenticated = !!user

  return {
    isAuthenticated,
    isPro,
    loading,
    subscription,
    error,
    refreshSubscription: fetchSubscription,
  }
}
