"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { useAuth } from "@/shared/context/AuthContext"
import { register } from "@/shared/lib/api"
import { toast } from "react-toastify"
import { cn } from "@/shared/lib/utils"
import logoImg from "@/assets/images/Logo.png"

// Helper functions
const isEmailValid = (email) => {
  if (!email) return false
  // Practical email regex - not overly strict
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const getMissingPasswordRequirements = (password) => {
  const missing = []
  if (!password || password.length < 8) {
    missing.push("at least 8 characters")
  }
  if (!password || !/[A-Z]/.test(password)) {
    missing.push("1 uppercase letter")
  }
  if (!password || !/[a-z]/.test(password)) {
    missing.push("1 lowercase letter")
  }
  if (!password || !/[0-9]/.test(password)) {
    missing.push("1 number")
  }
  if (!password || !/[^A-Za-z0-9]/.test(password)) {
    missing.push("1 special character")
  }
  return missing
}

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  const missingPasswordRequirements = getMissingPasswordRequirements(password)
  const emailValid = isEmailValid(email)
  const passwordsMatch = confirmPassword && password === confirmPassword
  const passwordValid = password && missingPasswordRequirements.length === 0
  const isFormValid = fullName.trim() && emailValid && passwordValid && passwordsMatch

  const validatePassword = (value) => {
    const missing = getMissingPasswordRequirements(value)
    return missing.length ? missing : null
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (!fullName.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (!isEmailValid(email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const passwordErrors = validatePassword(password)
    if (passwordErrors) {
      setError(`Password must include ${passwordErrors.join(", ")}.`)
      return
    }

    setLoading(true)
    try {
      await register({
        name: fullName,
        email,
        password,
      })

      toast.success("Account created successfully! Please log in.")
      navigate("/login", { state: { prefillEmail: email } })
    } catch (err) {
      const errorMsg = err.message || "Signup failed. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoImg} alt="CareerHoop Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-bold text-foreground">
              Career<span className="text-primary">Hoop</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
          <p className="text-muted-foreground">Join CareerHoop to start your personalized journey</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError("")
                  }}
                  onBlur={(e) => {
                    if (e.target.value && !isEmailValid(e.target.value)) {
                      setEmailError("Please enter a valid email address")
                    } else {
                      setEmailError("")
                    }
                  }}
                  required
                  disabled={loading}
                  aria-invalid={!emailValid && email.length > 0}
                  aria-describedby={email && !emailValid ? "email-hint" : undefined}
                />
                {email && !emailValid && (
                  <p
                    id="email-hint"
                    className="text-sm text-destructive"
                    role="status"
                    aria-live="polite"
                  >
                    Enter a valid email address
                  </p>
                )}
                {emailError && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError("")
                    }}
                    onBlur={(e) => {
                      const passwordErrors = validatePassword(e.target.value)
                      if (passwordErrors) {
                        setPasswordError(`Password must include ${passwordErrors.join(", ")}.`)
                      } else {
                        setPasswordError("")
                      }
                    }}
                    required
                    disabled={loading}
                    className="h-10 pr-10"
                    aria-invalid={!!passwordError || (password && missingPasswordRequirements.length > 0)}
                    aria-describedby={password && missingPasswordRequirements.length > 0 ? "password-missing" : passwordError ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {password && missingPasswordRequirements.length > 0 && (
                    <motion.div
                      id="password-missing"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 text-sm overflow-hidden"
                      role="status"
                      aria-live="polite"
                    >
                      {missingPasswordRequirements.map((req, index) => (
                        <div key={index} className="text-destructive">
                          Missing: {req}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {passwordError && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setConfirmPasswordError("")
                    }}
                    onBlur={(e) => {
                      if (e.target.value && e.target.value !== password) {
                        setConfirmPasswordError("Passwords do not match")
                      } else {
                        setConfirmPasswordError("")
                      }
                    }}
                    required
                    disabled={loading}
                    className="h-10 pr-10"
                    aria-invalid={!!confirmPasswordError || (confirmPassword && !passwordsMatch)}
                    aria-describedby={confirmPassword && !passwordsMatch ? "confirm-password-hint" : confirmPasswordError ? "confirm-password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p
                    id="confirm-password-hint"
                    className="text-sm text-destructive"
                    role="status"
                    aria-live="polite"
                  >
                    Passwords do not match
                  </p>
                )}
                {confirmPasswordError && (
                  <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-10" loading={loading} disabled={loading || !isFormValid}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Log in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
