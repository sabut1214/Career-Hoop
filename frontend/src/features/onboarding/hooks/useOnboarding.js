import { useState, useEffect } from "react"
import { useAuth } from "@/shared/context/AuthContext"

/**
 * Hook to manage onboarding state
 * @returns {Object} Onboarding state and methods
 */
export function useOnboarding() {
  const { user } = useAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsChecking(false)
      return
    }

    // Check if user has completed onboarding
    const onboardingKey = `onboarding_completed_${user.id}`
    const completed = localStorage.getItem(onboardingKey) === "true"
    setHasCompletedOnboarding(completed)
    setIsChecking(false)
  }, [user?.id])

  const completeOnboarding = () => {
    if (!user?.id) return
    
    const onboardingKey = `onboarding_completed_${user.id}`
    localStorage.setItem(onboardingKey, "true")
    setHasCompletedOnboarding(true)
  }

  const skipOnboarding = () => {
    if (!user?.id) return
    
    const onboardingKey = `onboarding_completed_${user.id}`
    localStorage.setItem(onboardingKey, "true")
    setHasCompletedOnboarding(true)
  }

  return {
    hasCompletedOnboarding,
    isChecking,
    completeOnboarding,
    skipOnboarding,
  }
}

