"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Loader2, Check, Shield } from "lucide-react"
import { initiateEsewaV2Payment } from "@/shared/lib/api"
import logoImg from "@/assets/images/Logo.png"
import { toast } from "react-toastify"

const PRO_BENEFITS = [
  "All Free features",
  "Advanced career matching",
  "Unlimited training modules",
  "Priority support",
  "Personalized guidance",
  "Advanced analytics",
]

const PRO_PRICE = 500

export default function CheckoutPro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [returnedFromEsewa, setReturnedFromEsewa] = useState(false)
  const formRef = useRef(null)
  const submittedRef = useRef(false)
  const initiatedRef = useRef(false)

  useEffect(() => {
    // CRITICAL: Check if user is coming back from eSewa (browser back button)
    // This prevents auto-redirect when user clicks back
    const wasSubmitted = sessionStorage.getItem('esewa_payment_submitted')
    const pageLoadTime = sessionStorage.getItem('checkout_page_load_time')
    const now = Date.now()
    
    // If payment was submitted and page was loaded recently (within 30 seconds), user likely came back
    if (wasSubmitted === 'true' && pageLoadTime) {
      const timeSinceLoad = now - parseInt(pageLoadTime, 10)
      if (timeSinceLoad < 30000) { // 30 seconds
        // User came back from eSewa - reset the flag and show ready state
        sessionStorage.removeItem('esewa_payment_submitted')
        submittedRef.current = false
        setReturnedFromEsewa(true)
        // Don't re-initialize payment, just show the ready state if we have cached data
        const cachedPayment = sessionStorage.getItem('esewa_payment_data')
        if (cachedPayment) {
          try {
            const parsed = JSON.parse(cachedPayment)
            setPaymentData(parsed)
            setLoading(false)
            // Mark that we've handled the return
            sessionStorage.setItem('checkout_page_load_time', now.toString())
            return
          } catch (e) {
            console.error('Failed to parse cached payment data:', e)
          }
        }
        // If no cached data, allow re-initialization
      }
    }

    // Store page load time
    sessionStorage.setItem('checkout_page_load_time', now.toString())

    // Prevent multiple initializations
    if (initiatedRef.current) {
      return
    }

    const initiatePayment = async () => {
      try {
        setLoading(true)
        setError(null)
        initiatedRef.current = true

        const response = await initiateEsewaV2Payment({
          plan: "PRO",
          amount: PRO_PRICE,
        })

        // Validate response has required fields
        if (!response?.actionUrl || !response?.fields) {
          throw new Error("Invalid payment response: missing actionUrl or fields")
        }

        // Validate all required fields are present
        const requiredFields = [
          "amount", "tax_amount", "total_amount", "transaction_uuid",
          "product_code", "product_service_charge", "product_delivery_charge",
          "success_url", "failure_url", "signed_field_names", "signature"
        ]
        const missingFields = requiredFields.filter(field => !response.fields[field])
        if (missingFields.length > 0) {
          console.error("Missing required payment fields:", missingFields)
          throw new Error(`Payment setup incomplete. Missing fields: ${missingFields.join(", ")}`)
        }

        // Check for empty values
        const emptyFields = Object.entries(response.fields)
          .filter(([key, value]) => !value || value.trim() === "")
          .map(([key]) => key)
        if (emptyFields.length > 0) {
          console.error("Empty payment fields detected:", emptyFields)
          throw new Error(`Payment setup incomplete. Empty fields: ${emptyFields.join(", ")}`)
        }

        // Cache payment data for browser back navigation
        sessionStorage.setItem('esewa_payment_data', JSON.stringify(response))
        setPaymentData(response)
        setLoading(false)
      } catch (err) {
        console.error("Failed to initiate payment:", err)
        setError(err?.message || "Failed to initiate payment. Please try again.")
        setLoading(false)
        initiatedRef.current = false
        toast.error(err?.message || "Failed to initiate payment")
      }
    }

    initiatePayment()
  }, [])

  const handleManualSubmit = (e) => {
    // Allow calling without event (for auto-proceed)
    if (e && e.preventDefault) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!formRef.current) {
      console.error('Form ref not available')
      return
    }
    
    if (submittedRef.current) {
      console.warn('Form already submitted, preventing duplicate submission')
      return
    }
    
    // Clear auto-proceed flag since we're proceeding
    sessionStorage.removeItem('auto_proceed_from_modal')
    
    // Mark that payment was submitted so we don't re-initialize on browser back
    submittedRef.current = true
    sessionStorage.setItem('esewa_payment_submitted', 'true')
    sessionStorage.setItem('checkout_page_load_time', Date.now().toString())
    
    // Submit the form
    try {
      formRef.current.submit()
    } catch (err) {
      console.error('Form submission error:', err)
      submittedRef.current = false
      sessionStorage.removeItem('esewa_payment_submitted')
      toast.error('Failed to redirect to payment. Please try again.')
    }
  }

  // Removed auto-proceed logic - user must manually click "Proceed to eSewa Payment" button

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset initiated flag when component unmounts (but keep payment data in sessionStorage)
      initiatedRef.current = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Branding & Order Summary */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="areerHoop Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Career<span className="text-primary">Hoop</span>
                </h1>
                <p className="text-sm text-muted-foreground">Secure Payment</p>
              </div>
            </div>

            {/* Order Summary */}
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{PRO_PRICE.toLocaleString()} NPR</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-semibold text-foreground">{PRO_PRICE.toLocaleString()} NPR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">{PRO_PRICE.toLocaleString()} NPR</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Benefits */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">What you'll get:</h3>
              <ul className="space-y-2">
                {PRO_BENEFITS.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Security Notice */}
            <Card className="p-4 bg-muted/30 border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Your payment is processed securely through eSewa. You will be redirected to eSewa's secure payment page to complete your purchase.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Payment Action */}
          <div className="flex items-center justify-center">
            <Card className="p-8 w-full max-w-md">
              {loading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Preparing your payment...</h3>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we prepare your payment details
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Payment Setup Failed</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-primary hover:bg-primary-hover text-primary-foreground w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : paymentData ? (
                <div className="text-center space-y-4">
                  {returnedFromEsewa && (
                    <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        You returned from eSewa. You can proceed again or cancel to go back.
                      </p>
                    </div>
                  )}
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Pay</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Click the button below to proceed to eSewa's secure payment page.
                    </p>
                    <Button
                      type="button"
                      onClick={handleManualSubmit}
                      className="bg-primary hover:bg-primary-hover text-primary-foreground w-full text-base font-semibold py-6"
                      size="lg"
                    >
                      Proceed to eSewa Payment
                    </Button>
                    <Button
                      onClick={() => {
                        // Clear cached payment data when canceling
                        sessionStorage.removeItem('esewa_payment_data')
                        sessionStorage.removeItem('esewa_payment_submitted')
                        sessionStorage.removeItem('auto_proceed_from_modal')
                        navigate("/billing")
                      }}
                      variant="outline"
                      className="w-full mt-3 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Hidden form for eSewa submission - ONLY submits when button is clicked */}
                  <form
                    ref={formRef}
                    id="esewa-payment-form"
                    method="POST"
                    action={paymentData.actionUrl}
                    style={{ display: "none" }}
                    encType="application/x-www-form-urlencoded"
                    onSubmit={(e) => {
                      // Prevent any accidental auto-submit
                      if (!submittedRef.current) {
                        e.preventDefault()
                        return false
                      }
                    }}
                  >
                    {Object.entries(paymentData.fields || {}).map(([key, value]) => (
                      <input 
                        key={key} 
                        type="hidden" 
                        name={key} 
                        value={value || ""} 
                      />
                    ))}
                  </form>

                  {/* Debug panel (development only) */}
                  {import.meta.env.DEV && paymentData && (
                    <details className="mt-4 p-4 bg-muted rounded border border-border">
                      <summary className="cursor-pointer font-mono text-sm text-muted-foreground hover:text-foreground">
                        Payment Debug Info
                      </summary>
                      <div className="mt-3 space-y-2 text-xs font-mono">
                        <div className="break-all">
                          <span className="text-muted-foreground">Action URL:</span>{" "}
                          <span className="text-foreground">{paymentData.actionUrl}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fields ({Object.keys(paymentData.fields || {}).length}):</span>{" "}
                          <span className="text-foreground">
                            {Object.keys(paymentData.fields || {}).join(", ")}
                          </span>
                        </div>
                        <div className="break-all">
                          <span className="text-muted-foreground">Signature (masked):</span>{" "}
                          <span className="text-foreground">
                            {paymentData.fields?.signature?.substring(0, 20)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transaction UUID:</span>{" "}
                          <span className="text-foreground">
                            {paymentData.fields?.transaction_uuid}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Amount:</span>{" "}
                          <span className="text-foreground">
                            {paymentData.fields?.total_amount}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Product Code:</span>{" "}
                          <span className="text-foreground">
                            {paymentData.fields?.product_code}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border">
                          <span className="text-muted-foreground">Field Validation:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(paymentData.fields || {}).map(([key, value]) => (
                              <div key={key} className={!value || value.trim() === "" ? "text-destructive" : "text-foreground"}>
                                {key}: {value ? (value.length > 50 ? value.substring(0, 50) + "..." : value) : "(empty)"}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
