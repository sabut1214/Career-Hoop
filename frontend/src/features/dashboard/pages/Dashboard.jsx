import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  Target,
  User,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  Briefcase,
  Building2,
  Star,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/shared/context/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { getUserStorageKey } from "@/shared/utils/utils"
import { getSavedCareers, getSavedColleges, getUserProfile } from "@/shared/lib/api"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { Rocket } from "lucide-react"
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding"
import { DashboardCardSkeletonGrid } from "@/shared/components/common/DashboardCardSkeleton"
import { isAuthError } from "@/shared/utils/errorMessages"

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { hasCompletedOnboarding, isChecking } = useOnboarding()
  const prefersReducedMotion = useReducedMotion()

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isChecking && user?.id && !hasCompletedOnboarding && user.role !== "admin") {
      navigate("/onboarding", { replace: true })
    }
  }, [hasCompletedOnboarding, isChecking, user?.id, user?.role, navigate])
  const userName = user?.name || user?.fullName || "Alex"
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [savedCareersCount, setSavedCareersCount] = useState(0)
  const [savedCollegesCount, setSavedCollegesCount] = useState(0)
  const [hasGrades, setHasGrades] = useState(false)
  const [hasInterests, setHasInterests] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real-time data
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Check for grades (check both history and legacy keys)
        const historyKey = getUserStorageKey("aiGradesAnalyses", user.id)
        const gradesKey = getUserStorageKey("aiGradesAnalysis", user.id)
        const storedHistory = localStorage.getItem(historyKey)
        const storedGrades = localStorage.getItem(gradesKey)
        const hasStoredGrades = !!storedHistory || !!storedGrades
        setHasGrades(hasStoredGrades)

        // Check for interests
        const interestsKey = getUserStorageKey("userInterests", user.id)
        const storedInterests = localStorage.getItem(interestsKey)
        setHasInterests(!!storedInterests)

        // Fetch user profile for completion percentage
        try {
          const profileData = await getUserProfile(user.id)
          setProfileCompletion(profileData.profileCompletionPercent ?? 0)
        } catch (error) {
          // Silently handle auth errors - API layer will handle redirects
          // Only log non-auth errors for debugging
          if (!isAuthError(error)) {
            console.error("Failed to fetch profile:", error)
          }
          // Keep profileCompletion at 0 if fetch fails
        }

        // Fetch saved careers and colleges
        try {
          const [careersData, collegesData] = await Promise.all([
            getSavedCareers(user.id).catch(() => []),
            getSavedColleges(user.id).catch(() => []),
          ])
          setSavedCareersCount(careersData.length)
          setSavedCollegesCount(collegesData.length)

          // Build recent activity from saved items
          const activities = []
          
          // Add most recent saved career
          if (careersData.length > 0) {
            const latestCareer = careersData.sort((a, b) => 
              new Date(b.savedAt) - new Date(a.savedAt)
            )[0]
            activities.push({
              action: `Saved "${latestCareer.careerName || latestCareer.careerTitle}" career`,
              time: formatTimeAgo(new Date(latestCareer.savedAt)),
              icon: Star,
            })
          }

          // Add most recent saved college
          if (collegesData.length > 0) {
            const latestCollege = collegesData.sort((a, b) =>
              new Date(b.savedAt) - new Date(a.savedAt)
            )[0]
            activities.push({
              action: `Saved "${latestCollege.collegeName}" college`,
              time: formatTimeAgo(new Date(latestCollege.savedAt)),
              icon: Building2,
            })
          }

          // Add grades entry if exists
          if (storedGrades) {
            try {
              const gradesData = JSON.parse(storedGrades)
              activities.push({
                action: "Completed Grade Entry",
                time: "Recently",
                icon: BookOpen,
              })
            } catch (e) {
              // Ignore parse errors
            }
          }

          // Add interests selection if exists
          if (storedInterests) {
            try {
              const interestsData = JSON.parse(storedInterests)
              if (interestsData.careerFields && interestsData.careerFields.length > 0) {
                activities.push({
                  action: `Selected ${interestsData.careerFields.length} Interest Area${interestsData.careerFields.length > 1 ? 's' : ''}`,
                  time: "Recently",
                  icon: Target,
                })
              }
            } catch (e) {
              // Ignore parse errors
            }
          }

          // Add account creation (if no other activities)
          if (activities.length === 0) {
            activities.push({
              action: "Joined areerHoop",
              time: "Recently",
              icon: User,
            })
          }

          // Sort by time (most recent first) and limit to 3
          setRecentActivity(activities.slice(0, 3))
        } catch (error) {
          // Silently handle auth errors - API layer will handle redirects
          // Only log non-auth errors for debugging
          if (!isAuthError(error)) {
            console.error("Failed to fetch saved items:", error)
          }
          // Keep counts at 0 if fetch fails
        }
      } catch (error) {
        // Only log non-auth errors - auth errors are handled by API layer
        if (!isAuthError(error)) {
          console.error("Failed to fetch dashboard data:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  // Format time ago helper
  const formatTimeAgo = (date) => {
    if (!date || isNaN(date.getTime())) return "Recently"
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Calculate progress steps based on real data
  const progressSteps = useMemo(() => {
    const steps = [
      { id: 1, title: "Complete Assessment", completed: hasGrades && hasInterests, current: !hasGrades || !hasInterests },
      { id: 2, title: "Get Recommendations", completed: savedCareersCount > 0, current: hasGrades && hasInterests && savedCareersCount === 0 },
      { id: 3, title: "Explore Colleges", completed: savedCollegesCount > 0, current: savedCareersCount > 0 && savedCollegesCount === 0 },
      { id: 4, title: "Build Skills", completed: false, current: savedCollegesCount > 0 },
    ]
    return steps
  }, [hasGrades, hasInterests, savedCareersCount, savedCollegesCount])

  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    const completedSteps = progressSteps.filter(step => step.completed).length
    return Math.round((completedSteps / progressSteps.length) * 100)
  }, [progressSteps])

  useEffect(() => {
    if (!user || user.role !== "student") {
      setShowProfilePrompt(false)
      return
    }
    if (profileCompletion < 100) {
      setShowProfilePrompt(true)
    } else {
      setShowProfilePrompt(false)
    }
  }, [user?.id, user?.role, profileCompletion])

  // Action cards with real-time completion status
  const actionCards = useMemo(() => [
    {
      title: "View Recommendations",
      description: `Discover career paths tailored to your profile${savedCareersCount > 0 ? ` (${savedCareersCount} saved)` : ''}`,
      icon: BarChart3,
      color: "bg-accent",
      textColor: "text-accent-foreground",
      borderColor: "border-accent/20",
      href: "/recommendations",
      completed: savedCareersCount > 0,
      size: "lg", // Large card
    },
    {
      title: "Start Assessment",
      description: hasGrades && hasInterests 
        ? "Assessment completed - View or update your profile" 
        : "Complete your career assessment (grades, interests, location)",
      icon: Target,
      color: "bg-primary",
      textColor: "text-primary-foreground",
      borderColor: "border-primary/20",
      href: "/assessment",
      completed: hasGrades && hasInterests,
      size: "lg", // Large card - make it prominent
    },
    {
      title: "Explore Colleges",
      description: `Find universities that match you${savedCollegesCount > 0 ? ` (${savedCollegesCount} saved)` : ''}`,
      icon: Building2,
      color: "bg-primary",
      textColor: "text-primary-foreground",
      borderColor: "border-primary/20",
      href: "/colleges",
      completed: savedCollegesCount > 0,
      size: "md",
    },
    {
      title: "Skill Training",
      description: "Build in-demand skills",
      icon: Briefcase,
      color: "bg-[var(--primary-soft)]",
      textColor: "text-foreground",
      borderColor: "border-[var(--primary-soft-border)]",
      href: "/trainings",
      completed: false,
      size: "md",
    },
  ], [hasGrades, hasInterests, savedCareersCount, savedCollegesCount])

  // Show loading while checking onboarding status
  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if onboarding not completed (redirect will happen)
  if (!hasCompletedOnboarding && user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to onboarding...
      </div>
    )
  }

  return (
    <>
      <Dialog open={showProfilePrompt} onOpenChange={setShowProfilePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your profile</DialogTitle>
            <DialogDescription>
              You're {profileCompletion}% done. Add your school, location, contact, and academic details to unlock
              better recommendations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfilePrompt(false)}>
              Later
            </Button>
            <Button asChild>
              <Link to="/profile">Update Profile</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-balance">Welcome back, {userName}!</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Continue your career discovery journey. You're making great progress!
          </p>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Your Career Journey
              </CardTitle>
              <CardDescription>Track your progress through the career discovery process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{loading ? "Loading..." : `${overallProgress}% Complete`}</span>
              </div>
              <Progress value={loading ? 0 : overallProgress} className="h-2" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <TooltipProvider delayDuration={300}>
                  {progressSteps.map((step, index) => {
                    const stepDescriptions = {
                      1: "Complete your assessment by uploading your marksheet and selecting your interests",
                      2: "View personalized career recommendations based on your profile",
                      3: "Explore and save colleges that match your career goals",
                      4: "Build skills through training programs to prepare for your chosen career"
                    }
                    return (
                      <Tooltip key={step.id}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.4, delay: 0.2 + index * 0.1 }}
                            className={`flex flex-col items-center text-center space-y-2 p-4 rounded-lg border-2 transition-all duration-300 cursor-help ${
                              step.completed
                                ? "bg-[var(--primary-soft)] border-[var(--primary-soft-border)]"
                                : step.current
                                  ? "bg-[var(--primary-soft)]/50 border-[var(--primary-soft-border)]"
                                  : "bg-muted/50 border-border"
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle className="h-8 w-8 text-primary shrink-0" />
                            ) : step.current ? (
                              <Clock className="h-8 w-8 text-primary shrink-0" />
                            ) : (
                              <Circle className="h-8 w-8 text-muted-foreground shrink-0" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                step.completed ? "text-foreground" : step.current ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </span>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>{stepDescriptions[step.id] || step.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Quick Actions</h2>
          {loading ? (
            <DashboardCardSkeletonGrid count={5} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className={card.size === "lg" ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
              >
                <Link to={card.href}>
                  <Card
                    className={`h-full hover:shadow-lg transition-[box-shadow] duration-200 ease-out border-2 ${card.borderColor} group cursor-pointer`}
                  >
                    <CardHeader className={card.size === "lg" ? "space-y-6" : "space-y-4"}>
                      <div
                        className={`w-12 h-12 shrink-0 rounded-lg ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ease-out`}
                      >
                        <card.icon className={`h-6 w-6 shrink-0 ${card.textColor}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className={card.size === "lg" ? "text-2xl" : "text-xl"}>{card.title}</CardTitle>
                        {card.completed && <CheckCircle className="h-5 w-5 shrink-0 text-primary" />}
                      </div>
                    </CardHeader>
                    <CardContent className={card.size === "lg" ? "space-y-6" : "space-y-4"}>
                      <CardDescription className={card.size === "lg" ? "text-base" : "text-sm"}>
                        {card.description}
                      </CardDescription>
                      <Button
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-[background-color,color] duration-200 ease-out"
                        variant={card.completed ? "outline" : "default"}
                      >
                        {card.completed ? "Review" : "Start"}
                        <ArrowRight className="ml-2 h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform duration-200 ease-out" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
              ) : recentActivity.length === 0 ? (
                <EmptyState
                  icon={Rocket}
                  title="No Recent Activity"
                  description="Start your career discovery journey to see your progress and achievements here."
                  action={{
                    label: "Start Assessment",
                    onClick: () => navigate("/assessment"),
                    variant: "default"
                  }}
                />
              ) : (
                recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.action}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
                >
                  <activity.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
