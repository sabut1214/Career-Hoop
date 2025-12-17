import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
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

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value)
const MIN_PASSWORD_LENGTH = 8

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login: authLogin, updateUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    }
  }, [user, navigate])

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

    if (!isValidEmail(email)) {
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
      const errorMessage = err.message || "Login failed. Please try again."
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
              areer<span className="text-primary">Hoop</span>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10"
                />
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

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button type="submit" className="w-full h-10" loading={loading} disabled={loading}>
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
