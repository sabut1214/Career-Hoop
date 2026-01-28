import { useEffect, useState } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { verifyEsewaV2Payment, getUserProfile } from "@/shared/lib/api"
import { useAuth } from "@/shared/context/AuthContext"
import { toast } from "react-toastify"

export default function EsewaSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const data = searchParams.get("data")

  const [loading, setLoading] = useState(Boolean(data))
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [userRefreshed, setUserRefreshed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const verifyPayment = async () => {
      if (!data) {
        setError("No payment data received")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await verifyEsewaV2Payment(data)
        if (cancelled) return

        setResult(response)

        // If payment is successful, refresh user data to get updated subscription
        if (response?.ok === true && response?.status === "COMPLETE") {
          try {
            // Use getUserProfile to get full user data including subscription info
            if (user?.id) {
              const updatedUser = await getUserProfile(user.id)
              if (updatedUser && !cancelled) {
                updateUser(updatedUser)
                setUserRefreshed(true)
                
                // Redirect to intended destination or recommendations after a short delay
                setTimeout(() => {
                  const postUpgradeRedirect = sessionStorage.getItem("postUpgradeRedirect")
                  if (postUpgradeRedirect && postUpgradeRedirect !== "/checkout/pro" && postUpgradeRedirect !== "/billing") {
                    sessionStorage.removeItem("postUpgradeRedirect")
                    navigate(postUpgradeRedirect, { replace: true })
                  } else {
                    // Default to recommendations page (user likely wanted to access it)
                    navigate("/recommendations", { replace: true })
                  }
                }, 2000)
              }
            } else {
              // Fallback: redirect even if user refresh fails
              setTimeout(() => {
                const postUpgradeRedirect = sessionStorage.getItem("postUpgradeRedirect")
                if (postUpgradeRedirect && postUpgradeRedirect !== "/checkout/pro" && postUpgradeRedirect !== "/billing") {
                  sessionStorage.removeItem("postUpgradeRedirect")
                  navigate(postUpgradeRedirect, { replace: true })
                } else {
                  navigate("/recommendations", { replace: true })
                }
              }, 2000)
            }
          } catch (refreshError) {
            console.error("Failed to refresh user data:", refreshError)
            // Still redirect even if refresh fails
            setTimeout(() => {
              const postUpgradeRedirect = sessionStorage.getItem("postUpgradeRedirect")
              if (postUpgradeRedirect && postUpgradeRedirect !== "/checkout/pro" && postUpgradeRedirect !== "/billing") {
                sessionStorage.removeItem("postUpgradeRedirect")
                navigate(postUpgradeRedirect, { replace: true })
              } else {
                navigate("/recommendations", { replace: true })
              }
            }, 2000)
          }
        }
      } catch (e) {
        if (cancelled) return
        const errorMessage = e?.message || "Failed to verify payment"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    verifyPayment()

    return () => {
      cancelled = true
    }
  }, [data])

  const isSuccess = result?.ok === true && result?.status === "COMPLETE"
  const isPending = result?.ok === true && result?.status === "PENDING"
  const isFailed = result?.ok === false || (!isSuccess && !isPending && !loading)

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          {loading ? (
            <Loader2 className="h-16 w-16 shrink-0 text-muted-foreground animate-spin" />
          ) : isSuccess ? (
            <CheckCircle className="h-16 w-16 shrink-0 text-success" />
          ) : (
            <AlertCircle className="h-16 w-16 text-destructive" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {loading
            ? "Verifying Payment..."
            : isSuccess
            ? "Payment Successful!"
            : isPending
            ? "Payment Pending"
            : "Payment Failed"}
        </h1>

        {loading ? (
          <p className="text-muted-foreground mb-6">Please wait while we verify your payment.</p>
        ) : isSuccess ? (
          <div className="space-y-2 mb-6">
            <p className="text-muted-foreground">Your payment has been processed successfully.</p>
            {userRefreshed && (
              <p className="text-primary font-semibold">Pro plan activated! Redirecting...</p>
            )}
          </div>
        ) : isPending ? (
          <p className="text-muted-foreground mb-6">
            Your payment is being processed. Please check back later.
          </p>
        ) : (
          <p className="text-muted-foreground mb-6">
            {error || result?.status || "Your payment could not be processed."}
          </p>
        )}

        {(isSuccess || isPending || isFailed) && (
          <div className="bg-muted p-4 rounded-lg mb-6 text-left space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : result ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-foreground">{result.status || "UNKNOWN"}</span>
                </div>
                {result.transaction_uuid && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-sm text-foreground break-all">
                      {result.transaction_uuid}
                    </span>
                  </div>
                )}
                {result.transaction_code && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Reference Code:</span>
                    <span className="font-mono text-sm text-foreground break-all">
                      {result.transaction_code}
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        <div className="flex gap-3">
          {isSuccess ? (
            <>
              <Link to="/billing" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                  View Plans
                </Button>
              </Link>
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : isFailed ? (
            <>
              <Link to="/checkout/pro" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                  Retry Payment
                </Button>
              </Link>
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/checkout/pro" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                  Back to Checkout
                </Button>
              </Link>
              <Link to={user ? "/dashboard" : "/login"} className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  {user ? "Dashboard" : "Login"}
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
