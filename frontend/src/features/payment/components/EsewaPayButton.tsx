import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Loader2 } from "lucide-react"
import { initiateEsewaV2Payment } from "@/shared/lib/api"
import { EsewaRedirectForm } from "@/features/payment/componenets/esewa-form"
import { toast } from "react-toastify"
import { getUserFriendlyError } from "@/shared/utils/userFriendlyErrors"

interface EsewaPayButtonProps {
  amount: number
  orderId?: string
  className?: string
  disabled?: boolean
}

export function EsewaPayButton({ amount, orderId, className, disabled }: EsewaPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<{ actionUrl: string; fields: Record<string, string> } | null>(null)

  const handlePayment = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      const result = await initiateEsewaV2Payment({
        amount,
        orderId: orderId || undefined,
      })

      setPaymentData({
        actionUrl: result.actionUrl,
        fields: result.fields,
      })
    } catch (error) {
      console.error("Payment initiation error:", error)
      const friendlyError = getUserFriendlyError(
        error,
        "Could not initiate payment. Please try again."
      )
      toast.error(friendlyError)
      setIsLoading(false)
    }
  }

  // Show redirect form when payment data is available
  if (paymentData) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Redirecting to eSewa…</p>
          <p className="text-sm text-muted-foreground">Please don't close this tab.</p>
        </div>
        <EsewaRedirectForm actionUrl={paymentData.actionUrl} fields={paymentData.fields} />
      </div>
    )
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={className || "bg-success hover:bg-success/90 text-success-foreground"}
      size="lg"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Processing..." : "Pay with eSewa"}
    </Button>
  )
}
