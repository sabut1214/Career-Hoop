import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlanCard } from "@/features/payment/componenets/plan"
import { OrderSummary } from "@/features/payment/componenets/order"
import { EsewaRedirectForm } from "@/features/payment/componenets/esewa-form"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Loader2, Smartphone } from "lucide-react"
import { initiateEsewaPayment } from "@/shared/lib/api"

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
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentPlan] = useState("FREE")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentInit, setPaymentInit] = useState(null)

  const selectedPlanData = useMemo(() => plans.find((p) => p.id === selectedPlan) || null, [selectedPlan])
  const upgradeAmount = null

  const handlePayment = async () => {
    if (!selectedPlanData) return

    setIsLoading(true)
    setError(null)
    try {
      const result = await initiateEsewaPayment({
        amount: selectedPlanData.price,
        purpose: selectedPlanData.id,
      })

      setPaymentInit({
        pid: result?.pid || null,
        paymentUrl: result?.paymentUrl || null,
        fields: result?.fields || {},
      })
    } catch (error) {
      console.error("Payment error:", error)
      setError(error?.message || "Payment creation failed")
    }
    setIsLoading(false)
  }

  if (paymentInit?.paymentUrl) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Redirecting to eSewa…</p>
              <p className="text-sm text-muted-foreground">Please don’t close this tab.</p>
            </div>
          </Card>
          <EsewaRedirectForm actionUrl={paymentInit.paymentUrl} fields={paymentInit.fields || {}} />
        </div>
      </div>
    )
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
        {currentPlan !== "FREE" && (
          <Card className="p-6 mb-8 bg-green-50 border-green-200">
            <h2 className="font-semibold text-foreground mb-1">Current Plan</h2>
            <p className="text-green-700 text-lg font-bold">{currentPlan}</p>
          </Card>
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
            <div className="w-12 h-12 rounded bg-green-600 flex items-center justify-center text-white">
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

        {error && (
          <Card className="p-4 mb-6 border-destructive/30 bg-destructive/5 text-destructive">
            {error}
          </Card>
        )}

        {/* Payment Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            onClick={handlePayment}
            disabled={!selectedPlanData || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 flex-1 sm:flex-none"
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Processing..." : "Pay with eSewa"}
          </Button>
          <Button variant="outline" className="bg-transparent px-8 flex-1 sm:flex-none" size="lg" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
