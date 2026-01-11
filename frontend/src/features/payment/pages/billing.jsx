import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PlanCard } from "@/features/payment/componenets/plan"
import { OrderSummary } from "@/features/payment/componenets/order"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Smartphone } from "lucide-react"
import { useAuth } from "@/shared/context/AuthContext"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EsewaPayButton } from "@/features/payment/components/EsewaPayButton"

const plans = [
  {
    id: "BASIC",
    name: "Basic",
    price: 5000,
    description: "Get started with your career journey",
    features: ["Career recommendations", "Interest assessment", "Basic college search"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 11000,
    description: "Full access to all features",
    features: [
      "All Basic features",
      "Advanced career matching",
      "Skill training modules",
      "Priority support",
      "Personalized guidance",
    ],
  },
]

export default function BillingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentPlan, setCurrentPlan] = useState("FREE") // Default to FREE, can be updated from user data
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  // Fetch user's current plan if available
  useEffect(() => {
    // TODO: Fetch user's subscription/plan from API when available
    // For now, defaulting to FREE
    if (user?.plan || user?.subscription) {
      setCurrentPlan(user.plan || user.subscription || "FREE")
    }
  }, [user])

  const selectedPlanData = useMemo(() => plans.find((p) => p.id === selectedPlan) || null, [selectedPlan])
  const upgradeAmount = null

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Plans</h1>
          <p className="text-muted-foreground">Choose the perfect plan for your career journey</p>
        </div>

        {/* Current Plan Card */}
        {currentPlan !== "FREE" && (
          <Card className="p-6 mb-8 bg-success/10 dark:bg-success/20 border-success/30 dark:border-success/40">
            <h2 className="font-semibold text-foreground mb-1">Current Plan</h2>
            <p className="text-success dark:text-success text-lg font-bold">{currentPlan}</p>
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

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Plan Cards */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  isSelected={selectedPlan === plan.id}
                  isCurrentPlan={currentPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                  buttonText={currentPlan === plan.id ? "Current Plan" : "Select Plan"}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            {selectedPlanData ? (
              <OrderSummary
                selectedPlan={selectedPlanData.name}
                selectedPrice={selectedPlanData.price}
                currentPlan={currentPlan}
                upgradeAmount={upgradeAmount || undefined}
              />
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <p>Select a plan to see the summary</p>
              </Card>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Payment Method</h3>
          <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="w-12 h-12 rounded bg-success flex items-center justify-center text-success-foreground">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">eSewa</p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to eSewa to complete the payment securely
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          {selectedPlanData ? (
            <EsewaPayButton
              amount={selectedPlanData.price}
              orderId={selectedPlanData.id}
              className="bg-success hover:bg-success/90 text-success-foreground px-8 flex-1 sm:flex-none"
            />
          ) : (
            <Button
              disabled
              className="bg-success hover:bg-success/90 text-success-foreground px-8 flex-1 sm:flex-none"
              size="lg"
            >
              Pay with eSewa
            </Button>
          )}
          <Button variant="outline" className="bg-transparent px-8 flex-1 sm:flex-none" size="lg" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
