import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { getEsewaPaymentStatus } from "@/shared/lib/api"
import { useAuth } from "@/shared/context/AuthContext"

const formatReason = (reason) => {
  if (!reason) return null
  return String(reason).replace(/_/g, " ")
}

export default function EsewaReturnPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const status = (searchParams.get("status") || "").toLowerCase()
  const pid = searchParams.get("pid") || ""
  const reason = formatReason(searchParams.get("reason"))

  const isSuccess = status === "success"
  const isFailed = status === "failed"

  const [loading, setLoading] = useState(isSuccess && Boolean(pid))
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!isSuccess || !pid) return
      setLoading(true)
      setError(null)
      try {
        const data = await getEsewaPaymentStatus(pid)
        if (cancelled) return
        setPayment(data)
      } catch (e) {
        if (cancelled) return
        setError(e?.message || "Failed to load payment status")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [isSuccess, pid])

  const title = useMemo(() => {
    if (isSuccess) return "Payment Successful!"
    if (isFailed) return "Payment Failed"
    return "Payment Status"
  }, [isSuccess, isFailed])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-600" />
          ) : (
            <AlertCircle className="h-16 w-16 text-destructive" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        {isSuccess ? (
          <p className="text-muted-foreground mb-6">Your payment is complete.</p>
        ) : (
          <p className="text-muted-foreground mb-6">
            {reason ? `Reason: ${reason}.` : "Your payment could not be processed."}
          </p>
        )}

        {isSuccess && (
          <div className="bg-muted p-4 rounded-lg mb-6 text-left space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : payment ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-foreground">{payment.status || "SUCCESS"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">PID:</span>
                  <span className="font-mono text-sm text-foreground">{payment.pid || pid}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold text-foreground">{payment.amount} NPR</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/billing" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">{isSuccess ? "View Plans" : "Retry Payment"}</Button>
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

