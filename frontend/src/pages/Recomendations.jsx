import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Star,
  BookOpen,
  Target,
  Briefcase,
  Code,
  Stethoscope,
  Palette,
  Wrench,
  Beaker,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { recommendationService } from "@/services/recommendationService"
import { useAuth } from "@/context/AuthContext"
import { getUserStorageKey } from "@/utils/utils"

const categoryIconMap = {
  technology: Code,
  data: BarChart3,
  healthcare: Stethoscope,
  design: Palette,
  engineering: Wrench,
  science: Beaker,
  business: Briefcase,
  general: Target,
  media: BookOpen,
}

const categoryColorMap = {
  technology: "bg-blue-500",
  data: "bg-green-500",
  healthcare: "bg-red-500",
  design: "bg-purple-500",
  engineering: "bg-orange-500",
  science: "bg-teal-500",
  business: "bg-indigo-500",
  media: "bg-pink-500",
  general: "bg-gray-500",
}

const getConfidenceColor = (level) => {
  switch (level) {
    case "High":
      return "text-green-600 bg-green-100"
    case "Medium":
      return "text-yellow-600 bg-yellow-100"
    case "Low":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const CareerCard = ({ career, index }) => {
  const Icon = categoryIconMap[career.category] || Target
  const color = categoryColorMap[career.category] || "bg-gray-500"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="h-full border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{career.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getConfidenceColor(career.confidenceLevel)} border-0`}>
                    {career.confidenceLevel} Match
                  </Badge>
                  <span className="text-sm text-muted-foreground">{career.confidence}%</span>
                </div>
              </div>
            </div>
            <Star className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors cursor-pointer" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Match Confidence</span>
              <span className="font-medium">{career.confidence}%</span>
            </div>
            <Progress value={career.confidence} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">{career.description}</CardDescription>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Salary Range</span>
              </div>
              <span className="text-sm font-semibold">{career.salary}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Job Growth</span>
              </div>
              <span className="text-sm font-semibold text-green-600">{career.growth}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Key Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {career.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                Opportunities
              </h4>
              <div className="flex flex-wrap gap-1">
                {career.opportunities.map((opportunity) => (
                  <Badge key={opportunity} variant="outline" className="text-xs">
                    {opportunity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium mb-1">Why this matches you:</p>
            <p className="text-sm text-muted-foreground">{career.matchReason}</p>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1">Learn More</Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Save Career
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("grades")
  const [gradeRecs, setGradeRecs] = useState([])
  const [interestRecs, setInterestRecs] = useState([])
  const [gradeError, setGradeError] = useState(null)
  const [interestError, setInterestError] = useState(null)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingInterests, setLoadingInterests] = useState(false)
  const [analysisSummary, setAnalysisSummary] = useState(null)
  const [interestSummary, setInterestSummary] = useState(null)

  useEffect(() => {
    if (!user?.id) {
      // Don't load data if user is not logged in
      return
    }

    const analysisKey = getUserStorageKey("aiGradesAnalysis", user.id)
    const storedAnalysis = localStorage.getItem(analysisKey)
    if (storedAnalysis) {
      try {
        const parsed = JSON.parse(storedAnalysis)
        setAnalysisSummary(parsed)
        fetchGradeRecommendations(parsed)
      } catch (error) {
        console.error("Failed to parse stored analysis:", error)
        localStorage.removeItem(analysisKey)
      }
    }

    const interestsKey = getUserStorageKey("userInterests", user.id)
    const storedInterests = localStorage.getItem(interestsKey)
    if (storedInterests) {
      try {
        const parsed = JSON.parse(storedInterests)
        setInterestSummary(parsed)
        fetchInterestRecommendations(parsed)
      } catch (error) {
        console.error("Failed to parse stored interests:", error)
        localStorage.removeItem(interestsKey)
      }
    }
  }, [user?.id])

  const stats = useMemo(() => {
    const allRecs = [...gradeRecs, ...interestRecs]
    const total = allRecs.length
    const high = allRecs.filter((rec) => rec.confidenceLevel === "High").length
    const medium = allRecs.filter((rec) => rec.confidenceLevel === "Medium").length
    return { total, high, medium }
  }, [gradeRecs, interestRecs])

  const fetchGradeRecommendations = async (analysis) => {
    setLoadingGrades(true)
    setGradeError(null)
    try {
      const subjects =
        Array.isArray(analysis.subjects)
          ? analysis.subjects
              .map((subject) => {
                if (typeof subject === "string") return subject
                if (subject && typeof subject === "object") return subject.name
                return null
              })
              .filter(Boolean)
          : []

      const payload = {
        grade10: analysis.grade10 ?? null,
        grade12: analysis.grade12 ?? null,
        stream: analysis.stream || "general",
        subjects,
      }
      const response = await recommendationService.getByGrades(payload)
      setGradeRecs(response.data?.recommendations || [])
    } catch (error) {
      console.error("Failed to fetch grade recommendations:", error)
      setGradeError("Unable to load grade-based recommendations right now.")
    } finally {
      setLoadingGrades(false)
    }
  }

  const fetchInterestRecommendations = async (interests) => {
    setLoadingInterests(true)
    setInterestError(null)
    try {
      const response = await recommendationService.getByInterests(interests)
      setInterestRecs(response.data?.recommendations || [])
    } catch (error) {
      console.error("Failed to fetch interest recommendations:", error)
      setInterestError("Unable to load interest-based recommendations right now.")
    } finally {
      setLoadingInterests(false)
    }
  }

  return (
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
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold">Career Recommendations</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Discover career paths tailored to your academic performance and personal interests
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Matches", value: stats.total, icon: Target, color: "text-primary" },
              { label: "High Confidence", value: stats.high, icon: TrendingUp, color: "text-green-600" },
              { label: "Medium Confidence", value: stats.medium, icon: Clock, color: "text-yellow-600" },
              { label: "Saved Careers", value: "0", icon: Star, color: "text-accent" },
            ].map((stat) => (
              <Card key={stat.label} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Recommendations Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="grades" className="flex items-center space-x-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  <span>Based on Grades</span>
                </TabsTrigger>
                <TabsTrigger value="interests" className="flex items-center space-x-2 text-base">
                  <Target className="h-4 w-4" />
                  <span>Based on Interests</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grades" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Grade-Based Recommendations</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {gradeRecs.length} matches found
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    These careers align with your academic strengths and performance in core subjects.
                  </p>
                  {analysisSummary ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground">Grade 12</p>
                        <p className="text-lg font-semibold">{analysisSummary.grade12 ?? "—"}%</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground">Stream</p>
                        <p className="text-lg font-semibold capitalize">{analysisSummary.stream}</p>
                      </div>
                    </div>
                  ) : (
                    <AlertMessage message="Upload your marksheet on the Grades page to unlock AI-powered recommendations." />
                  )}
                </div>

                {loadingGrades ? (
                  <LoaderState />
                ) : gradeError ? (
                  <AlertMessage message={gradeError} />
                ) : gradeRecs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {gradeRecs.map((career, index) => (
                      <CareerCard key={career.id} career={career} index={index} />
                    ))}
                  </div>
                ) : (
                  <AlertMessage message="No grade-based recommendations yet. Upload a marksheet to get started." />
                )}
              </TabsContent>

              <TabsContent value="interests" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Interest-Based Recommendations</h2>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                      {interestRecs.length} matches found
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    These careers match your selected interests, activities, and preferred work environments.
                  </p>
                  {interestSummary ? (
                    <div className="flex flex-wrap gap-2">
                      {(interestSummary.careerFields || []).map((field) => (
                        <Badge key={field} variant="outline">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <AlertMessage message="Complete the Interests flow to personalize these recommendations." />
                  )}
                </div>

                {loadingInterests ? (
                  <LoaderState />
                ) : interestError ? (
                  <AlertMessage message={interestError} />
                ) : interestRecs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {interestRecs.map((career, index) => (
                      <CareerCard key={career.id} career={career} index={index} />
                    ))}
                  </div>
                ) : (
                  <AlertMessage message="No interest-based recommendations yet. Share your interests to continue." />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Explore Further?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover colleges that offer programs for your recommended careers and find skill training
                  opportunities to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="px-8" onClick={() => window.location.assign("/colleges")}>
                    <MapPin className="mr-2 h-5 w-5" />
                    Explore Colleges
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 bg-transparent"
                    onClick={() => window.location.assign("/trainings")}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Find Training Programs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

const AlertMessage = ({ message }) => (
  <Card className="border border-dashed bg-muted/30">
    <CardContent className="py-6 text-center text-sm text-muted-foreground">{message}</CardContent>
  </Card>
)

const LoaderState = () => (
  <div className="flex items-center justify-center py-12">
    <Sparkles className="h-6 w-6 animate-spin text-primary" />
    <span className="ml-2 text-sm text-muted-foreground">Generating recommendations…</span>
  </div>
)
