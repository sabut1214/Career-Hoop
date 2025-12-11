"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/AuthContext"
import { register } from "@/lib/api"
import { toast } from "react-toastify"
import logoImg from "@/assets/images/Logo.png"

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

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value)
  const validatePassword = (value) => {
    const checks = [
      { test: value.length >= 8, message: "at least 8 characters" },
      { test: /[A-Z]/.test(value), message: "an uppercase letter" },
      { test: /[a-z]/.test(value), message: "a lowercase letter" },
      { test: /[0-9]/.test(value), message: "a number" },
      { test: /[^A-Za-z0-9]/.test(value), message: "a special character" },
    ]
    const failures = checks.filter((check) => !check.test).map((check) => check.message)
    return failures.length ? failures : null
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (!fullName.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (!isValidEmail(email)) {
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
              areer<span className="text-primary">Hoop</span>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-10" disabled={loading}>
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
