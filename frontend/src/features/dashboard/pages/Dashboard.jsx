import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
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
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { Link } from "react-router-dom"
import { useAuth } from "@/shared/context/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { getUserStorageKey } from "@/shared/utils/utils"
import { getSavedCareers, getSavedColleges, getUserProfile } from "@/shared/lib/api"

export default function Dashboard() {
  const { user } = useAuth()
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
        
        // Check for grades
        const gradesKey = getUserStorageKey("aiGradesAnalysis", user.id)
        const storedGrades = localStorage.getItem(gradesKey)
        setHasGrades(!!storedGrades)

        // Check for interests
        const interestsKey = getUserStorageKey("userInterests", user.id)
        const storedInterests = localStorage.getItem(interestsKey)
        setHasInterests(!!storedInterests)

        // Fetch user profile for completion percentage
        try {
          const profileData = await getUserProfile(user.id)
          setProfileCompletion(profileData.profileCompletionPercent ?? 0)
        } catch (error) {
          console.error("Failed to fetch profile:", error)
        }

        // Fetch saved careers and colleges
        try {
          const [careersData, collegesData] = await Promise.all([
            getSavedCareers(user.id).catch(() => []),
            getSavedColleges(user.id).catch(() => [])
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
              action: "Joined CareerHoop",
              time: "Recently",
              icon: User,
            })
          }

          // Sort by time (most recent first) and limit to 3
          setRecentActivity(activities.slice(0, 3))
        } catch (error) {
          console.error("Failed to fetch saved items:", error)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
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
      { id: 1, title: "Enter Grades", completed: hasGrades, current: !hasGrades && !hasInterests },
      { id: 2, title: "Select Interests", completed: hasInterests, current: hasGrades && !hasInterests },
      { id: 3, title: "Get Recommendations", completed: savedCareersCount > 0, current: hasGrades && hasInterests && savedCareersCount === 0 },
      { id: 4, title: "Explore Colleges", completed: savedCollegesCount > 0, current: savedCareersCount > 0 && savedCollegesCount === 0 },
      { id: 5, title: "Build Skills", completed: false, current: savedCollegesCount > 0 },
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
      title: "Enter Your Grades",
      description: "Input your academic performance",
      icon: BookOpen,
      color: "bg-primary",
      textColor: "text-primary-foreground",
      borderColor: "border-primary/20",
      href: "/grades",
      completed: hasGrades,
      size: "md",
    },
    {
      title: "Select Interests",
      description: "Choose fields that excite you",
      icon: Target,
      color: "bg-secondary",
      textColor: "text-secondary-foreground",
      borderColor: "border-secondary/20",
      href: "/interests",
      completed: hasInterests,
      size: "md",
    },
    {
      title: "Explore Colleges",
      description: `Find universities that match you${savedCollegesCount > 0 ? ` (${savedCollegesCount} saved)` : ''}`,
      icon: Building2,
      color: "bg-blue-500",
      textColor: "text-white",
      borderColor: "border-blue-500/20",
      href: "/colleges",
      completed: savedCollegesCount > 0,
      size: "md",
    },
    {
      title: "Skill Training",
      description: "Build in-demand skills",
      icon: Briefcase,
      color: "bg-green-500",
      textColor: "text-white",
      borderColor: "border-green-500/20",
      href: "/trainings",
      completed: false,
      size: "md",
    },
  ], [hasGrades, hasInterests, savedCareersCount, savedCollegesCount])

  return (
    <ProtectedRoute requiredRole="student">
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
        <div className="flex min-h-screen bg-background">
          <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-bold text-balance">Welcome back, {userName}!</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Continue your career discovery journey. You're making great progress!
              </p>
            </motion.div>

            {/* Progress Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
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
                    {progressSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        className={`flex flex-col items-center text-center space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                          step.completed
                            ? "bg-primary/5 border-primary/20"
                            : step.current
                              ? "bg-accent/5 border-accent/20"
                              : "bg-muted/50 border-border"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-8 w-8 text-primary" />
                        ) : step.current ? (
                          <Clock className="h-8 w-8 text-accent" />
                        ) : (
                          <Circle className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            step.completed ? "text-primary" : step.current ? "text-accent" : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {actionCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={card.size === "lg" ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
                  >
                    <Link to={card.href}>
                      <Card
                        className={`h-full hover:shadow-lg transition-all duration-300 border-2 ${card.borderColor} group cursor-pointer`}
                      >
                        <CardHeader className={card.size === "lg" ? "space-y-6" : "space-y-4"}>
                          <div
                            className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          >
                            <card.icon className={`h-6 w-6 ${card.textColor}`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <CardTitle className={card.size === "lg" ? "text-2xl" : "text-xl"}>{card.title}</CardTitle>
                            {card.completed && <CheckCircle className="h-5 w-5 text-primary" />}
                          </div>
                        </CardHeader>
                        <CardContent className={card.size === "lg" ? "space-y-6" : "space-y-4"}>
                          <CardDescription className={card.size === "lg" ? "text-base" : "text-sm"}>
                            {card.description}
                          </CardDescription>
                          <Button
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                            variant={card.completed ? "outline" : "default"}
                          >
                            {card.completed ? "Review" : "Start"}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
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
                    <div className="text-center py-4 text-muted-foreground">No recent activity. Start exploring to see your progress here!</div>
                  ) : (
                    recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.action}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
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
        </main>
      </div>
      </>
    </ProtectedRoute>
  )
}
