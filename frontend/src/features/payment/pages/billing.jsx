import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PlanCard } from "@/features/payment/componenets/plan"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { useAuth } from "@/shared/context/AuthContext"
import { Skeleton } from "@/shared/components/ui/skeleton"

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Get started with your career journey",
    features: [
      "Basic career recommendations",
      "Interest assessment",
      "Basic college search",
      "Limited training modules",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 500,
    description: "Full access to all premium features",
    features: [
      "All Free features",
      "Advanced career matching",
      "Unlimited training modules",
      "Priority support",
      "Personalized guidance",
      "Advanced analytics",
    ],
  },
]

export default function BillingPage() {
  const navigate = useNavigate()
  const { user, getPlan, isPro } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const currentPlan = getPlan()
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  const selectedPlanData = useMemo(() => plans.find((p) => p.id === selectedPlan) || null, [selectedPlan])

  const handlePlanSelect = (planId) => {
    if (planId === "PRO" && !isPro()) {
      setSelectedPlan(planId)
      navigate("/checkout/pro")
    } else if (planId === "FREE") {
      setSelectedPlan(planId)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Plans</h1>
          <p className="text-muted-foreground">Choose the perfect plan for your career journey</p>
        </div>

        {/* Current Plan Card */}
        {currentPlan === "PRO" && (
          <Card className="p-6 mb-8 bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40">
            <h2 className="font-semibold text-foreground mb-1">Current Plan</h2>
            <p className="text-primary dark:text-primary text-lg font-bold">Pro</p>
          </Card>
        )}

        {isInitialLoading && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id
            const isProPlan = plan.id === "PRO"
            const showUpgrade = isProPlan && !isPro()
            
            return (
              <div key={plan.id} className="relative">
                {isProPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full z-10">
                    RECOMMENDED
                  </div>
                )}
                <PlanCard
                  name={plan.name}
                  price={plan.price}
                  currency="NPR"
                  description={plan.description}
                  features={plan.features}
                  isSelected={selectedPlan === plan.id}
                  isCurrentPlan={isCurrent}
                  onSelect={() => handlePlanSelect(plan.id)}
                  buttonText={
                    isCurrent
                      ? "Current Plan"
                      : isProPlan
                      ? "Upgrade"
                      : "Continue"
                  }
                />
              </div>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-8 bg-muted/30">
          <h3 className="text-lg font-bold text-foreground mb-2">Payment Information</h3>
          <p className="text-sm text-muted-foreground">
            Pro plan payments are processed securely through eSewa. You will be redirected to eSewa's secure payment page to complete your purchase.
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            className="bg-transparent px-8 flex-1 sm:flex-none"
            size="lg"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
