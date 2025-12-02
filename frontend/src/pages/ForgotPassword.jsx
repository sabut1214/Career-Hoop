import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react"
import { forgotPassword as apiForgotPassword, verifyOtp as apiVerifyOtp } from "@/lib/api"

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value)

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("email") // "email" or "otp"
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)

    try {
      const response = await apiForgotPassword(email)
      setSuccess(response.message || "If an account with that email exists, a password reset OTP has been sent.")
      setStep("otp")
    } catch (err) {
      console.error("[v0] Forgot password error caught:", err)
      const errorMessage = err.message || "Failed to send password reset email. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!otp || otp.length !== 5) {
      setError("Please enter a valid 5-digit OTP.")
      return
    }

    setLoading(true)

    try {
      const response = await apiVerifyOtp(email, otp)
      setSuccess(response.message || "OTP verified successfully. Redirecting to reset password...")
      setTimeout(() => {
        navigate("/reset-password", { state: { email, otp } })
      }, 1500)
    } catch (err) {
      console.error("[v0] Verify OTP error caught:", err)
      const errorMessage = err.message || "Failed to verify OTP. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">CareerHoop</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted-foreground">
            {step === "email" 
              ? "Enter your email to receive a password reset OTP"
              : "Enter the 5-digit OTP sent to your email"}
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{step === "email" ? "Reset Password" : "Verify OTP"}</CardTitle>
            <CardDescription>
              {step === "email"
                ? "We'll send you a 5-digit OTP to reset your password"
                : `OTP sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                {/* Success Alert */}
                {success && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* OTP Field */}
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="12345"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 5)
                      setOtp(value)
                    }}
                    required
                    disabled={loading}
                    className="h-10 text-center text-2xl tracking-widest"
                    maxLength={5}
                  />
                  <p className="text-xs text-muted-foreground">Enter the 5-digit code sent to your email</p>
                </div>

                {/* Success Alert */}
                {success && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="space-y-2">
                  <Button type="submit" className="w-full h-10" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    disabled={loading}
                    onClick={() => {
                      setStep("email")
                      setOtp("")
                      setError("")
                      setSuccess("")
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

