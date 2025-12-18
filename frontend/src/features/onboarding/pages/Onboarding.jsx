import { OnboardingWizard } from "../components/OnboardingWizard"
import { ProtectedRoute } from "@/shared/components/protected-route"

export default function Onboarding() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <OnboardingWizard />
      </div>
    </ProtectedRoute>
  )
}

