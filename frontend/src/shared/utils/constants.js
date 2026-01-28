// API Base URL (set from environment or defaults to localhost)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

// Route paths
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  ASSESSMENT: "/assessment",
  CAREERS: "/careers",
  COLLEGES: "/colleges",
  TRAININGS: "/trainings",
  PROFILE: "/profile",
  RECOMMENDATIONS: "/recommendations",
  ADMIN: "/admin",
  LOGIN: "/login",
  SIGNUP: "/signup",
  HEALTH: "/health",
  NOT_FOUND: "/404",
  CHECKOUT_PRO: "/checkout/pro",
  BILLING: "/billing",
}

// Plan types
export const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
}

// Entity types for admin dashboard
export const ENTITY_TYPES = {
  STUDENT: "student",
  CAREER: "career",
  COLLEGE: "college",
  TRAINING: "training",
}

// Default pagination size
export const PAGE_SIZE = 10

// Salary ranges for filtering
export const SALARY_RANGES = [
  { label: "Entry Level", min: 0, max: 30000 },
  { label: "Mid Level", min: 30000, max: 60000 },
  { label: "Senior Level", min: 60000, max: 100000 },
  { label: "Executive", min: 100000, max: Number.POSITIVE_INFINITY },
]

// Job outlooks
export const JOB_OUTLOOKS = ["Poor", "Fair", "Good", "Very Good", "Excellent"]

// Status options
export const STATUS_OPTIONS = ["Active", "Inactive", "Pending"]

// Social Media Links
export const SOCIAL_LINKS = {
  TWITTER: "https://twitter.com/careerhoop",
  GITHUB: "https://github.com/careerhoop",
  LINKEDIN: "https://linkedin.com/company/careerhoop",
  INSTAGRAM: "https://instagram.com/careerhoop",
}
