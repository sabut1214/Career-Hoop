import { Link } from "react-router-dom"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/shared/context/AuthContext"

export default function EsewaFailurePage() {
  const { user } = useAuth()

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

        <div className="flex gap-3">
          <Link to="/billing" className="flex-1">
            <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
              Retry Payment
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
