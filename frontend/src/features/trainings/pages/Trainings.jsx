import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { getAvailableTrainings } from "@/shared/lib/api"
import { useAuth } from "@/shared/context/AuthContext"
import { useSubscription } from "@/shared/hooks/useSubscription"
import { BookOpen, Clock, Users, Search, Loader, ExternalLink, Lock } from "lucide-react"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { ProPaywallModal } from "@/features/payment/components/ProPaywallModal"

export default function TrainingPage() {
  const prefersReducedMotion = useReducedMotion()
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPro } = useSubscription()
  const [paywallModalOpen, setPaywallModalOpen] = useState(false)

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getAvailableTrainings()
        const trainingsData = response.data || response || []
        console.log("Fetched trainings:", trainingsData)
        setTrainings(trainingsData)
        if (trainingsData.length === 0) {
          setError("No trainings available. Please ensure the backend is running and migrations have been applied.")
        }
      } catch (err) {
        setError(err.message || "Failed to fetch trainings. Make sure the backend is running on http://localhost:8080")
        console.error("Failed to fetch trainings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrainings()
  }, [])

  const filteredTrainings = trainings.filter(
    (training) =>
      training.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (training.skills && training.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  // For free users, limit to 2 free trainings, rest are locked
  const FREE_LIMIT = 2
  let visibleTrainings = filteredTrainings
  let lockedTrainings = []
  
  if (!isPro && filteredTrainings.length > FREE_LIMIT) {
    visibleTrainings = filteredTrainings.slice(0, FREE_LIMIT)
    lockedTrainings = filteredTrainings.slice(FREE_LIMIT)
  }

  const handleEnroll = (trainingId) => {
    if (!user) {
      navigate("/login", { state: { redirectTo: `/quiz/start/${trainingId}` } })
      return
    }
    navigate(`/quiz/start/${trainingId}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Skill Training Programs</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Develop in-demand skills with our curated training programs and courses
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search training programs, skills, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive">Error loading trainings: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Training Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTrainings.map((training, index) => (
                <motion.div
                  key={training.id}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: index * 0.1 }}
                  whileHover={prefersReducedMotion ? {} : { y: -2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-[box-shadow,border-color] duration-200 ease-out border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">{training.title || training.name}</CardTitle>
                          <CardDescription>{training.provider || training.organization}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{training.description}</p>

                      {(training.duration || training.level) && (
                        <div className="grid grid-cols-2 gap-3">
                          {training.duration && (
                            <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-xs font-medium">{training.duration}</span>
                            </div>
                          )}
                          {training.level && (
                            <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                              <Users className="h-4 w-4 text-secondary" />
                              <span className="text-xs font-medium">{training.level}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {training.skills && training.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-2">Skills Covered</p>
                          <div className="flex flex-wrap gap-1">
                            {training.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {training.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{training.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button className="w-full" onClick={() => handleEnroll(training.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {user ? "Start Quiz" : "Login to Enroll"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
                ))}
                {/* Show locked cards for free users */}
                {!isPro && lockedTrainings.length > 0 && (
                  <>
                    {lockedTrainings.slice(0, 3).map((training, index) => (
                      <motion.div
                        key={`locked-${training.id || index}`}
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: (visibleTrainings.length + index) * 0.1 }}
                        whileHover={prefersReducedMotion ? {} : { y: -2 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-[box-shadow,border-color] duration-200 ease-out border-2 hover:border-primary/20 relative overflow-hidden">
                          {/* Blurred Overlay */}
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 cursor-pointer"
                               onClick={() => setPaywallModalOpen(true)}>
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Lock className="h-8 w-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Upgrade to Unlock</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  See full training details and unlock all features
                                </p>
                                <Button onClick={() => setPaywallModalOpen(true)} className="bg-primary hover:bg-primary-hover text-primary-foreground">
                                  Upgrade to Pro
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Preview Content (blurred) - matches Training card structure */}
                          <CardHeader className="opacity-50 pointer-events-none">
                            <div className="flex items-start">
                              <div className="space-y-2">
                                <CardTitle className="text-xl">{training.title || training.name || "Training"}</CardTitle>
                                <CardDescription>{training.provider || training.organization || "Provider"}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 opacity-50 pointer-events-none">
                            <p className="text-sm text-muted-foreground">{training.description || "Training description"}</p>
                            {(training.duration || training.level) && (
                              <div className="grid grid-cols-2 gap-3">
                                {training.duration && (
                                  <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-medium">{training.duration}</span>
                                  </div>
                                )}
                                {training.level && (
                                  <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                                    <Users className="h-4 w-4 text-secondary" />
                                    <span className="text-xs font-medium">{training.level}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {training.skills && training.skills.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-2">Skills Covered</p>
                                <div className="flex flex-wrap gap-1">
                                  {training.skills.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {training.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{training.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            <Button className="w-full" disabled>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Start Quiz
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
              {!isPro && lockedTrainings.length > 0 && (
                <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 mt-6">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-bold">Unlock All Training Programs</h3>
                    <p className="text-muted-foreground">
                      You're viewing {visibleTrainings.length} free training program{visibleTrainings.length !== 1 ? 's' : ''}. Upgrade to Pro to see all {filteredTrainings.length} training programs.
                    </p>
                    <Button onClick={() => setPaywallModalOpen(true)} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Paywall Modal */}
          <ProPaywallModal open={paywallModalOpen} onOpenChange={setPaywallModalOpen} />

          {/* Empty State */}
          {!loading && !error && trainings.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No Training Programs Available"
              description="Training programs are currently being set up. Please check back soon or contact support if you believe this is an error."
            />
          )}

          {/* No Search Results */}
          {!loading && !error && trainings.length > 0 && filteredTrainings.length === 0 && (
            <EmptyState
              icon={Search}
              title="No Training Programs Found"
              description={`No training programs match "${searchTerm}". Try adjusting your search or filters.`}
              action={{
                label: "Clear Search",
                onClick: () => setSearchTerm(""),
                variant: "secondary"
              }}
            />
          )}
    </div>
  )
}
