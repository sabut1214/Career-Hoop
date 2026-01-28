import { Link, useSearchParams } from "react-router-dom"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/shared/context/AuthContext"
import { verifyEsewaV2Payment } from "@/shared/lib/api"
import { useState } from "react"
import { toast } from "react-toastify"

export default function EsewaFailurePage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [verifying, setVerifying] = useState(false)
  const data = searchParams.get("data")

  const handleVerify = async () => {
    if (!data) return
    
    setVerifying(true)
    try {
      const response = await verifyEsewaV2Payment(data)
      if (response?.ok === true && response?.status === "COMPLETE") {
        toast.success("Payment verified successfully! Your subscription has been upgraded.")
        // Redirect to recommendations or dashboard
        window.location.href = "/recommendations"
      } else {
        toast.info(`Payment status: ${response?.status || "UNKNOWN"}`)
      }
    } catch (error) {
      toast.error(error?.message || "Failed to verify payment")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>

        <p className="text-muted-foreground mb-6">
          Your payment could not be processed. This may be due to:
        </p>

        <ul className="text-left text-muted-foreground mb-6 space-y-2 list-disc list-inside">
          <li>Insufficient balance in your eSewa account</li>
          <li>Transaction was cancelled</li>
          <li>Network or server error</li>
          <li>Invalid payment details</li>
        </ul>

        {data && (
          <div className="mb-4 p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground mb-2">
              Payment data received. You can verify the payment status:
            </p>
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {verifying ? "Verifying..." : "Verify Payment Status"}
            </Button>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/checkout/pro" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
              Try Again
            </Button>
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              {user ? "Back to Dashboard" : "Login"}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
