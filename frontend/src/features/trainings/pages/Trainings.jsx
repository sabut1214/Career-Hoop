import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { getAvailableTrainings } from "@/shared/lib/api"
import { useAuth } from "@/shared/context/AuthContext"
import { BookOpen, Clock, Users, Search, Loader, ExternalLink } from "lucide-react"

export default function TrainingPage() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()

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

  const handleEnroll = (trainingId) => {
    if (!user) {
      navigate("/login", { state: { redirectTo: `/quiz/start/${trainingId}` } })
      return
    }
    navigate(`/quiz/start/${trainingId}`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainings.map((training, index) => (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
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

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium">{training.duration || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium">{training.level || "All Levels"}</span>
                        </div>
                      </div>

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
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && trainings.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No training programs available.</p>
                <p className="text-sm text-muted-foreground">
                  Please ensure the backend is running and database migrations have been applied.
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Search Results */}
          {!loading && !error && trainings.length > 0 && filteredTrainings.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No training programs found matching "{searchTerm}".</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
    </div>
  )
}
