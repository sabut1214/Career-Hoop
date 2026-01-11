import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/shared/context/AuthContext"
import { login as apiLogin } from "@/shared/lib/api"
import { toast } from "react-toastify"
import logoImg from "@/assets/images/Logo.png"

// Helper functions
const isEmailValid = (email) => {
  if (!email) return false
  // Practical email regex - not overly strict
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const MIN_PASSWORD_LENGTH = 8

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login: authLogin, updateUser, logout: authLogout } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const emailValid = isEmailValid(email)
  const passwordValid = password && password.length >= MIN_PASSWORD_LENGTH
  const isFormValid = emailValid && passwordValid

  useEffect(() => {
    // Check if we were redirected due to verification failure
    const state = location.state
    if (state && (state.reason === "verification_failed" || state.reason === "insufficient_permissions")) {
      // Don't auto-redirect if verification failed - user needs to re-login
      // Show error message and clear invalid session
      if (user) {
        setError("Your session could not be verified. Please log in again.")
        // Clear invalid user data using logout to properly clean up
        authLogout()
      }
      return
    }

    // Only auto-redirect if we have a valid user and no verification issues
    if (user) {
      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    }
  }, [user, navigate, location.state, authLogout])

  useEffect(() => {
    if (user || email) return
    const state = location.state
    if (state && state.prefillEmail && typeof state.prefillEmail === "string") {
      setEmail(state.prefillEmail)
    }
  }, [location.state, user, email])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setEmailError("")
    setPasswordError("")

    if (!isEmailValid(email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    try {
      console.log('Attempting login for:', email)
      const response = await apiLogin(email, password)
      console.log('Login response:', response)

      if (response.user) {
        // Ensure user data has required fields
        const userData = {
          id: response.user.id || response.user.userId,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        }
        
        console.log('Storing user data:', userData)
        
        // Tokens are stored in httpOnly cookies by backend
        // Only store user data in context
        authLogin(userData)
        
        // Verify user was stored
        const storedUser = localStorage.getItem("user")
        console.log('User stored in localStorage:', storedUser)

        if (userData.role === "admin") {
          navigate("/admin")
        } else {
          navigate("/dashboard")
        }
      } else {
        console.error('Login response missing user data:', response)
        throw new Error("Invalid response from server - user data missing")
      }
    } catch (err) {
      console.error('Login error:', err)
      let errorMessage = err.message || "Login failed. Please try again."
      
      // Handle specific error messages from backend
      if (errorMessage.includes("Incorrect email")) {
        errorMessage = `Incorrect email: ${email}`
        setEmailError("Incorrect email address")
      } else if (errorMessage.includes("Incorrect password")) {
        errorMessage = "Incorrect password"
        setPasswordError("Incorrect password")
      } else if (errorMessage.toLowerCase().includes("email")) {
        errorMessage = `Email error: ${email ? email : 'Please enter a valid email address'}`
        setEmailError(errorMessage)
      } else if (errorMessage.toLowerCase().includes("password")) {
        errorMessage = "Password error: Please check your password"
        setPasswordError(errorMessage)
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
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
          <div className="flex items-center justify-center mb-4">
            <img src={logoImg} alt="CareerHoop Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-bold text-foreground">
              Career<span className="text-primary">Hoop</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
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
                  className="h-10"
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

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
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
                      if (e.target.value && e.target.value.length < MIN_PASSWORD_LENGTH) {
                        setPasswordError("Password must be at least 8 characters")
                      } else {
                        setPasswordError("")
                      }
                    }}
                    required
                    disabled={loading}
                    className="h-10 pr-10"
                    aria-invalid={!!passwordError || (password && !passwordValid)}
                    aria-describedby={password && !passwordValid ? "password-hint" : passwordError ? "password-error" : undefined}
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
                  {password && !passwordValid && (
                    <motion.div
                      id="password-hint"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-destructive overflow-hidden"
                      role="status"
                      aria-live="polite"
                    >
                      Missing: at least 8 characters
                    </motion.div>
                  )}
                </AnimatePresence>
                {passwordError && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button type="submit" className="w-full h-10" loading={loading} disabled={loading || !isFormValid}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
